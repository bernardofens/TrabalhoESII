/*
 * plus-mfe-auth/src/main.jsx
 *
 * Ponto de entrada standalone do micro-frontend de autenticação.
 *
 * Papel na arquitetura:
 *   Este arquivo existe APENAS para desenvolvimento isolado do MFE.
 *   Em produção, o Shell (plus-shell) carrega LoginPage diretamente via
 *   Module Federation — este main.jsx não é executado nesse contexto.
 *   Isso permite desenvolver e testar o MFE sem precisar subir o Shell.
 *
 * Conexões externas:
 *   - LoginPage: componente exportado pelo MFE e consumido pelo Shell.
 *   - onLogin: simulado com console.log em dev; em prod o Shell passa
 *     a navegação real como prop.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import LoginPage from "./pages/LoginPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* onLogin fake para desenvolvimento isolado: apenas loga os tokens recebidos */}
    <LoginPage onLogin={(data) => console.log("Logado:", data)} />
  </React.StrictMode>
);