# Manual de UI - plus-mfe-auth

Componente exposto: LoginPage
Caminho de import: mfe_auth/LoginPage
Arquivo fonte: src/pages/LoginPage.tsx

Props:
  onLogin (function, opcional) - callback apos login bem-sucedido

Comportamento:
  1. Formulario com E-mail e Senha (MUI TextField)
  2. POST para VITE_MS_AUTH_URL/auth/login
  3. Sucesso: salva access_token e refresh_token no localStorage, chama onLogin
  4. Erro: exibe Alert vermelho com mensagem da API

Variaveis de Ambiente:
  VITE_MS_AUTH_URL http://localhost:3001 URL do plus-ms-auth

Como consumir no Shell:
  // vite.config.js
  federation({ remotes: { mfe_auth: 'http://localhost:4001/assets/remoteEntry.js' } })

  // App.jsx
  const LoginPage = lazy(() => import('mfe_auth/LoginPage'));

Tecnologias: React 18 + TypeScript + MUI v9 + Vite 5 + Module Federation