# 📘 Sistema UI/UX 1Code - Documentação Completa para Replicação

> **Versão:** 0.0.24
> **Data:** Fevereiro 2026
> **Projeto Base:** 1Code Desktop (Electron + React 19)

Esta documentação contém **TUDO** que você precisa para replicar o sistema UI/UX do 1Code em qualquer outro projeto (React, Next.js, Electron, etc.).

---

## 🎯 O Que Está Incluído

| Categoria | O Que Tem |
|-----------|-----------|
| **🎨 Tokens de Design** | Cores HSL, CSS Variables, Dark/Light mode |
| **🧩 Componentes UI** | 16 componentes prontos (Button, Input, Dialog, etc.) |
| **📦 Bibliotecas** | 25+ dependências com versões exatas |
| **🎭 Sistema de Temas** | 11 temas builtin + suporte a temas VS Code |
| **🔄 Estado** | Jotai, Zustand, React Query |
| **✨ Animações** | Motion (Framer Motion fork) + Tailwind Animate |
| **📱 Responsividade** | Breakpoints e padrões de layout |

---

## 📋 Índice

1. [Stack Tecnológico Completo](#1-stack-tecnológico)
2. [Instalação Passo a Passo](#2-setup-inicial)
3. [Tokens de Design (Cores)](#3-sistema-de-cores-e-temas)
4. [Todos os Componentes UI](#4-componentes-ui)
5. [Padrões de Estilização](#5-padrões-de-estilização)
6. [Layouts e Responsividade](#6-layouts-e-responsividade)
7. [Animações](#7-animações)
8. [Gerenciamento de Estado](#8-gerenciamento-de-estado)
9. [Tipografia e Ícones](#9-tipografia-e-ícones)
10. [Estrutura de Diretórios](#10-estrutura-de-diretórios)
11. [Sistema de Temas Avançado](#11-sistema-de-temas-avançado)
12. [Quick Start (Copy-Paste)](#12-quick-start)
13. [Checklists Completos](#13-checklists)

---

## 1. Stack Tecnológico

### 🎨 Framework e Ferramentas UI

```json
{
  "react": "19.2.1",
  "react-dom": "19.2.1",
  "typescript": "^5.4.5",
  "tailwindcss": "^3.4.17",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.5.1"
}
```

### 🧩 Bibliotecas de Componentes

```json
{
  "@radix-ui/react-accordion": "^1.2.11",
  "@radix-ui/react-alert-dialog": "^1.1.1",
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-collapsible": "^1.1.12",
  "@radix-ui/react-context-menu": "^2.2.16",
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-dropdown-menu": "^2.1.16",
  "@radix-ui/react-hover-card": "^1.1.14",
  "@radix-ui/react-icons": "^1.3.2",
  "@radix-ui/react-label": "^2.1.8",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-progress": "^1.1.8",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-slot": "^1.2.4",
  "@radix-ui/react-switch": "^1.2.6",
  "@radix-ui/react-tabs": "^1.1.13",
  "@radix-ui/react-tooltip": "^1.2.8"
}
```

### 🎭 Styling e Variantes

```json
{
  "tailwindcss-animate": "^1.0.7",
  "@tailwindcss/typography": "^0.5.19",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

### ✨ Animações e Temas

```json
{
  "motion": "^11.15.0",
  "next-themes": "^0.4.4",
  "sonner": "^1.7.1"
}
```

### 🎯 Estado

```json
{
  "jotai": "^2.11.1",
  "zustand": "^5.0.3",
  "@tanstack/react-query": "^5.90.10"
}
```

### 🎨 Ícones

```json
{
  "lucide-react": "^0.468.0",
  "react-icons": "^5.5.0"
}
```

---

## 2. Setup Inicial

### Passo 1: Instalação de Dependências

```bash
# Core do projeto
npm install react@19.2.1 react-dom@19.2.1
npm install -D typescript@5.4.5

# Tailwind CSS
npm install -D tailwindcss@3.4.17 postcss autoprefixer
npm install tailwindcss-animate@1.0.7 @tailwindcss/typography@0.5.19
npm install tailwind-merge@2.6.0

# Radix UI (componentes completos)
npm install @radix-ui/react-accordion@^1.2.11
npm install @radix-ui/react-alert-dialog@^1.1.1
npm install @radix-ui/react-checkbox@^1.3.3
npm install @radix-ui/react-collapsible@^1.1.12
npm install @radix-ui/react-context-menu@^2.2.16
npm install @radix-ui/react-dialog@^1.1.15
npm install @radix-ui/react-dropdown-menu@^2.1.16
npm install @radix-ui/react-hover-card@^1.1.14
npm install @radix-ui/react-icons@^1.3.2
npm install @radix-ui/react-label@^2.1.8
npm install @radix-ui/react-popover@^1.1.15
npm install @radix-ui/react-progress@^1.1.8
npm install @radix-ui/react-select@^2.2.6
npm install @radix-ui/react-slot@^1.2.4
npm install @radix-ui/react-switch@^1.2.6
npm install @radix-ui/react-tabs@^1.1.13
npm install @radix-ui/react-tooltip@^1.2.8

# Utilities
npm install class-variance-authority@0.7.1 clsx@2.1.1

# Animações e Temas
npm install motion@11.15.0 next-themes@0.4.4 sonner@1.7.1

# Estado
npm install jotai@2.11.1 zustand@5.0.3
npm install @tanstack/react-query@5.90.10

# Ícones
npm install lucide-react@0.468.0 react-icons@5.5.0
```

### Passo 2: Configurar Tailwind

**`tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Customizadas (opcional - adapte ao seu projeto)
        "tl-background": "hsl(var(--tl-background))",
        "input-background": "hsl(var(--input-background))",
        "plan-mode": {
          DEFAULT: "hsl(var(--plan-mode))",
          foreground: "hsl(var(--plan-mode-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate")
  ],
}
```

**`postcss.config.js`**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Passo 3: CSS Global

**`src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Layout Base */
    --background: 0 0% 100%;           /* Branco #FFFFFF */
    --foreground: 240 10% 3.9%;        /* Cinza escuro quase preto */

    /* Cards */
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;

    /* Popovers/Dropdowns */
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;

    /* Tema Brand - CUSTOMIZAR PARA SUA MARCA */
    --primary: 228 100% 50%;           /* Azul vibrante #0034FF */
    --primary-foreground: 0 0% 100%;   /* Branco sobre primary */

    /* Secundário */
    --secondary: 240 4.8% 95.9%;       /* Cinza claro */
    --secondary-foreground: 240 5.9% 10%;

    /* Muted (desabilitado, placeholder) */
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;

    /* Accent (hover states) */
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;

    /* Erro/Destruir */
    --destructive: 0 84.2% 60.2%;      /* Vermelho #F75050 */
    --destructive-foreground: 0 0% 98%;

    /* Bordas e Inputs */
    --border: 240 5.9% 90%;            /* Cinza muito claro */
    --input: 240 5.9% 90%;
    --input-background: 240 4.8% 95.9%;

    /* Focus ring */
    --ring: 228 100% 50%;              /* Azul primary */

    /* Seleção de texto */
    --selection: 228 100% 50% / 0.25;  /* Primary com 25% opacity */

    /* Border radius padrão */
    --radius: 0.5rem;                  /* 8px */

    /* Customizadas - ADAPTE AO SEU PROJETO */
    --plan-mode: 33 83% 67%;
    --plan-mode-foreground: 0 0% 8%;
    --tl-background: 0 0% 98%;
  }

  .dark {
    /* Layout Base */
    --background: 240 10% 3.9%;        /* Cinza muito escuro */
    --foreground: 240 4.8% 95.9%;      /* Quase branco */

    /* Cards */
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;

    /* Popovers */
    --popover: 0 0% 9%;                /* #171717 */
    --popover-foreground: 0 0% 98%;

    /* Tema Brand - MESMA COR NO DARK */
    --primary: 228 100% 50%;           /* Azul #0034FF */
    --primary-foreground: 0 0% 100%;

    /* Secundário */
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;

    /* Muted */
    --muted: 240 5.9% 10%;
    --muted-foreground: 240 4.4% 58%;

    /* Accent */
    --accent: 240 5.9% 10%;
    --accent-foreground: 0 0% 98%;

    /* Erro */
    --destructive: 0 62.8% 30.6%;      /* Vermelho escuro */
    --destructive-foreground: 0 0% 98%;

    /* Bordas */
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --input-background: 60 2% 18%;

    /* Focus ring (mesmo) */
    --ring: 228 100% 50%;

    /* Seleção de texto */
    --selection: 228 100% 50% / 0.3;

    /* Border radius (mesmo) */
    --radius: 0.5rem;

    /* Customizadas */
    --plan-mode: 33 83% 67%;
    --plan-mode-foreground: 0 0% 8%;
    --tl-background: 60 2% 18%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* ═══════════════════════════════════════════════════════ */
/* SCROLLBAR CUSTOMIZADO */
/* ═══════════════════════════════════════════════════════ */

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}

/* ═══════════════════════════════════════════════════════ */
/* UTILITIES CUSTOMIZADAS */
/* ═══════════════════════════════════════════════════════ */

.no-select {
  user-select: none;
  -webkit-user-select: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* ═══════════════════════════════════════════════════════ */
/* SONNER TOAST STYLING (se usar Sonner) */
/* ═══════════════════════════════════════════════════════ */

[data-sonner-toaster] {
  --normal-bg: hsl(var(--popover));
  --normal-text: hsl(var(--popover-foreground));
  --normal-border: hsl(var(--border));
  --border-radius: var(--radius);
}

[data-sonner-toast][data-styled="true"] {
  padding: 12px 16px;
  padding-right: 32px;
  gap: 8px;
  align-items: flex-start;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

[data-sonner-toast] [data-title] {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.4;
}

[data-sonner-toast] [data-description] {
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  line-height: 1.4;
}
```

### Passo 4: Utility Function `cn()`

**`src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 3. Sistema de Cores e Temas

### 🎨 Paleta de Cores Principal

#### Light Theme

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--background` | `0 0% 100%` | `#FFFFFF` | Fundo principal |
| `--foreground` | `240 10% 3.9%` | `#0A0E27` | Texto principal |
| `--primary` | `228 100% 50%` | `#0034FF` | **Cor da marca** (azul vibrante) |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto em primary |
| `--secondary` | `240 4.8% 95.9%` | `#F3F4F6` | Backgrounds secundários |
| `--muted` | `240 4.8% 95.9%` | `#F3F4F6` | Elementos desabilitados |
| `--muted-foreground` | `240 3.8% 46.1%` | `#757575` | Texto secundário |
| `--accent` | `240 4.8% 95.9%` | `#F3F4F6` | Hover states |
| `--destructive` | `0 84.2% 60.2%` | `#F75050` | Erros e ações destrutivas |
| `--border` | `240 5.9% 90%` | `#E5E7EB` | Bordas |
| `--input` | `240 5.9% 90%` | `#E5E7EB` | Bordas de inputs |
| `--ring` | `228 100% 50%` | `#0034FF` | Focus ring |

#### Dark Theme

| Token | HSL | Hex | Uso |
|-------|-----|-----|-----|
| `--background` | `240 10% 3.9%` | `#0A0E27` | Fundo principal |
| `--foreground` | `240 4.8% 95.9%` | `#F3F4F6` | Texto principal |
| `--primary` | `228 100% 50%` | `#0034FF` | **Mesma cor** |
| `--popover` | `0 0% 9%` | `#171717` | Backgrounds de popovers |
| `--muted` | `240 5.9% 10%` | `#1F2937` | Elementos desabilitados |
| `--muted-foreground` | `240 4.4% 58%` | `#909090` | Texto secundário |
| `--destructive` | `0 62.8% 30.6%` | `#C02828` | Erros |
| `--border` | `240 3.7% 15.9%` | `#30302E` | Bordas |

### 🌓 Implementação de Tema

**`src/providers/theme-provider.tsx`**

```typescript
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

**Hook de uso:**

```typescript
import { useTheme } from "next-themes"

function Component() {
  const { theme, setTheme } = useTheme()

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  )
}
```

---

## 4. Componentes UI

1. [Button](#-button)
2. [Input](#-input)
3. [Label](#-label)
4. [Checkbox](#-checkbox)
5. [Switch](#-switch)
6. [Dialog](#-dialog)
7. [Tabs](#-tabs)
8. [Tooltip](#-tooltip)
9. [Badge](#-badge)
10. [Card](#-card)
11. [Select](#-select)
12. [Dropdown Menu](#-dropdown-menu)
13. [Progress](#-progress)
14. [Toast (Sonner)](#-toast-sonner)
15. [Alert Dialog](#-alert-dialog)

**`src/components/ui/button.tsx`**

```typescript
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70 disabled:opacity-50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(0,0,0,0.14)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border border-input shadow-sm shadow-black/5 hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-7 rounded-md px-3",
        default: "h-7 rounded-md px-3",
        lg: "h-10 rounded-md px-8",
        icon: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

**Uso:**

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default">Salvar</Button>
<Button variant="destructive">Deletar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Fechar</Button>
<Button size="icon"><IconTrash /></Button>
```

### 🔤 Input

**`src/components/ui/input.tsx`**

```typescript
import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

**Uso:**

```tsx
import { Input } from "@/components/ui/input"

<Input type="text" placeholder="Digite seu nome" />
<Input type="email" placeholder="email@exemplo.com" />
```

### 🏷️ Label

**`src/components/ui/label.tsx`**

```typescript
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const labelVariants = cva(
  "text-[12px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

### ☑️ Checkbox

**`src/components/ui/checkbox.tsx`**

```typescript
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer size-4 shrink-0 rounded border border-input shadow-sm shadow-black/5 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/70 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

### 🎚️ Switch

**`src/components/ui/switch.tsx`**

```typescript
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "../../lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/20",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-md ring-0 transition-all duration-200 data-[state=checked]:bg-white data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

### 💬 Dialog

**`src/components/ui/dialog.tsx`**

```typescript
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

**Uso:**

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Dialog</DialogTitle>
      <DialogDescription>
        Descrição ou conteúdo do dialog aqui.
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### 📑 Tabs

**`src/components/ui/tabs.tsx`**

```typescript
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

### 🛟 Tooltip

**`src/components/ui/tooltip.tsx`**

```typescript
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "../../lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

**Uso:**

```tsx
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost">Hover me</Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>Tooltip text aqui</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 🏷️ Badge

**`src/components/ui/badge.tsx`**

```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### 🃏 Card

**`src/components/ui/card.tsx`**

```typescript
import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

### 🎯 Select

**`src/components/ui/select.tsx`**

```typescript
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```

**Uso:**

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecione uma opção" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opção 1</SelectItem>
    <SelectItem value="option2">Opção 2</SelectItem>
    <SelectItem value="option3">Opção 3</SelectItem>
  </SelectContent>
</Select>
```

### 📖 Dropdown Menu

**`src/components/ui/dropdown-menu.tsx`**

```typescript
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "../../lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
```

**Uso:**

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Perfil</DropdownMenuItem>
    <DropdownMenuItem>Configurações</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Sair</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 📊 Progress

**`src/components/ui/progress.tsx`**

```typescript
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "../../lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

### 🍞 Toast (Sonner)

**`src/components/ui/toaster.tsx`**

```typescript
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastProvider,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  return (
    <ToastProvider>
      <Toast />
      <ToastViewport />
    </ToastProvider>
  )
}
```

**`src/hooks/use-toast.ts`**

```typescript
import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case "DISMISS_TOAST": {
      const { toastId } = action
      if (toastId) addToRemoveQueue(toastId)
      else state.toasts.forEach((t) => addToRemoveQueue(t.id))
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined ? { ...t, open: false } : t
        ),
      }
    }
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: action.toastId === undefined
          ? []
          : state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()
  const update = (props: ToasterToast) => dispatch({ type: "UPDATE_TOAST", toast: { ...props, id } })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id, open: true, onOpenChange: (open) => { if (!open) dismiss() } },
  })

  return { id, dismiss, update }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
```

**OU use Sonner diretamente (mais simples):**

```tsx
import { Toaster, toast } from "sonner"

// No seu app:
<Toaster position="bottom-right" />

// Uso:
toast.success("Operação realizada!")
toast.error("Algo deu errado")
toast.info("Informação")
```

**Uso:**

```tsx
import { useToast } from "@/hooks/use-toast"

function Component() {
  const { toast } = useToast()

  toast({
    title: "Sucesso!",
    description: "Operação realizada com sucesso.",
  })

  toast({
    title: "Erro",
    description: "Algo deu errado.",
    variant: "destructive",
  })
}
```

### 🎪 Alert Dialog

**`src/components/ui/alert-dialog.tsx`**

```typescript
import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./button"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

**Uso:**

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="outline">Deletar</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction>Deletar</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 5. Padrões de Estilização

### 🎨 Variantes com CVA (Class Variance Authority)

```typescript
import { cva } from "class-variance-authority"

const componentVariants = cva(
  // Base classes (sempre aplicadas)
  "inline-flex items-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        secondary: "bg-secondary text-black",
        outline: "border border-input bg-transparent",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    compoundVariants: [
      {
        variant: "outline",
        size: "sm",
        className: "border-2",  // Aplica apenas quando variant=outline E size=sm
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)
```

### 🔀 Classes Condicionais

```typescript
// Usando cn() com condições
className={cn(
  "base-classes",
  isActive && "active-state",
  isPending && "opacity-50",
  className  // Props override
)}

// Data attributes (preferível para states)
className="data-[state=open]:bg-accent data-[state=closed]:opacity-0"

// Tailwind arbitrary values
className="w-[calc(100%-2rem)] h-[42px]"
```

### 🎯 Focus States

```css
/* Input focus */
focus-visible:border-primary
focus-visible:outline-none
focus-visible:ring-[3px]
focus-visible:ring-primary/20

/* Button focus */
outline-offset-2
focus-visible:outline
focus-visible:outline-2
focus-visible:outline-primary/70
```

### 🖱️ Hover States

```css
/* Smooth transitions */
transition-colors
hover:bg-accent
hover:text-accent-foreground

/* Com duration */
transition-all duration-200
hover:opacity-90

/* Com transform */
transition-transform
hover:scale-105
active:scale-95
```

---

## 6. Layouts e Responsividade

### 📐 Breakpoints (Tailwind Default)

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

**Uso:**

```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Mobile: 100%, Tablet: 50%, Desktop: 33% */}
</div>
```

### 🧱 Grid Layouts

```tsx
{/* Grid responsivo */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

{/* Grid com auto-fit */}
<div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <Card />
</div>
```

### 📏 Flex Layouts

```tsx
{/* Flex com gap */}
<div className="flex items-center gap-2">
  <Icon />
  <span>Text</span>
</div>

{/* Flex column */}
<div className="flex flex-col space-y-4">
  <Item />
  <Item />
</div>

{/* Justify between */}
<div className="flex items-center justify-between">
  <Left />
  <Right />
</div>
```

### 📱 Container com Max Width

```tsx
<div className="container mx-auto px-4 max-w-7xl">
  {children}
</div>
```

---

## 7. Animações

### ✨ Motion (Framer Motion fork)

```tsx
import { motion, AnimatePresence } from "motion/react"

{/* Fade in */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

{/* Slide up */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
  Content
</motion.div>

{/* Exit animations */}
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>

{/* Layout animations */}
<motion.div layout>
  {/* Automaticamente anima mudanças de layout */}
</motion.div>
```

### 🎭 Tailwind Animations

```tsx
{/* Pulse (opacity loop) */}
<div className="animate-pulse" />

{/* Spin (rotação infinita) */}
<div className="animate-spin" />

{/* Ping (scale + opacity) */}
<div className="animate-ping" />

{/* Bounce */}
<div className="animate-bounce" />

{/* Custom (via tailwindcss-animate plugin) */}
<div className="animate-in fade-in-0 zoom-in-95" />
<div className="animate-out fade-out-0 slide-out-to-top-2" />
```

### ⏱️ Transitions

```css
/* Durations */
duration-75
duration-100
duration-150
duration-200  /* MAIS COMUM */
duration-300
duration-500

/* Ease functions */
ease-linear
ease-in
ease-out      /* PREFERIDO */
ease-in-out

/* Multiple properties */
transition-all
transition-colors
transition-opacity
transition-transform
```

---

## 8. Gerenciamento de Estado

### ⚛️ Jotai (Atomic State)

```typescript
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"

// Atom simples
const countAtom = atom(0)

// Atom com localStorage persistence
const themeAtom = atomWithStorage<"light" | "dark">("theme", "light")

// Atom derivado (computed)
const doubleCountAtom = atom((get) => get(countAtom) * 2)

// Atom write-only
const incrementAtom = atom(
  null,  // No read
  (get, set) => set(countAtom, get(countAtom) + 1)
)

// Uso em componente
function Component() {
  const [count, setCount] = useAtom(countAtom)
  const double = useAtomValue(doubleCountAtom)
  const increment = useSetAtom(incrementAtom)

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {double}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

### 🐻 Zustand (Store State)

```typescript
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Store {
  count: number
  increase: () => void
  reset: () => void
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      count: 0,
      increase: () => set((state) => ({ count: state.count + 1 })),
      reset: () => set({ count: 0 }),
    }),
    {
      name: "counter-storage",  // LocalStorage key
    }
  )
)

// Uso
function Component() {
  const count = useStore((state) => state.count)
  const increase = useStore((state) => state.increase)

  return (
    <button onClick={increase}>
      Count: {count}
    </button>
  )
}
```

### 🔄 React Query (Server State)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// Query
function Component() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <TodoList todos={data} />
}

// Mutation
function CreateTodo() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] })
    },
  })

  return (
    <button onClick={() => mutation.mutate({ title: "New Todo" })}>
      {mutation.isPending ? "Creating..." : "Create"}
    </button>
  )
}
```

---

## 9. Tipografia e Ícones

### 🔤 Fontes

**Geist Sans & Geist Mono** (opcional - use suas fontes)

```css
:root {
  --font-geist-sans: 'Geist Sans', system-ui, -apple-system, sans-serif;
  --font-geist-mono: 'Geist Mono', ui-monospace, monospace;
}

body {
  font-family: var(--font-geist-sans);
}

code, pre {
  font-family: var(--font-geist-mono);
}
```

### 📐 Font Sizes (Tailwind)

```
text-xs    0.75rem (12px)
text-sm    0.875rem (14px)
text-base  1rem (16px)
text-lg    1.125rem (18px)
text-xl    1.25rem (20px)
text-2xl   1.5rem (24px)
text-3xl   1.875rem (30px)
```

### 🎨 Ícones

**Lucide React (preferencial):**

```tsx
import {
  Check,
  X,
  ChevronDown,
  Search,
  Menu,
  User,
  Settings
} from "lucide-react"

<Check className="h-4 w-4" />
<Search className="h-5 w-5 text-muted-foreground" />
```

**Radix Icons:**

```tsx
import { Cross2Icon, ChevronDownIcon } from "@radix-ui/react-icons"

<Cross2Icon />
```

**React Icons:**

```tsx
import { FiX, FiMenu } from "react-icons/fi"

<FiX size={16} />
```

---

## 📁 Estrutura de Diretórios Recomendada

```
src/
├── components/
│   ├── ui/                    # Componentes base (shadcn/ui style)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── checkbox.tsx
│   │   ├── switch.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── progress.tsx
│   │   ├── alert-dialog.tsx
│   │   └── toaster.tsx        # Se usar Sonner com hook
│   ├── layout/                 # Componentes de layout
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── main-layout.tsx
│   └── ...                    # Componentes específicos do app
├── lib/
│   ├── utils.ts               # cn() function
│   └── constants.ts
├── styles/
│   ├── globals.css            # CSS variables + Tailwind imports
│   └── components.css         # Estilos específicos de componentes
├── providers/
│   └── theme-provider.tsx      # Theme provider (next-themes)
├── hooks/
│   └── use-toast.ts           # Toast hook (opcional - pode usar Sonner direto)
└── assets/
    └── icons/                 # Ícones customizados
```

---

## 11. Sistema de Temas Avançado

### 📋 Visão Geral

O 1Code usa um **sistema de temas completo** inspirado no VS Code que suporta:
- ✅ Temas light e dark
- ✅ Temas importados do VS Code, Cursor e Windsurf
- ✅ Modo "System" (seguir preferência do sistema)
- ✅ CSS variables dinâmicas baseadas em temas VS Code
- ✅ Persistência com localStorage via Jotai

### 📁 Estrutura de Arquivos

```
src/
├── lib/
│   ├── atoms/
│   │   └── index.ts              # Atoms de tema (selectedFullThemeIdAtom, etc)
│   ├── themes/
│   │   ├── builtin-themes.ts    # Temas builtin (21st, Vitesse, Min, Claude, Vesper)
│   │   ├── cursor-themes.ts     # Temas do Cursor
│   │   └── vscode-to-css-mapping.ts  # Conversão VS Code → CSS variables
│   └── hooks/
│       └── use-code-theme.ts    # Hook para tema do editor de código
└── components/
    └── dialogs/
        └── settings-tabs/
            └── agents-appearance-tab.tsx  # Página de configurações de aparência
```

### 🗄️ Atoms de Tema

**`src/lib/atoms/index.ts`**

```typescript
import { atomWithStorage } from "jotai/utils"
import type { VSCodeFullTheme } from "./atoms"

// Tipo completo de tema VS Code
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

// Tema selecionado (null = modo system)
export const selectedFullThemeIdAtom = atomWithStorage<string | null>(
  "preferences:selected-full-theme-id",
  null, // null = usar system default
  undefined,
  { getOnInit: true },
)

// Tema para modo light (quando em modo system)
export const systemLightThemeIdAtom = atomWithStorage<string>(
  "preferences:system-light-theme-id",
  "21st-light",
  undefined,
  { getOnInit: true },
)

// Tema para modo dark (quando em modo system)
export const systemDarkThemeIdAtom = atomWithStorage<string>(
  "preferences:system-dark-theme-id",
  "21st-dark",
  undefined,
  { getOnInit: true },
)

// Dados completos do tema atual (para aplicar cores)
export const fullThemeDataAtom = atom<VSCodeFullTheme | null>(null)

// Temas importados pelo usuário
export const importedThemesAtom = atom<VSCodeFullTheme[]>([])
```

### 🎨 Temas Builtin

**`src/lib/themes/builtin-themes.ts`**

```typescript
import type { VSCodeFullTheme } from "../atoms"

export type { VSCodeFullTheme }

// ========== THEMES ==========

// 21st Dark - Tema padrão do app (azul #0034FF)
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
    "panel.background": "#121212",
    "panel.border": "#27272a",
    "tab.activeBackground": "#0a0a0a",
    "tab.inactiveBackground": "#18181b",
    "dropdown.background": "#171717",
    "input.background": "#121212",
    "input.border": "#27272a",
    "focusBorder": "#0034ff",
    "textLink.foreground": "#0034ff",
    "button.background": "#0034ff",
    "button.foreground": "#ffffff",
    // ... mais cores
  },
}

// 21st Light - Tema claro padrão
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
    "focusBorder": "#0034ff",
    "textLink.foreground": "#0034ff",
    "button.background": "#0034ff",
    "button.foreground": "#ffffff",
    // ... mais cores
  },
}

// Claude Light - Tons quentes, accent laranja
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
    "focusBorder": "#D97857",
    "textLink.foreground": "#D97857",
    "button.background": "#D97857",
    "button.foreground": "#ffffff",
    // ... mais cores
  },
}

// Claude Dark
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
    "focusBorder": "#D97857",
    "textLink.foreground": "#D97857",
    "button.background": "#D97857",
    // ... mais cores
  },
}

// Todos os temas builtin
export const BUILTIN_THEMES: VSCodeFullTheme[] = [
  TWENTYFIRST_DARK,
  TWENTYFIRST_LIGHT,
  CLAUDE_DARK,
  CLAUDE_LIGHT,
  // Adicione mais temas aqui
]

// Buscar tema por ID
export function getBuiltinThemeById(id: string): VSCodeFullTheme | undefined {
  return BUILTIN_THEMES.find((theme) => theme.id === id)
}

// Defaults
export const DEFAULT_LIGHT_THEME_ID = "21st-light"
export const DEFAULT_DARK_THEME_ID = "21st-dark"
```

### 🔄 Mapeamento VS Code → CSS Variables

**`src/lib/themes/vscode-to-css-mapping.ts`**

```typescript
// Mapeamento de cores VS Code para CSS variables do app
export const VSCODE_TO_CSS_MAP: Record<string, string[]> = {
  "--background": ["editor.background", "editorPane.background"],
  "--foreground": ["editor.foreground", "foreground"],

  "--primary": ["button.background", "focusBorder", "textLink.foreground"],
  "--primary-foreground": ["button.foreground"],

  "--card": ["sideBar.background", "panel.background", "editor.background"],
  "--card-foreground": ["sideBar.foreground", "foreground"],

  "--popover": ["dropdown.background", "menu.background", "editorWidget.background"],
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

  "--destructive": ["errorForeground", "editorError.foreground"],
  "--destructive-foreground": ["editorError.background"],

  "--tl-background": ["sideBar.background", "panel.background"],
}

// Converter HEX para HSL
export function hexToHSL(hex: string): string {
  // ... implementação
}

// Detectar se cor é clara ou escura
export function isLightColor(hex: string): boolean {
  // ... implementação
}

// Gerar CSS variables a partir das cores do tema
export function generateCSSVariables(
  themeColors: Record<string, string>
): Record<string, string> {
  const cssVariables: Record<string, string> = {}
  const backgroundColor = themeColors["editor.background"]

  for (const [cssVar, priorityKeys] of Object.entries(VSCODE_TO_CSS_MAP)) {
    const color = priorityKeys.find(key => themeColors[key])
    if (color) {
      cssVariables[cssVar] = hexToHSL(color)
    }
  }

  return cssVariables
}

// Aplicar CSS variables ao documento
export function applyCSSVariables(
  variables: Record<string, string>,
  element: HTMLElement = document.documentElement
): void {
  for (const [name, value] of Object.entries(variables)) {
    element.style.setProperty(name, value)
  }
}

// Remover CSS variables (reset)
export function removeCSSVariables(
  element: HTMLElement = document.documentElement
): void {
  for (const cssVar of Object.keys(VSCODE_TO_CSS_MAP)) {
    element.style.removeProperty(cssVar)
  }
}

// Detectar tipo de tema (light/dark) pelas cores
export function getThemeTypeFromColors(colors: Record<string, string>): "light" | "dark" {
  const bgColor = colors["editor.background"]
  return isLightColor(bgColor) ? "light" : "dark"
}
```

### 🖥️ Página de Configurações de Aparência

**`src/components/dialogs/settings-tabs/agents-appearance-tab.tsx`**

```typescript
import { useTheme } from "next-themes"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useAtom, useSetAtom } from "jotai"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "../../../lib/utils"
import {
  selectedFullThemeIdAtom,
  fullThemeDataAtom,
  systemLightThemeIdAtom,
  systemDarkThemeIdAtom,
  importedThemesAtom,
  type VSCodeFullTheme,
} from "../../../lib/atoms"
import { BUILTIN_THEMES, getBuiltinThemeById } from "../../../lib/themes/builtin-themes"
import {
  generateCSSVariables,
  applyCSSVariables,
  removeCSSVariables,
  getThemeTypeFromColors,
} from "../../../lib/themes/vscode-to-css-mapping"
import { Select, SelectContent, SelectItem } from "../../../components/ui/select"
import { Switch } from "../../../components/ui/switch"

// Preview box com cor do tema
function ThemePreviewBox({
  theme,
  size = "md",
}: {
  theme: VSCodeFullTheme | null
  size?: "sm" | "md"
}) {
  const bgColor = theme?.colors?.["editor.background"] || "#1a1a1a"
  const accentColor = theme?.colors?.["button.background"] || "#0034FF"
  const isDark = theme ? theme.type === "dark" : true

  const sizeClasses = size === "sm" ? "w-7 h-5 text-[9px]" : "w-8 h-6 text-[10px]"

  return (
    <div
      className={cn("flex items-center justify-center font-semibold rounded-sm", sizeClasses)}
      style={{
        backgroundColor: bgColor,
        boxShadow: "inset 0 0 0 0.5px rgba(128, 128, 128, 0.3)",
      }}
    >
      <div className="rounded-full w-1.5 h-1.5 mr-1" style={{ backgroundColor: accentColor }} />
      <span style={{ color: isDark ? "#fff" : "#000" }}>Aa</span>
    </div>
  )
}

export function AgentsAppearanceTab() {
  const { resolvedTheme, setTheme: setNextTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Theme state
  const [selectedThemeId, setSelectedThemeId] = useAtom(selectedFullThemeIdAtom)
  const [systemLightThemeId, setSystemLightThemeId] = useAtom(systemLightThemeIdAtom)
  const [systemDarkThemeId, setSystemDarkThemeId] = useAtom(systemDarkThemeIdAtom)
  const setFullThemeData = useSetAtom(fullThemeDataAtom)
  const [importedThemes] = useAtom(importedThemesAtom)

  useEffect(() => { setMounted(true) }, [])

  // Agrupar temas por tipo
  const darkThemes = useMemo(() => BUILTIN_THEMES.filter(t => t.type === "dark"), [])
  const lightThemes = useMemo(() => BUILTIN_THEMES.filter(t => t.type === "light"), [])

  const isSystemMode = selectedThemeId === null

  // Tema atual para display
  const currentTheme = useMemo(() => {
    if (selectedThemeId === null) return null
    return BUILTIN_THEMES.find(t => t.id === selectedThemeId) ||
           importedThemes.find(t => t.id === selectedThemeId) || null
  }, [selectedThemeId, importedThemes])

  // Aplicar tema
  const applyTheme = useCallback((themeId: string | null) => {
    if (themeId === null) {
      // Modo system
      removeCSSVariables()
      setFullThemeData(null)
      setNextTheme("system")

      const isDark = resolvedTheme === "dark"
      const systemTheme = isDark
        ? getBuiltinThemeById(systemDarkThemeId)
        : getBuiltinThemeById(systemLightThemeId)

      if (systemTheme) {
        const cssVars = generateCSSVariables(systemTheme.colors)
        applyCSSVariables(cssVars)
      }
      return
    }

    // Tema específico
    const theme = BUILTIN_THEMES.find(t => t.id === themeId) ||
                  importedThemes.find(t => t.id === themeId)

    if (theme) {
      setFullThemeData(theme)
      const cssVars = generateCSSVariables(theme.colors)
      applyCSSVariables(cssVars)

      const themeType = getThemeTypeFromColors(theme.colors)
      document.documentElement.classList.toggle("dark", themeType === "dark")
      setNextTheme(themeType)
    }
  }, [resolvedTheme, systemLightThemeId, systemDarkThemeId, setFullThemeData, setNextTheme, importedThemes])

  // Mudar tema principal
  const handleThemeChange = useCallback((value: string) => {
    if (value === "system") {
      setSelectedThemeId(null)
      applyTheme(null)
    } else {
      setSelectedThemeId(value)
      applyTheme(value)
    }
  }, [setSelectedThemeId, applyTheme])

  if (!mounted) return null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the look and feel of the interface
        </p>
      </div>

      {/* Interface Theme Section */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Main theme selector */}
        <div className="flex items-center justify-between p-4">
          <div>
            <span className="text-sm font-medium">Interface theme</span>
            <p className="text-xs text-muted-foreground">
              Select or customize your color scheme
            </p>
          </div>

          <Select value={selectedThemeId ?? "system"} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-auto">
              <div className="flex items-center gap-2">
                <ThemePreviewBox
                  theme={isSystemMode
                    ? (resolvedTheme === "dark" ? getBuiltinThemeById(systemDarkThemeId) : getBuiltinThemeById(systemLightThemeId))
                    : currentTheme
                  }
                />
                <span className="text-sm">
                  {isSystemMode ? "System preference" : currentTheme?.name}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <span>🖥️ System preference</span>
                </div>
              </SelectItem>

              <div className="text-xs text-muted-foreground px-2 py-1">Light</div>
              {lightThemes.map(theme => (
                <SelectItem key={theme.id} value={theme.id}>
                  <div className="flex items-center gap-2">
                    <ThemePreviewBox theme={theme} size="sm" />
                    <span>{theme.name}</span>
                  </div>
                </SelectItem>
              ))}

              <div className="text-xs text-muted-foreground px-2 py-1">Dark</div>
              {darkThemes.map(theme => (
                <SelectItem key={theme.id} value={theme.id}>
                  <div className="flex items-center gap-2">
                    <ThemePreviewBox theme={theme} size="sm" />
                    <span>{theme.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Light/Dark selectors for system mode */}
        <AnimatePresence>
          {isSystemMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Light theme selector */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <span className="text-sm font-medium">Light</span>
                  <p className="text-xs text-muted-foreground">Theme for light system appearance</p>
                </div>
                <Select value={systemLightThemeId} onValueChange={setSystemLightThemeId}>
                  <SelectTrigger className="w-auto">
                    <ThemePreviewBox theme={getBuiltinThemeById(systemLightThemeId)} />
                    <span className="ml-2">{getBuiltinThemeById(systemLightThemeId)?.name}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {lightThemes.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>
                        <ThemePreviewBox theme={theme} size="sm" />
                        <span className="ml-2">{theme.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dark theme selector */}
              <div className="flex items-center justify-between p-4 border-t border-border">
                <div>
                  <span className="text-sm font-medium">Dark</span>
                  <p className="text-xs text-muted-foreground">Theme for dark system appearance</p>
                </div>
                <Select value={systemDarkThemeId} onValueChange={setSystemDarkThemeId}>
                  <SelectTrigger className="w-auto">
                    <ThemePreviewBox theme={getBuiltinThemeById(systemDarkThemeId)} />
                    <span className="ml-2">{getBuiltinThemeById(systemDarkThemeId)?.name}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {darkThemes.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>
                        <ThemePreviewBox theme={theme} size="sm" />
                        <span className="ml-2">{theme.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Display Options */}
      <div className="bg-card rounded-lg border border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <span className="text-sm font-medium">Workspace icon</span>
            <p className="text-xs text-muted-foreground">Show project icon in sidebar</p>
          </div>
          <Switch />
        </div>
      </div>
    </div>
  )
}
```

### 📦 Como Adicionar um Novo Tema Builtin

1. **Defina o tema** em `src/lib/themes/builtin-themes.ts`:

```typescript
const MY_THEME_DARK: VSCodeFullTheme = {
  id: "my-theme-dark",
  name: "My Theme Dark",
  type: "dark",
  source: "builtin",
  colors: {
    "editor.background": "#1a1a1a",
    "editor.foreground": "#ffffff",
    "foreground": "#ffffff",
    "sideBar.background": "#1a1a1a",
    "sideBar.foreground": "#ffffff",
    "sideBar.border": "#333333",
    "activityBar.background": "#1a1a1a",
    "panel.background": "#1a1a1a",
    "panel.border": "#333333",
    "tab.activeBackground": "#1a1a1a",
    "tab.inactiveBackground": "#252525",
    "dropdown.background": "#252525",
    "dropdown.foreground": "#ffffff",
    "input.background": "#1a1a1a",
    "input.border": "#333333",
    "input.foreground": "#ffffff",
    "focusBorder": "#3b82f6",
    "textLink.foreground": "#3b82f6",
    "button.background": "#3b82f6",
    "button.foreground": "#ffffff",
    "button.secondaryBackground": "#333333",
    "button.secondaryForeground": "#ffffff",
  },
}
```

2. **Adicione ao array** `BUILTIN_THEMES`:

```typescript
export const BUILTIN_THEMES: VSCodeFullTheme[] = [
  // ... temas existentes
  MY_THEME_DARK,
]
```

### 📂 Importar Temas do VS Code / Cursor / Windsurf

O app suporta **importação automática** de temas instalados no VS Code:

```typescript
// No Electron (main process)
import { scanVSCodeThemes, loadVSCodeTheme } from "./vscode-theme-loader"

// Escaneia temas do VS Code
const themes = await scanVSCodeThemes()
// Retorna: [{ id: "theme-name", name: "Theme Name", path: "/path/to/theme.json" }]

// Carrega um tema específico
const theme = await loadVSCodeTheme(path)
```

```typescript
// No renderer - página de aparência
useEffect(() => {
  if (!mounted) return

  const loadThemes = async () => {
    const discovered = await window.desktopApi.scanVSCodeThemes()

    const loadedThemes = await Promise.all(
      discovered.map(async (theme) => {
        const fullTheme = await window.desktopApi.loadVSCodeTheme(theme.path)
        return {
          ...fullTheme,
          id: theme.id,
          source: "imported" as const,
        }
      })
    )

    setImportedThemes(loadedThemes)
  }

  loadThemes()
}, [mounted])
```

### 🎯 CSS Variables Usadas no App

| Variável | Uso | Fallback |
|-----------|-----|----------|
| `--background` | Fundo principal | `editor.background` |
| `--foreground` | Texto principal | `editor.foreground` |
| `--primary` | Botões, links, foco | `button.background` |
| `--card` | Cards, panels | `sideBar.background` |
| `--popover` | Dropdowns, menus | `dropdown.background` |
| `--muted` | Backgrounds secundários | `tab.inactiveBackground` |
| `--border` | Bordas | `panel.border` |
| `--input` | Borda de inputs | `input.border` |
| `--destructive` | Erros | `errorForeground` |
| `--selection` | Seleção de texto | `editor.selectionBackground` |

---

## 12. Quick Start (Copy-Paste)

### 🚀 Instalação Completa em 5 Minutos

```bash
# 1. Instalar todas as dependências
npm install react@19.2.1 react-dom@19.2.1 typescript@5.4.5
npm install -D tailwindcss@3.4.17 postcss autoprefixer

# 2. Instalar Radix UI (todos)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select \
  @radix-ui/react-tabs @radix-ui/react-switch @radix-ui/react-checkbox \
  @radix-ui/react-tooltip @radix-ui/react-label @radix-ui/react-progress \
  @radix-ui/react-alert-dialog @radix-ui/react-slot @radix-ui/react-icons

# 3. Instalar utilities
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate

# 4. Instalar libs de estado e temas
npm install jotai@2.11.1 next-themes motion sonner lucide-react
```

### 📦 Arquivos Essenciais para Copiar

```
src/
├── lib/
│   └── utils.ts          # cn() function
├── styles/
│   └── globals.css       # Tokens + Tailwind
├── providers/
│   └── theme-provider.tsx # Dark/Light mode
└── components/
    └── ui/               # TODOS os componentes (16 arquivos)
```

### 🎨 Quick Copy: cn() + Utils

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 🎨 Quick Copy: Tokens CSS

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 228 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 4.8% 95.9%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --destructive: 0 84.2% 60.2%;
    --border: 240 5.9% 90%;
    --ring: 228 100% 50%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 240 4.8% 95.9%;
    --primary: 228 100% 50%;
    --secondary: 240 3.7% 15.9%;
    --muted: 240 5.9% 10%;
    --muted-foreground: 240 4.4% 58%;
    --accent: 240 5.9% 10%;
    --destructive: 0 62.8% 30.6%;
    --border: 240 3.7% 15.9%;
    --ring: 228 100% 50%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

### 🎨 Quick Copy: Theme Provider

```tsx
// src/providers/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
```

### 📦 Quick Copy: Tailwind Config

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 🎯 Quick Copy: Todos os Componentes UI

Copie todos da pasta `src/components/ui/`:
- `button.tsx` - Button com variantes (default, destructive, outline, ghost, link)
- `input.tsx` - Input com focus states
- `label.tsx` - Label para forms
- `checkbox.tsx` - Checkbox acessível
- `switch.tsx` - Toggle switch
- `dialog.tsx` - Modal dialog
- `tabs.tsx` - Abas navegáveis
- `tooltip.tsx` - Tooltips acessíveis
- `badge.tsx` - Badges compactos
- `card.tsx` - Cards com header/content/footer
- `select.tsx` - Select dropdown
- `dropdown-menu.tsx` - Menu dropdown completo
- `progress.tsx` - Barra de progresso
- `alert-dialog.tsx` - Dialog de confirmação
- `toaster.tsx` - Toast notifications

### 🎨 Quick Copy: Como Usar os Tokens

```tsx
// Usar tokens no seu componente
function MyComponent() {
  return (
    <div className="bg-background text-foreground">
      <button className="bg-primary text-primary-foreground hover:bg-primary/90">
        Click me
      </button>
      <div className="border border-border rounded-lg p-4">
        <p className="text-muted-foreground">Card content</p>
      </div>
    </div>
  )
}

// Dark mode automático com @dark
<div className="bg-background text-foreground dark:bg-black dark:text-white">
  Conteúdo
</div>
```

---

## 13. Checklists Completos

### ✅ Setup Inicial

- [ ] Instalar React 19 + TypeScript 5
- [ ] Configurar Tailwind CSS 3.4
- [ ] Criar `globals.css` com tokens HSL
- [ ] Configurar `tailwind.config.js` com cores customizadas
- [ ] Criar `cn()` utility function
- [ ] Configurar ThemeProvider com next-themes

### ✅ Componentes UI (16)

- [ ] Button (variantes: default, destructive, outline, secondary, ghost, link)
- [ ] Input (com focus states)
- [ ] Label (acessível)
- [ ] Checkbox (Radix UI)
- [ ] Switch (toggle)
- [ ] Dialog (modal com animações)
- [ ] Tabs (navegação)
- [ ] Tooltip (Radix UI)
- [ ] Badge (rótulos)
- [ ] Card (container)
- [ ] Select (dropdown)
- [ ] Dropdown Menu (menu completo)
- [ ] Progress (barra)
- [ ] Alert Dialog (confirmação)
- [ ] Toast notifications (Sonner)

### ✅ Sistema de Temas

- [ ] Criar atoms com Jotai (selectedThemeId, systemLightThemeId, systemDarkThemeId)
- [ ] Definir temas builtin (21st Dark/Light, Claude, Vitesse, Min, Vesper)
- [ ] Implementar VS Code → CSS variables mapping
- [ ] Criar ThemePreviewBox component
- [ ] Criar página de Appearance settings
- [ ] Testar transições light ↔ dark

### ✅ Polimento

- [ ] Customizar scrollbar
- [ ] Implementar animações com Motion
- [ ] Configurar Toast notifications
- [ ] Testar responsividade (mobile, tablet, desktop)
- [ ] Verificar acessibilidade (focus, ARIA)
- [ ] Testar com todos os temas builtin

---

**Última atualização:** Fevereiro 2026
**Versão do projeto:** 0.0.24

### ✅ Setup Base

- [ ] Instalar dependências core (React, TypeScript, Tailwind)
- [ ] Configurar Tailwind + PostCSS
- [ ] Criar `globals.css` com CSS variables
- [ ] Implementar `cn()` utility function
- [ ] Instalar Radix UI primitives
- [ ] Configurar CVA para variantes

### ✅ Sistema de Cores

- [ ] Definir paleta de cores no `:root`
- [ ] Definir paleta dark mode no `.dark`
- [ ] **Customizar `--primary`** com cor da sua marca
- [ ] Testar contraste de cores (WCAG AA)
- [ ] Implementar ThemeProvider (next-themes)

### ✅ Componentes Essenciais

- [ ] Button (todas variantes)
- [ ] Input
- [ ] Label
- [ ] Checkbox
- [ ] Switch
- [ ] Dialog
- [ ] Tabs
- [ ] Tooltip
- [ ] Badge
- [ ] Card
- [ ] Select
- [ ] Dropdown Menu
- [ ] Progress
- [ ] Toast (Sonner)
- [ ] Alert Dialog
- [ ] (Adicione conforme necessidade)

### ✅ Animações

- [ ] Instalar Motion library
- [ ] Configurar AnimatePresence
- [ ] Adicionar transitions em interações

### ✅ Estado

- [ ] Configurar Jotai para UI state
- [ ] Configurar Zustand para stores
- [ ] Configurar React Query para server state

### ✅ Ícones e Tipografia

- [ ] Instalar Lucide React
- [ ] Configurar fontes customizadas (opcional)
- [ ] Definir tamanhos padrão de ícones

### ✅ Polimento

- [ ] Customizar scrollbar
- [ ] Implementar Toast notifications (Sonner)
- [ ] Adicionar loading states
- [ ] Adicionar loading states
- [ ] Testar responsividade
- [ ] Testar acessibilidade (foco, ARIA)

---

## 🎉 Conclusão

Você agora tem **TUDO** para replicar o sistema UI/UX do 1Code:

1. **Stack completo** com versões exatas
2. **Configuração** de Tailwind e PostCSS
3. **Sistema de cores** completo (light + dark)
4. **Componentes** prontos para copiar
5. **Padrões** de estilização e animação
6. **Estado** com Jotai, Zustand e React Query
7. **Checklist** para implementação

### 🔗 Recursos Adicionais

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/primitives)
- [Motion Docs](https://motion.dev)
- [Jotai Docs](https://jotai.org)
- [shadcn/ui](https://ui.shadcn.com) - Inspiração para componentes

---

**Última atualização:** Fevereiro 2026
**Versão do projeto:** 0.0.23
