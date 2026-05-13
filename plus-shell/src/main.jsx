/*
 * plus-shell/src/main.jsx
 *
 * Ponto de entrada da aplicação Shell.
 * O Shell é o "host" no padrão Module Federation: ele orquestra quais
 * micro-frontends remotos são carregados e gerencia o roteamento global.
 * Este arquivo monta o componente raiz (App) no DOM e nada mais —
 * toda a lógica de roteamento e carregamento de MFEs fica em App.jsx.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// createRoot é a API moderna do React 18 — habilita concurrent features
// (Suspense, transições) necessárias para o lazy loading dos MFEs remotos.
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode ativa verificações extras em desenvolvimento (double-invoke de efeitos).
  // Não tem custo em produção.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
