import { useAtom } from "jotai"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  analyticsOptOutAtom,
  autoAdvanceTargetAtom,
  ctrlTabTargetAtom,
  defaultAgentModeAtom,
  desktopNotificationsEnabledAtom,
  extendedThinkingEnabledAtom,
  notifyWhenFocusedAtom,
  soundNotificationsEnabledAtom,
  preferredEditorAtom,
  type AgentMode,
  type AutoAdvanceTarget,
  type CtrlTabTarget,
} from "../../../lib/atoms"
import { APP_META, type ExternalApp } from "../../../../shared/external-apps"

// Editor icon imports
import cursorIcon from "../../../assets/app-icons/cursor.svg"
import vscodeIcon from "../../../assets/app-icons/vscode.svg"
import vscodeInsidersIcon from "../../../assets/app-icons/vscode-insiders.svg"
import zedIcon from "../../../assets/app-icons/zed.png"
import sublimeIcon from "../../../assets/app-icons/sublime.svg"
import xcodeIcon from "../../../assets/app-icons/xcode.svg"
import intellijIcon from "../../../assets/app-icons/intellij.svg"
import webstormIcon from "../../../assets/app-icons/webstorm.svg"
import pycharmIcon from "../../../assets/app-icons/pycharm.svg"
import phpstormIcon from "../../../assets/app-icons/phpstorm.svg"
import golandIcon from "../../../assets/app-icons/goland.svg"
import clionIcon from "../../../assets/app-icons/clion.svg"
import riderIcon from "../../../assets/app-icons/rider.svg"
import fleetIcon from "../../../assets/app-icons/fleet.svg"
import rustroverIcon from "../../../assets/app-icons/rustrover.svg"
import windsurfIcon from "../../../assets/app-icons/windsurf.svg"
import traeIcon from "../../../assets/app-icons/trae.svg"
import itermIcon from "../../../assets/app-icons/iterm.png"
import warpIcon from "../../../assets/app-icons/warp.png"
import terminalIcon from "../../../assets/app-icons/terminal.png"
import ghosttyIcon from "../../../assets/app-icons/ghostty.svg"

const EDITOR_ICONS: Partial<Record<ExternalApp, string>> = {
  cursor: cursorIcon,
  vscode: vscodeIcon,
  "vscode-insiders": vscodeInsidersIcon,
  zed: zedIcon,
  windsurf: windsurfIcon,
  sublime: sublimeIcon,
  xcode: xcodeIcon,
  trae: traeIcon,
  iterm: itermIcon,
  warp: warpIcon,
  terminal: terminalIcon,
  ghostty: ghosttyIcon,
  intellij: intellijIcon,
  webstorm: webstormIcon,
  pycharm: pycharmIcon,
  phpstorm: phpstormIcon,
  goland: golandIcon,
  clion: clionIcon,
  rider: riderIcon,
  fleet: fleetIcon,
  rustrover: rustroverIcon,
}

interface EditorOption {
  id: ExternalApp
  label: string
}

// Order matches Superset: editors, terminals, VS Code, JetBrains
const EDITORS: EditorOption[] = [
  { id: "cursor", label: "Cursor" },
  { id: "zed", label: "Zed" },
  { id: "sublime", label: "Sublime Text" },
  { id: "xcode", label: "Xcode" },
  { id: "windsurf", label: "Windsurf" },
  { id: "trae", label: "Trae" },
]

const TERMINALS: EditorOption[] = [
  { id: "iterm", label: "iTerm" },
  { id: "warp", label: "Warp" },
  { id: "terminal", label: "Terminal" },
  { id: "ghostty", label: "Ghostty" },
]

const VSCODE: EditorOption[] = [
  { id: "vscode", label: "VS Code" },
  { id: "vscode-insiders", label: "VS Code Insiders" },
]

const JETBRAINS: EditorOption[] = [
  { id: "intellij", label: "IntelliJ IDEA" },
  { id: "webstorm", label: "WebStorm" },
  { id: "pycharm", label: "PyCharm" },
  { id: "phpstorm", label: "PhpStorm" },
  { id: "goland", label: "GoLand" },
  { id: "clion", label: "CLion" },
  { id: "rider", label: "Rider" },
  { id: "fleet", label: "Fleet" },
  { id: "rustrover", label: "RustRover" },
]
import vscodeBaseIcon from "../../../assets/app-icons/vscode.svg"
import jetbrainsBaseIcon from "../../../assets/app-icons/jetbrains.svg"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { Switch } from "../../ui/switch"
import { trpc } from "../../../lib/trpc"

// Hook to detect narrow screen
function useIsNarrowScreen(): boolean {
  const [isNarrow, setIsNarrow] = useState(false)

  useEffect(() => {
    const checkWidth = () => {
      setIsNarrow(window.innerWidth <= 768)
    }

    checkWidth()
    window.addEventListener("resize", checkWidth)
    return () => window.removeEventListener("resize", checkWidth)
  }, [])

  return isNarrow
}

export function AgentsPreferencesTab() {
  const { t } = useTranslation("settings")
  const [thinkingEnabled, setThinkingEnabled] = useAtom(
    extendedThinkingEnabledAtom,
  )
  const [soundEnabled, setSoundEnabled] = useAtom(soundNotificationsEnabledAtom)
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useAtom(desktopNotificationsEnabledAtom)
  const [notifyWhenFocused, setNotifyWhenFocused] = useAtom(notifyWhenFocusedAtom)
  const [analyticsOptOut, setAnalyticsOptOut] = useAtom(analyticsOptOutAtom)
  const [ctrlTabTarget, setCtrlTabTarget] = useAtom(ctrlTabTargetAtom)
  const [autoAdvanceTarget, setAutoAdvanceTarget] = useAtom(autoAdvanceTargetAtom)
  const [defaultAgentMode, setDefaultAgentMode] = useAtom(defaultAgentModeAtom)
  const [preferredEditor, setPreferredEditor] = useAtom(preferredEditorAtom)
  const isNarrowScreen = useIsNarrowScreen()

  // Co-authored-by setting from Claude settings.json
  const { data: includeCoAuthoredBy, refetch: refetchCoAuthoredBy } =
    trpc.claudeSettings.getIncludeCoAuthoredBy.useQuery()
  const setCoAuthoredByMutation =
    trpc.claudeSettings.setIncludeCoAuthoredBy.useMutation({
      onSuccess: () => {
        refetchCoAuthoredBy()
      },
    })

  const handleCoAuthoredByToggle = (enabled: boolean) => {
    setCoAuthoredByMutation.mutate({ enabled })
  }

  // Sync opt-out status to main process
  const handleAnalyticsToggle = async (optedOut: boolean) => {
    setAnalyticsOptOut(optedOut)
    // Notify main process
    try {
      await window.desktopApi?.setAnalyticsOptOut(optedOut)
    } catch (error) {
      console.error("Failed to sync analytics opt-out to main process:", error)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header - hidden on narrow screens since it's in the navigation bar */}
      {!isNarrowScreen && (
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h3 className="text-sm font-semibold text-foreground">{t("preferences.title")}</h3>
          <p className="text-xs text-muted-foreground">
            {t("preferences.subtitle")}
          </p>
        </div>
      )}

      {/* Agent Behavior */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.extendedThinking.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.extendedThinking.description")}{" "}
              <span className="text-foreground/70">{t("preferences.extendedThinking.note")}</span>
            </span>
          </div>
          <Switch
            checked={thinkingEnabled}
            onCheckedChange={setThinkingEnabled}
          />
        </div>
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.defaultMode.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.defaultMode.description")}
            </span>
          </div>
          <Select
            value={defaultAgentMode}
            onValueChange={(value: AgentMode) => setDefaultAgentMode(value)}
          >
            <SelectTrigger className="w-auto px-2">
              <span className="text-xs">
                {defaultAgentMode === "agent"
                  ? t("preferences.defaultMode.agent")
                  : t("preferences.defaultMode.plan")}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="agent">{t("preferences.defaultMode.agent")}</SelectItem>
              <SelectItem value="plan">{t("preferences.defaultMode.plan")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.coAuthoredBy.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.coAuthoredBy.description")}
            </span>
          </div>
          <Switch
            checked={includeCoAuthoredBy ?? true}
            onCheckedChange={handleCoAuthoredByToggle}
            disabled={setCoAuthoredByMutation.isPending}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.desktopNotifications.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.desktopNotifications.description")}
            </span>
          </div>
          <Switch checked={desktopNotificationsEnabled} onCheckedChange={setDesktopNotificationsEnabled} />
        </div>
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.soundNotifications.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.soundNotifications.description")}
            </span>
          </div>
          <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
        </div>
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.notifyWhenFocused.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.notifyWhenFocused.description")}
            </span>
          </div>
          <Switch
            checked={notifyWhenFocused}
            onCheckedChange={setNotifyWhenFocused}
            disabled={!desktopNotificationsEnabled}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.quickSwitch.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.quickSwitch.description")}
            </span>
          </div>
          <Select
            value={ctrlTabTarget}
            onValueChange={(value: CtrlTabTarget) => setCtrlTabTarget(value)}
          >
            <SelectTrigger className="w-auto px-2">
              <span className="text-xs">
                {ctrlTabTarget === "workspaces"
                  ? t("preferences.quickSwitch.workspaces")
                  : t("preferences.quickSwitch.agents")}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workspaces">{t("preferences.quickSwitch.workspaces")}</SelectItem>
              <SelectItem value="agents">{t("preferences.quickSwitch.agents")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.autoAdvance.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.autoAdvance.description")}
            </span>
          </div>
          <Select
            value={autoAdvanceTarget}
            onValueChange={(value: AutoAdvanceTarget) => setAutoAdvanceTarget(value)}
          >
            <SelectTrigger className="w-auto px-2">
              <span className="text-xs">
                {autoAdvanceTarget === "next"
                  ? t("preferences.autoAdvance.next")
                  : autoAdvanceTarget === "previous"
                    ? t("preferences.autoAdvance.previous")
                    : t("preferences.autoAdvance.close")}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">{t("preferences.autoAdvance.next")}</SelectItem>
              <SelectItem value="previous">{t("preferences.autoAdvance.previous")}</SelectItem>
              <SelectItem value="close">{t("preferences.autoAdvance.close")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.preferredEditor.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.preferredEditor.description")}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {EDITOR_ICONS[preferredEditor] && (
                  <img
                    src={EDITOR_ICONS[preferredEditor]}
                    alt=""
                    className="h-4 w-4 flex-shrink-0"
                  />
                )}
                <span className="truncate">
                  {APP_META[preferredEditor].label}
                </span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {EDITORS.map((editor) => (
                <DropdownMenuItem
                  key={editor.id}
                  onClick={() => setPreferredEditor(editor.id)}
                  className="flex items-center gap-2"
                >
                  {EDITOR_ICONS[editor.id] ? (
                    <img src={EDITOR_ICONS[editor.id]} alt="" className="h-4 w-4 flex-shrink-0 object-contain" />
                  ) : (
                    <div className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{editor.label}</span>
                </DropdownMenuItem>
              ))}
              {TERMINALS.map((app) => (
                <DropdownMenuItem
                  key={app.id}
                  onClick={() => setPreferredEditor(app.id)}
                  className="flex items-center gap-2"
                >
                  {EDITOR_ICONS[app.id] ? (
                    <img src={EDITOR_ICONS[app.id]} alt="" className="h-4 w-4 flex-shrink-0 object-contain" />
                  ) : (
                    <div className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{app.label}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <img src={vscodeBaseIcon} alt="" className="h-4 w-4 flex-shrink-0 object-contain" />
                  <span>{t("preferences.preferredEditor.groups.vscode")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48" sideOffset={6} alignOffset={-4}>
                  {VSCODE.map((app) => (
                    <DropdownMenuItem
                      key={app.id}
                      onClick={() => setPreferredEditor(app.id)}
                      className="flex items-center gap-2"
                    >
                      {EDITOR_ICONS[app.id] ? (
                        <img src={EDITOR_ICONS[app.id]} alt="" className="h-4 w-4 flex-shrink-0 object-contain" />
                      ) : (
                        <div className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span>{app.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <img src={jetbrainsBaseIcon} alt="" className="h-4 w-4 flex-shrink-0 object-contain" />
                  <span>{t("preferences.preferredEditor.groups.jetbrains")}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48 max-h-[300px] overflow-y-auto" sideOffset={6} alignOffset={-4}>
                  {JETBRAINS.map((app) => (
                    <DropdownMenuItem
                      key={app.id}
                      onClick={() => setPreferredEditor(app.id)}
                      className="flex items-center gap-2"
                    >
                      {EDITOR_ICONS[app.id] ? (
                        <img src={EDITOR_ICONS[app.id]} alt="" className="h-4 w-4 flex-shrink-0 object-contain" />
                      ) : (
                        <div className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span>{app.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between gap-6 p-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {t("preferences.privacy.analytics.label")}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("preferences.privacy.analytics.description")}
            </span>
          </div>
          <Switch
            checked={!analyticsOptOut}
            onCheckedChange={(enabled) => handleAnalyticsToggle(!enabled)}
          />
        </div>
      </div>
    </div>
  )
}
