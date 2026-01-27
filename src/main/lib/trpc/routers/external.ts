import { shell } from "electron";
import { spawn, spawnSync } from "node:child_process";
import * as os from "node:os";
import * as path from "node:path";
import { z } from "zod";
import { publicProcedure, router } from "../index";

function expandTilde(filePath: string): string {
  if (filePath.startsWith("~/") || filePath === "~") {
    return path.join(os.homedir(), filePath.slice(1));
  }
  return filePath;
}

/**
 * Check if a command exists in PATH
 */
function commandExists(cmd: string): boolean {
  try {
    const checkCmd = process.platform === "win32" ? "where" : "which";
    const result = spawnSync(checkCmd, [cmd], { stdio: "ignore" });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * External router for shell operations (open in finder, open in editor, etc.)
 */
export const externalRouter = router({
  openInFinder: publicProcedure
    .input(z.string())
    .mutation(async ({ input: inputPath }) => {
      const expandedPath = expandTilde(inputPath);
      shell.showItemInFolder(expandedPath);
      return { success: true };
    }),

  openFileInEditor: publicProcedure
    .input(
      z.object({
        path: z.string(),
        cwd: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { path: filePath, cwd } = input;

      // Try common code editors in order of preference
      const editors = [
        { cmd: "code", args: [filePath] }, // VS Code
        { cmd: "cursor", args: [filePath] }, // Cursor
        { cmd: "subl", args: [filePath] }, // Sublime Text
        { cmd: "atom", args: [filePath] }, // Atom
      ];

      for (const editor of editors) {
        // Check if the command exists before trying to spawn
        if (!commandExists(editor.cmd)) {
          continue;
        }

        try {
          const child = spawn(editor.cmd, editor.args, {
            cwd: cwd || undefined,
            detached: true,
            stdio: "ignore",
          });
          child.unref();
          return { success: true, editor: editor.cmd };
        } catch {
          // Try next editor
          continue;
        }
      }

      // Fallback: use shell.openPath which opens with default app
      await shell.openPath(filePath);
      return { success: true, editor: "default" };
    }),

  openExternal: publicProcedure
    .input(z.string())
    .mutation(async ({ input: url }) => {
      await shell.openExternal(url);
      return { success: true };
    }),
});
