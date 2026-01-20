# Inspector Mode - React Component Detection

O Inspector Mode permite que você selecione componentes React no preview usando React Grab e adicione automaticamente o caminho do arquivo ao contexto do chat do 1code.

## 🚀 Como Usar

### Passo 1: Instalar React Grab no seu projeto

Se você ainda não tem React Grab instalado:

```bash
npx -y grab@latest init
```

Ou instale manualmente:

```bash
npm install react-grab
# ou
bun add react-grab
```

### Passo 2: Adicionar o plugin de integração com 1code

No arquivo onde você inicializa o React Grab (geralmente `main.tsx` ou `App.tsx`), adicione nosso plugin customizado:

```typescript
if (window.ReactGrab) {
  const api = window.ReactGrab.init();

  // Plugin que envia dados para o 1code
  api.registerPlugin({
    name: '1code-integration',
    hooks: {
      onCopySuccess: (elements, content) => {
        // Envia para a janela pai (1code)
        window.parent.postMessage({
          type: 'REACT_GRAB_COMPONENT',
          data: { content, elements }
        }, '*');
      }
    }
  });

  api.activate();
}
```

### Passo 3: Usar o Inspector Mode

1. Abra o preview no 1code
2. Clique no botão **Target** (🎯) na toolbar do preview
3. Instruções aparecerão no topo do preview
4. No seu app:
   - Passe o mouse sobre um componente React
   - Pressione **⌘C** (Mac) ou **Ctrl+C** (Windows/Linux)
5. O componente será adicionado automaticamente ao contexto do chat!
6. Agora você pode pedir ao Claude para modificar esse componente

## 🎯 Exemplo de Uso

```
[Você aponta para um botão e pressiona ⌘C]
Toast: "Component added to context"

Você: "Change this button color to blue and make it larger"

Claude: [Recebe o contexto: src/components/LoginButton.tsx:45:10]
Claude: [Modifica o arquivo correto automaticamente]
```

## 📋 Como Funciona

1. **React Grab** detecta componentes React usando a árvore Fiber (dev mode)
2. Quando você pressiona **⌘C** em um componente, o `onCopySuccess` hook é acionado
3. **Nosso plugin** envia os dados via `postMessage` para o 1code
4. **1code** adiciona o caminho do arquivo ao contexto do chat
5. **Claude** recebe o contexto e sabe exatamente qual arquivo modificar

## ⚠️ Limitações

### 1. Só funciona em desenvolvimento
Apps em produção não têm source maps React necessários para detectar os caminhos dos arquivos.

### 2. Só funciona com React
O React Grab depende do React Fiber. Não funciona com:
- Vue.js
- Svelte
- Angular
- Vanilla JS

### 3. Qualidade depende do bundler
- **Vite**: Excelente (nome, arquivo, linha, coluna)
- **Webpack**: Bom (nome, arquivo, linha)
- **Next.js**: Bom (nome, arquivo)
- **CRA**: Limitado

## 🛠️ Troubleshooting

### "Component added to context" não aparece

**Solução:** Verifique se o plugin está instalado corretamente:
1. Abra o DevTools do preview (Cmd+Option+I)
2. No console, digite: `window.ReactGrab`
3. Se retornar `undefined`, o React Grab não está instalado
4. Se retornar um objeto, verifique se o plugin está registrado

### Componente detectado mas sem caminho

**Causa:** Source maps desabilitados ou modo produção

**Solução:**
- Confirme que está em `NODE_ENV=development`
- Verifique se o bundler gera source maps
- Vite: `sourcemap: true` no config
- Webpack: `devtool: 'source-map'`

### React Grab não detecta componentes

**Causa:** React DevTools não funciona = source maps ausentes

**Solução:**
1. Instale React DevTools no browser
2. Se não aparecer no DevTools, source maps estão desabilitados
3. Configure seu bundler para gerar source maps em dev mode

### Plugin não envia dados

**Verificação:**
```typescript
// Adicione log para debug
onCopySuccess: (elements, content) => {
  console.log('React Grab - Component copied:', content);
  window.parent.postMessage({
    type: 'REACT_GRAB_COMPONENT',
    data: { content, elements }
  }, '*');
}
```

Se o log aparece mas o toast não, o problema está na comunicação postMessage.

## 📦 Estrutura Completa do Setup

```typescript
// src/main.tsx (ou App.tsx)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// React Grab + 1code Integration (dev only)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Carregar React Grab dinamicamente
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/react-grab@latest/dist/umd/index.min.js';
  script.async = true;

  script.onload = () => {
    if (window.ReactGrab) {
      const api = window.ReactGrab.init();

      // Plugin de integração com 1code
      api.registerPlugin({
        name: '1code-integration',
        hooks: {
          onCopySuccess: (elements, content) => {
            console.log('[1code] Component copied:', content);
            window.parent.postMessage({
              type: 'REACT_GRAB_COMPONENT',
              data: { content, elements }
            }, '*');
          }
        }
      });

      api.activate();
      console.log('[1code] Inspector integration active');
    }
  };

  document.head.appendChild(script);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 📚 Recursos

- [React Grab - GitHub](https://github.com/aidenybai/react-grab)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite Source Maps](https://vitejs.dev/config/build-options.html#build-sourcemap)
- [Webpack Source Maps](https://webpack.js.org/configuration/devtool/)

## 🤝 Suporte

Problemas ou dúvidas? Abra uma issue no repositório do 1code com:
- Framework e bundler usados (Vite, Webpack, Next.js, etc.)
- Mensagens de erro do console
- Screenshot do problema
- Se o React DevTools funciona no seu app
