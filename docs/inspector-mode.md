# Inspector Mode - React Component Detection

O Inspector Mode permite que você clique em componentes React no preview e adicione automaticamente o caminho do arquivo ao contexto do chat, facilitando solicitações específicas ao Claude.

## 🚀 Como Usar

### Opção 1: Injeção Automática (Same-Origin)

Se o seu preview estiver rodando no mesmo domínio do 1code, a injeção é automática:

1. Abra um preview no chat
2. Clique no botão **Target** (🎯) na toolbar do preview
3. Passe o mouse sobre um componente React
4. Pressione **⌘C** (Mac) ou **Ctrl+C** (Windows/Linux)
5. O componente será adicionado ao contexto do chat

### Opção 2: Setup Manual (Cross-Origin)

Se o preview estiver em um domínio diferente (ex: `localhost:3000` enquanto o 1code roda em `localhost:5173`), você precisa adicionar o código manualmente ao seu projeto:

1. Clique no botão **Target** (🎯) no preview
2. Um dialog aparecerá com instruções e código
3. Copie o código fornecido
4. Cole no entry point do seu app (ex: `main.tsx` ou `App.tsx`)
5. Recarregue seu app
6. Agora você pode usar o Inspector Mode normalmente

#### Código para Setup Manual

```typescript
// Add this to your app's entry point (e.g., main.tsx or App.tsx)
// This enables component inspection with 1code

if (typeof window !== 'undefined') {
  // Load React Grab dynamically
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/react-grab@latest/dist/umd/index.min.js';
  script.async = true;

  script.onload = () => {
    if (window.ReactGrab) {
      const api = window.ReactGrab.init();

      // Send component info to parent window (1code)
      api.registerPlugin({
        name: '1code-integration',
        hooks: {
          onCopySuccess: (elements, content) => {
            window.parent.postMessage({
              type: 'REACT_GRAB_COMPONENT',
              data: { content, elements }
            }, '*');
          }
        }
      });

      api.activate();
    }
  };

  document.head.appendChild(script);
}
```

## ⚠️ Limitações

### 1. Só funciona em modo desenvolvimento
Apps em produção não têm source maps React, então o Inspector Mode não consegue detectar os caminhos dos arquivos.

### 2. Só funciona com React
O React Grab depende do React Fiber (árvore interna do React). Não funciona com:
- Vue.js
- Svelte
- Angular
- Vanilla JS

### 3. Cross-Origin Restrictions
Por segurança, navegadores bloqueiam acesso a iframes de origens diferentes. Por isso:
- ✅ Funciona automaticamente quando preview e 1code estão no mesmo domínio
- ❌ Requer setup manual quando estão em domínios diferentes

### 4. Dependência do Bundler
A quantidade de informação disponível depende do bundler:
- **Vite**: Excelente suporte (nome, arquivo, linha, coluna)
- **Webpack**: Bom suporte (nome, arquivo, linha)
- **Next.js**: Bom suporte (nome, arquivo)
- **Create React App**: Suporte limitado

## 🔍 Como Funciona

O Inspector Mode usa a biblioteca [React Grab](https://github.com/aidenybai/react-grab) criada por Aiden Bai. Esta biblioteca:

1. Acessa a árvore React Fiber (estrutura interna do React em dev mode)
2. Detecta qual componente está sendo apontado
3. Extrai informações do componente:
   - Nome do componente
   - Caminho do arquivo fonte
   - Linha e coluna no código
4. Envia essas informações via `postMessage` para o 1code
5. O 1code adiciona ao contexto do chat como "text context"

Quando você envia uma mensagem, o Claude recebe:
```
User: Change the button color to blue

[Context: Component at src/components/LoginForm.tsx:45:10]
```

Isso permite que o Claude saiba exatamente qual arquivo modificar sem precisar perguntar ou procurar.

## 🎯 Casos de Uso

### 1. Modificar Componentes Específicos
```
Usuário clica no botão de login e pressiona ⌘C
Usuário: "Change this button to be primary variant"
Claude: Modifica src/components/LoginButton.tsx
```

### 2. Debug de Layouts
```
Usuário clica em um card desalinhado e pressiona ⌘C
Usuário: "Fix the alignment of this card"
Claude: Ajusta o CSS em src/components/Card.tsx
```

### 3. Refatoração
```
Usuário clica em múltiplos componentes similares
Usuário: "Extract these into a shared component"
Claude: Cria componente comum e refatora os arquivos
```

## 🛠️ Troubleshooting

### Inspector Mode não ativa
- Verifique se o preview está carregado
- Confirme que é um app React em dev mode
- Tente recarregar o preview

### Não detecta componentes
- Verifique se o React DevTools funciona no app (se não funcionar, source maps estão desabilitados)
- Confirme que está em modo desenvolvimento, não produção
- Verifique console do preview para erros

### Error: "Cross-origin iframe"
- Normal quando preview está em domínio diferente
- Siga as instruções do setup manual (Opção 2 acima)

### Componente detectado mas sem caminho de arquivo
- Source maps podem estar desabilitados
- Verifique config do bundler (Vite/Webpack)
- Em modo produção, isso é esperado

## 📚 Recursos Adicionais

- [React Grab no GitHub](https://github.com/aidenybai/react-grab)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Como funcionam Source Maps](https://web.dev/source-maps/)

## 🤝 Contribuindo

Se encontrar bugs ou tiver sugestões para o Inspector Mode:
1. Abra uma issue no repositório do 1code
2. Descreva o problema e os passos para reproduzir
3. Inclua informações sobre seu setup (framework, bundler, browser)
