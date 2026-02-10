# 🎨 1Code Themes - Complete Theme System

> **Versão:** 1.0.0
> **Data:** Fevereiro 2026
> **Compatible with:** React + Tailwind CSS + VS Code Theme System

Este arquivo contém **11 temas completos** prontos para usar no seu projeto. Copie e cole!

---

## 📁 Arquivos Necessários para Funcionar

### 1. Tipo do Tema (`src/lib/themes/types.ts`)

```typescript
export type VSCodeFullTheme = {
  id: string
  name: string
  type: "light" | "dark"
  source: "builtin" | "imported" | "discovered"
  colors: Record<string, string>
  tokenColors?: any[]
  semanticHighlighting?: boolean
  semanticTokenColors?: Record<string, any>
  path?: string
}

export type ThemeType = "light" | "dark"
```

### 2. Mapeamento VS Code → CSS (`src/lib/themes/vscode-to-css.ts`)

```typescript
export const VSCODE_TO_CSS_MAP: Record<string, string[]> = {
  "--background": ["editor.background", "editorPane.background"],
  "--foreground": ["editor.foreground", "foreground"],
  "--primary": ["button.background", "focusBorder", "textLink.foreground"],
  "--primary-foreground": ["button.foreground"],
  "--card": ["sideBar.background", "panel.background"],
  "--card-foreground": ["sideBar.foreground", "foreground"],
  "--popover": ["dropdown.background", "menu.background"],
  "--popover-foreground": ["dropdown.foreground", "foreground"],
  "--secondary": ["button.secondaryBackground", "tab.inactiveBackground"],
  "--secondary-foreground": ["button.secondaryForeground"],
  "--muted": ["tab.inactiveBackground", "editorGroupHeader.tabsBackground"],
  "--muted-foreground": ["tab.inactiveForeground", "descriptionForeground"],
  "--accent": ["list.hoverBackground", "editor.selectionBackground"],
  "--selection": ["editor.selectionBackground"],
  "--border": ["panel.border", "sideBar.border", "input.border"],
  "--input": ["input.border", "panel.border"],
  "--input-background": ["input.background"],
  "--ring": ["focusBorder", "button.background"],
  "--destructive": ["errorForeground"],
  "--destructive-foreground": ["editorError.background"],
}

export function hexToHSL(hex: string): string {
  hex = hex.replace(/^#/, "")
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("")
  
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function generateCSSVariables(themeColors: Record<string, string>): Record<string, string> {
  const cssVariables: Record<string, string> = {}
  for (const [cssVar, priorityKeys] of Object.entries(VSCODE_TO_CSS_MAP)) {
    const color = priorityKeys.find(key => themeColors[key])
    if (color) cssVariables[cssVar] = hexToHSL(color)
  }
  return cssVariables
}

export function applyCSSVariables(variables: Record<string, string>): void {
  const root = document.documentElement
  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value)
  }
}

export function isLightColor(hex: string): boolean {
  hex = hex.replace(/^#/, "")
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("")
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return (r * 0.2126 + g * 0.7152 + b * 0.0722) > 128
}
```

---

## 🎨 Todos os Temas (11 Temas)

### Como Importar

```typescript
import { THEMES } from "./themes/all-themes"

const theme = THEMES.find(t => t.id === "21st-dark")
```

### Arquivo Completo de Temas (`src/lib/themes/all-themes.ts`)

```typescript
import type { VSCodeFullTheme } from "./types"

export const THEMES: VSCodeFullTheme[] = [
  // ========== 21ST THEMES (Default App Theme) ==========
  
  TWENTYFIRST_DARK,
  TWENTYFIRST_LIGHT,
  
  // ========== CURSOR THEMES ==========
  
  CURSOR_DARK,
  CURSOR_LIGHT,
  CURSOR_MIDNIGHT,
  
  // ========== CLAUDE THEMES ==========
  
  CLAUDE_DARK,
  CLAUDE_LIGHT,
  
  // ========== VESPER THEME ==========
  
  VESPER_DARK,
  
  // ========== VITESSE THEMES ==========
  
  VITESSE_DARK,
  VITESSE_LIGHT,
  
  // ========== MIN THEMES ==========
  
  MIN_DARK,
  MIN_LIGHT,
]

// ========== THEME DEFINITIONS ==========

const TWENTYFIRST_DARK: VSCodeFullTheme = {
  id: "21st-dark",
  name: "21st Dark",
  type: "dark",
  source: "builtin",
  colors: {
    "editor.background": "#0a0a0a",
    "editor.foreground": "#f4f4f5",
    "foreground": "#f4f4f5",
    "sideBar.background": "#121212",
    "sideBar.foreground": "#f4f4f5",
    "sideBar.border": "#27272a",
    "activityBar.background": "#0a0a0a",
    "activityBar.foreground": "#f4f4f5",
    "panel.background": "#121212",
    "panel.border": "#27272a",
    "tab.activeBackground": "#0a0a0a",
    "tab.inactiveBackground": "#18181b",
    "tab.inactiveForeground": "#a1a1aa",
    "editorGroupHeader.tabsBackground": "#18181b",
    "dropdown.background": "#171717",
    "dropdown.foreground": "#fafafa",
    "input.background": "#121212",
    "input.border": "#27272a",
    "input.foreground": "#f4f4f5",
    "focusBorder": "#0034ff",
    "textLink.foreground": "#0034ff",
    "textLink.activeForeground": "#3366ff",
    "list.activeSelectionBackground": "#27272a",
    "list.hoverBackground": "#18181b",
    "editor.selectionBackground": "#0034ff44",
    "editorLineNumber.foreground": "#52525b",
    "descriptionForeground": "#a1a1aa",
    "errorForeground": "#ef4444",
    "button.background": "#0034ff",
    "button.foreground": "#ffffff",
    "button.secondaryBackground": "#27272a",
    "button.secondaryForeground": "#fafafa",
    "terminal.background": "#0a0a0a",
    "terminal.foreground": "#f4f4f5",
  },
}

const TWENTYFIRST_LIGHT: VSCodeFullTheme = {
  id: "21st-light",
  name: "21st Light",
  type: "light",
  source: "builtin",
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#0a0a0a",
    "foreground": "#0a0a0a",
    "sideBar.background": "#FAFAFA",
    "sideBar.foreground": "#0a0a0a",
    "sideBar.border": "#e4e4e7",
    "activityBar.background": "#ffffff",
    "activityBar.foreground": "#0a0a0a",
    "panel.background": "#FAFAFA",
    "panel.border": "#e4e4e7",
    "tab.activeBackground": "#ffffff",
    "tab.inactiveBackground": "#f4f4f5",
    "tab.inactiveForeground": "#71717a",
    "editorGroupHeader.tabsBackground": "#f4f4f5",
    "dropdown.background": "#ffffff",
    "dropdown.foreground": "#0a0a0a",
    "input.background": "#FAFAFA",
    "input.border": "#e4e4e7",
    "input.foreground": "#0a0a0a",
    "focusBorder": "#0034ff",
    "textLink.foreground": "#0034ff",
    "textLink.activeForeground": "#0028cc",
    "list.activeSelectionBackground": "#f4f4f5",
    "list.hoverBackground": "#f4f4f5",
    "editor.selectionBackground": "#0034ff33",
    "editorLineNumber.foreground": "#a1a1aa",
    "descriptionForeground": "#71717a",
    "errorForeground": "#dc2626",
    "button.background": "#0034ff",
    "button.foreground": "#ffffff",
    "button.secondaryBackground": "#f4f4f5",
    "button.secondaryForeground": "#18181b",
    "terminal.background": "#fafafa",
    "terminal.foreground": "#0a0a0a",
  },
}

const CURSOR_DARK: VSCodeFullTheme = {
  id: "cursor-dark",
  name: "Cursor Dark",
  type: "dark",
  source: "builtin",
  colors: {
    "editor.background": "#181818",
    "editor.foreground": "#E4E4E4EB",
    "foreground": "#E4E4E4EB",
    "sideBar.background": "#141414",
    "sideBar.foreground": "#E4E4E48D",
    "sideBar.border": "#E4E4E413",
    "activityBar.background": "#141414",
    "activityBar.foreground": "#E4E4E48D",
    "activityBarBadge.background": "#88C0D0",
    "activityBarBadge.foreground": "#141414",
    "panel.background": "#141414",
    "panel.border": "#E4E4E413",
    "tab.activeBackground": "#181818",
    "tab.inactiveBackground": "#242424",
    "tab.inactiveForeground": "#E4E4E442",
    "dropdown.background": "#181818",
    "dropdown.foreground": "#E4E4E4EB",
    "input.background": "#E4E4E40A",
    "input.border": "#E4E4E413",
    "input.foreground": "#E4E4E4EB",
    "focusBorder": "#E4E4E426",
    "textLink.foreground": "#81A1C1",
    "list.activeSelectionBackground": "#E4E4E41E",
    "list.hoverBackground": "#E4E4E411",
    "editor.selectionBackground": "#40404099",
    "editorLineNumber.foreground": "#E4E4E442",
    "descriptionForeground": "#E4E4E48D",
    "errorForeground": "#E34671",
    "button.background": "#81A1C1",
    "button.foreground": "#191c22",
    "button.secondaryBackground": "#626262",
    "button.secondaryForeground": "#E4E4E4EB",
    "terminal.background": "#141414",
    "terminal.foreground": "#E4E4E4EB",
  },
}

const CURSOR_LIGHT: VSCodeFullTheme = {
  id: "cursor-light",
  name: "Cursor Light",
  type: "light",
  source: "builtin",
  colors: {
    "editor.background": "#FCFCFC",
    "editor.foreground": "#141414EB",
    "foreground": "#141414EB",
    "sideBar.background": "#F3F3F3",
    "sideBar.foreground": "#141414AD",
    "sideBar.border": "#14141413",
    "activityBar.background": "#F3F3F3",
    "activityBar.foreground": "#141414AD",
    "activityBarBadge.background": "#206595",
    "activityBarBadge.foreground": "#F3F3F3",
    "panel.background": "#F3F3F3",
    "panel.border": "#14141413",
    "tab.activeBackground": "#FCFCFC",
    "tab.inactiveBackground": "#F3F3F3",
    "tab.inactiveForeground": "#141414AD",
    "dropdown.background": "#FCFCFC",
    "dropdown.foreground": "#141414EB",
    "input.background": "#FCFCFC",
    "input.border": "#14141426",
    "input.foreground": "#141414EB",
    "focusBorder": "#14141426",
    "textLink.foreground": "#3C7CAB",
    "list.activeSelectionBackground": "#14141411",
    "list.hoverBackground": "#14141411",
    "editor.selectionBackground": "#1414141E",
    "editorLineNumber.foreground": "#1414147A",
    "descriptionForeground": "#141414AD",
    "errorForeground": "#CF2D56",
    "button.background": "#3C7CAB",
    "button.foreground": "#FCFCFC",
    "button.secondaryBackground": "#1414141E",
    "button.secondaryForeground": "#141414EB",
    "terminal.background": "#F3F3F3",
    "terminal.foreground": "#141414EB",
  },
}

const CURSOR_MIDNIGHT: VSCodeFullTheme = {
  id: "cursor-midnight",
  name: "Cursor Midnight",
  type: "dark",
  source: "builtin",
  colors: {
    "editor.background": "#1e2127",
    "editor.foreground": "#7b88a1",
    "foreground": "#7b88a1",
    "sideBar.background": "#191c22",
    "sideBar.foreground": "#7c818e",
    "sideBar.border": "#ffffff0d",
    "activityBar.background": "#191c22",
    "activityBar.foreground": "#7b88a1",
    "activityBarBadge.background": "#88c0d0",
    "activityBarBadge.foreground": "#1d2128",
    "panel.background": "#191c22",
    "panel.border": "#ffffff0d",
    "tab.activeBackground": "#1e2127",
    "tab.inactiveBackground": "#191c22",
    "tab.inactiveForeground": "#4b5163",
    "tab.activeForeground": "#d8dee9",
    "dropdown.background": "#191c22",
    "dropdown.foreground": "#d8dee9",
    "input.background": "#272c3655",
    "input.border": "#272c36",
    "input.foreground": "#d8dee9",
    "focusBorder": "#00000000",
    "textLink.foreground": "#8fbcbb",
    "list.activeSelectionBackground": "#21242b",
    "list.hoverBackground": "#272c3699",
    "editor.selectionBackground": "#434c5e99",
    "editorLineNumber.foreground": "#4c566a",
    "descriptionForeground": "#7b88a1",
    "errorForeground": "#bf616a",
    "button.background": "#88c0d0",
    "button.foreground": "#191c22",
    "button.secondaryBackground": "#434c5e",
    "button.secondaryForeground": "#d8dee9",
    "terminal.background": "#191c22",
    "terminal.foreground": "#d8dee9",
  },
}

const CLAUDE_DARK: VSCodeFullTheme = {
  id: "claude-dark",
  name: "Claude Dark",
  type: "dark",
  source: "builtin",
  colors: {
    "editor.background": "#262624",
    "editor.foreground": "#c9c5bc",
    "foreground": "#c9c5bc",
    "sideBar.background": "#262624",
    "sideBar.foreground": "#c9c5bc",
    "sideBar.border": "#3a3937",
    "activityBar.background": "#262624",
    "activityBar.foreground": "#c9c5bc",
    "panel.background": "#262624",
    "panel.border": "#3d3a36",
    "tab.activeBackground": "#262624",
    "tab.inactiveBackground": "#262624",
    "tab.inactiveForeground": "#8a857c",
    "editorGroupHeader.tabsBackground": "#232120",
    "dropdown.background": "#383633",
    "dropdown.foreground": "#c9c5bc",
    "input.background": "#232120",
    "input.border": "#4a4742",
    "input.foreground": "#c9c5bc",
    "focusBorder": "#D97857",
    "textLink.foreground": "#D97857",
    "list.activeSelectionBackground": "#3d3a36",
    "list.hoverBackground": "#353230",
    "editor.selectionBackground": "#D9785744",
    "editorLineNumber.foreground": "#6b6660",
    "descriptionForeground": "#8a857c",
    "errorForeground": "#ef4444",
    "button.background": "#D97857",
    "button.foreground": "#ffffff",
    "button.secondaryBackground": "#3d3a36",
    "button.secondaryForeground": "#c9c5bc",
    "terminal.background": "#262624",
    "terminal.foreground": "#c9c5bc",
  },
}

const CLAUDE_LIGHT: VSCodeFullTheme = {
  id: "claude-light",
  name: "Claude Light",
  type: "light",
  source: "builtin",
  colors: {
    "editor.background": "#FAF9F5",
    "editor.foreground": "#4a4538",
    "foreground": "#4a4538",
    "sideBar.background": "#FAF9F5",
    "sideBar.foreground": "#4a4538",
    "sideBar.border": "#e5e3de",
    "activityBar.background": "#FAF9F5",
    "activityBar.foreground": "#4a4538",
    "panel.background": "#FAF9F5",
    "panel.border": "#e5e3de",
    "tab.activeBackground": "#FAF9F5",
    "tab.inactiveBackground": "#f5f4f1",
    "tab.inactiveForeground": "#8b8578",
    "editorGroupHeader.tabsBackground": "#f5f4f1",
    "dropdown.background": "#ffffff",
    "dropdown.foreground": "#4a4538",
    "input.background": "#ffffff",
    "input.border": "#d5d3ce",
    "input.foreground": "#4a4538",
    "focusBorder": "#D97857",
    "textLink.foreground": "#D97857",
    "list.activeSelectionBackground": "#e8e5dd",
    "list.hoverBackground": "#f0ede7",
    "editor.selectionBackground": "#D9785733",
    "editorLineNumber.foreground": "#a5a193",
    "descriptionForeground": "#8b8578",
    "errorForeground": "#dc2626",
    "button.background": "#D97857",
    "button.foreground": "#ffffff",
    "button.secondaryBackground": "#e8e5dd",
    "button.secondaryForeground": "#4a4538",
    "terminal.background": "#FAF9F5",
    "terminal.foreground": "#4a4538",
  },
}

const VESPER_DARK: VSCodeFullTheme = {
  id: "vesper-dark",
  name: "Vesper",
  type: "dark",
  source: "builtin",
  colors: {
    "editor.background": "#101010",
    "editor.foreground": "#FFFFFF",
    "foreground": "#FFFFFF",
    "sideBar.background": "#101010",
    "sideBar.foreground": "#A0A0A0",
    "sideBar.border": "#232323",
    "activityBar.background": "#101010",
    "activityBar.foreground": "#A0A0A0",
    "activityBarBadge.background": "#FFC799",
    "activityBarBadge.foreground": "#000000",
    "panel.background": "#101010",
    "panel.border": "#232323",
    "tab.activeBackground": "#161616",
    "tab.inactiveBackground": "#101010",
    "tab.inactiveForeground": "#505050",
    "editorGroupHeader.tabsBackground": "#101010",
    "dropdown.background": "#161616",
    "dropdown.foreground": "#FFFFFF",
    "input.background": "#1B1B1B",
    "input.border": "#282828",
    "input.foreground": "#FFFFFF",
    "focusBorder": "#FFC799",
    "textLink.foreground": "#FFC799",
    "list.activeSelectionBackground": "#232323",
    "list.hoverBackground": "#282828",
    "editor.selectionBackground": "#FFFFFF25",
    "editorLineNumber.foreground": "#505050",
    "descriptionForeground": "#A0A0A0",
    "errorForeground": "#FF8080",
    "button.background": "#FFC799",
    "button.foreground": "#000000",
    "button.secondaryBackground": "#232323",
    "button.secondaryForeground": "#FFFFFF",
    "terminal.background": "#101010",
    "terminal.foreground": "#FFFFFF",
  },
}

const VITESSE_DARK: VSCodeFullTheme = {
  id: "vitesse-dark",
  name: "Vitesse Dark",
  type: "dark",
  source: "builtin",
  colors: {
    "editor.background": "#121212",
    "editor.foreground": "#dbd7ca",
    "foreground": "#dbd7ca",
    "sideBar.background": "#121212",
    "sideBar.foreground": "#dbd7ca",
    "sideBar.border": "#1e1e1e",
    "activityBar.background": "#121212",
    "activityBar.foreground": "#dbd7ca",
    "panel.background": "#121212",
    "panel.border": "#1e1e1e",
    "tab.activeBackground": "#1e1e1e",
    "tab.inactiveBackground": "#121212",
    "tab.inactiveForeground": "#75715e",
    "editorGroupHeader.tabsBackground": "#121212",
    "dropdown.background": "#1e1e1e",
    "dropdown.foreground": "#dbd7ca",
    "input.background": "#1e1e1e",
    "input.border": "#2e2e2e",
    "input.foreground": "#dbd7ca",
    "focusBorder": "#4d9375",
    "textLink.foreground": "#4d9375",
    "list.activeSelectionBackground": "#4d937530",
    "list.hoverBackground": "#1e1e1e",
    "editor.selectionBackground": "#4d937540",
    "editorLineNumber.foreground": "#444444",
    "descriptionForeground": "#75715e",
    "errorForeground": "#cb7676",
    "button.background": "#4d9375",
    "button.foreground": "#121212",
    "button.secondaryBackground": "#2e2e2e",
    "button.secondaryForeground": "#dbd7ca",
    "terminal.background": "#121212",
    "terminal.foreground": "#dbd7ca",
  },
}

const VITESSE_LIGHT: VSCodeFullTheme = {
  id: "vitesse-light",
  name: "Vitesse Light",
  type: "light",
  source: "builtin",
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#393a34",
    "foreground": "#393a34",
    "sideBar.background": "#fafafa",
    "sideBar.foreground": "#393a34",
    "sideBar.border": "#eeeeee",
    "activityBar.background": "#fafafa",
    "activityBar.foreground": "#393a34",
    "panel.background": "#fafafa",
    "panel.border": "#eeeeee",
    "tab.activeBackground": "#ffffff",
    "tab.inactiveBackground": "#fafafa",
    "tab.inactiveForeground": "#999999",
    "editorGroupHeader.tabsBackground": "#fafafa",
    "dropdown.background": "#ffffff",
    "dropdown.foreground": "#393a34",
    "input.background": "#f5f5f5",
    "input.border": "#eeeeee",
    "input.foreground": "#393a34",
    "focusBorder": "#1e754f",
    "textLink.foreground": "#1e754f",
    "list.activeSelectionBackground": "#eeeeee66",
    "list.hoverBackground": "#f5f5f5",
    "editor.selectionBackground": "#22222215",
    "editorLineNumber.foreground": "#aaaaaa",
    "descriptionForeground": "#999999",
    "errorForeground": "#ab5959",
    "button.background": "#1e754f",
    "button.foreground": "#ffffff",
    "button.secondaryBackground": "#eeeeee",
    "button.secondaryForeground": "#393a34",
    "terminal.background": "#fafafa",
    "terminal.foreground": "#393a34",
  },
}

const MIN_DARK: VSCodeFullTheme = {
  id: "min-dark",
  name: "Min Dark",
  type: "dark",
  source: "builtin",
  colors: {
    "editor.background": "#1f1f1f",
    "editor.foreground": "#d4d4d4",
    "foreground": "#d4d4d4",
    "sideBar.background": "#181818",
    "sideBar.foreground": "#d4d4d4",
    "sideBar.border": "#252525",
    "activityBar.background": "#181818",
    "activityBar.foreground": "#d4d4d4",
    "panel.background": "#1f1f1f",
    "panel.border": "#252525",
    "tab.activeBackground": "#1f1f1f",
    "tab.inactiveBackground": "#181818",
    "tab.inactiveForeground": "#6e6e6e",
    "editorGroupHeader.tabsBackground": "#181818",
    "dropdown.background": "#252525",
    "dropdown.foreground": "#d4d4d4",
    "input.background": "#181818",
    "input.border": "#3c3c3c",
    "input.foreground": "#d4d4d4",
    "focusBorder": "#6ca1ef",
    "textLink.foreground": "#6ca1ef",
    "list.activeSelectionBackground": "#2a2a2a",
    "list.hoverBackground": "#252525",
    "editor.selectionBackground": "#264f78",
    "editorLineNumber.foreground": "#5a5a5a",
    "descriptionForeground": "#6e6e6e",
    "errorForeground": "#f48771",
    "button.background": "#6ca1ef",
    "button.foreground": "#1f1f1f",
    "button.secondaryBackground": "#3c3c3c",
    "button.secondaryForeground": "#d4d4d4",
    "terminal.background": "#1f1f1f",
    "terminal.foreground": "#d4d4d4",
  },
}

const MIN_LIGHT: VSCodeFullTheme = {
  id: "min-light",
  name: "Min Light",
  type: "light",
  source: "builtin",
  colors: {
    "editor.background": "#ffffff",
    "editor.foreground": "#1f1f1f",
    "foreground": "#1f1f1f",
    "sideBar.background": "#f3f3f3",
    "sideBar.foreground": "#1f1f1f",
    "sideBar.border": "#e0e0e0",
    "activityBar.background": "#f3f3f3",
    "activityBar.foreground": "#1f1f1f",
    "panel.background": "#f3f3f3",
    "panel.border": "#e0e0e0",
    "tab.activeBackground": "#ffffff",
    "tab.inactiveBackground": "#f3f3f3",
    "tab.inactiveForeground": "#717171",
    "editorGroupHeader.tabsBackground": "#f3f3f3",
    "dropdown.background": "#ffffff",
    "dropdown.foreground": "#1f1f1f",
    "input.background": "#f3f3f3",
    "input.border": "#cecece",
    "input.foreground": "#1f1f1f",
    "focusBorder": "#0451a5",
    "textLink.foreground": "#0451a5",
    "list.activeSelectionBackground": "#e8e8e8",
    "list.hoverBackground": "#f3f3f3",
    "editor.selectionBackground": "#add6ff",
    "editorLineNumber.foreground": "#6e7681",
    "descriptionForeground": "#717171",
    "errorForeground": "#d32f2f",
    "button.background": "#0451a5",
    "button.foreground": "#ffffff",
    "button.secondaryBackground": "#e0e0e0",
    "button.secondaryForeground": "#1f1f1f",
    "terminal.background": "#f3f3f3",
    "terminal.foreground": "#1f1f1f",
  },
}

// Helper functions
export function getThemeById(id: string): VSCodeFullTheme | undefined {
  return THEMES.find(t => t.id === id)
}

export function getThemesByType(type: "light" | "dark"): VSCodeFullTheme[] {
  return THEMES.filter(t => t.type === type)
}

export const DEFAULT_LIGHT_THEME = "21st-light"
export const DEFAULT_DARK_THEME = "21st-dark"
```

---

## 🔧 Como Usar no Seu Projeto

### 1. Instale as dependências

```bash
npm install jotai next-themes
```

### 2. Crie o Theme Context

```tsx
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { getThemeById, generateCSSVariables, applyCSSVariables, isLightColor, type VSCodeFullTheme } from "@/lib/themes"

type ThemeContextType = {
  currentTheme: VSCodeFullTheme | null
  setTheme: (themeId: string) => void
  themes: VSCodeFullTheme[]
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<VSCodeFullTheme | null>(null)
  const { setTheme: setNextTheme, resolvedTheme } = useNextThemes()

  const handleSetTheme = (themeId: string) => {
    const theme = getThemeById(themeId)
    if (theme) {
      setCurrentTheme(theme)
      const cssVars = generateCSSVariables(theme.colors)
      applyCSSVariables(cssVars)
      
      const type = isLightColor(theme.colors["editor.background"]) ? "light" : "dark"
      document.documentElement.classList.toggle("dark", type === "dark")
      setNextTheme(type)
    }
  }

  // Apply default theme on mount
  useEffect(() => {
    handleSetTheme("21st-dark")
  }, [])

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeContext.Provider value={{
        currentTheme,
        setTheme: handleSetTheme,
        themes: [],
      }}>
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useThemeContext must be used within ThemeProvider")
  return context
}
```

### 3. Use no seu app

```tsx
// src/App.tsx
import { ThemeProvider } from "@/contexts/ThemeContext"
import { THEMES, getThemeById } from "@/lib/themes/all-themes"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

function App() {
  const { setTheme } = useThemeContext()

  return (
    <Select onValueChange={setTheme} defaultValue="21st-dark">
      <SelectTrigger>
        <SelectValue placeholder="Selecione um tema" />
      </SelectTrigger>
      <SelectContent>
        <div className="text-xs text-muted-foreground px-2 py-1">Dark Themes</div>
        {THEMES.filter(t => t.type === "dark").map(theme => (
          <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
        ))}
        <div className="text-xs text-muted-foreground px-2 py-1 mt-2">Light Themes</div>
        {THEMES.filter(t => t.type === "light").map(theme => (
          <SelectItem key={theme.id} value={theme.id}>{theme.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

---

## 📊 Resumo dos Temas

| ID | Nome | Tipo | Cor de Destaque |
|-----|-------|-------|-----------------|
| 21st-dark | 21st Dark | Dark | Azul #0034FF |
| 21st-light | 21st Light | Light | Azul #0034FF |
| cursor-dark | Cursor Dark | Dark | Azul #81A1C1 |
| cursor-light | Cursor Light | Light | Azul #3C7CAB |
| cursor-midnight | Cursor Midnight | Dark | Ciano #88C0D0 |
| claude-dark | Claude Dark | Dark | Laranja #D97857 |
| claude-light | Claude Light | Light | Laranja #D97857 |
| vesper-dark | Vesper | Dark | Laranja #FFC799 |
| vitesse-dark | Vitesse Dark | Dark | Verde #4D9375 |
| vitesse-light | Vitesse Light | Light | Verde #1E754F |
| min-dark | Min Dark | Dark | Azul #6CA1EF |
| min-light | Min Light | Light | Azul #0451A5 |

---

**Última atualização:** Fevereiro 2026
