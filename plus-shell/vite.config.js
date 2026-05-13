/*
 * plus-shell/vite.config.js
 *
 * Configuração do Vite para a aplicação Shell (host do Module Federation).
 *
 * Papel na arquitetura:
 *   Define o Shell como "host" no padrão Module Federation. Declara quais remotos
 *   ele consome (mfe_auth) e quais dependências são compartilhadas para evitar
 *   duplicação de bundles (react, react-dom devem existir uma única vez na página).
 *
 * Conexões externas:
 *   - MFE_AUTH_URL aponta para o remoteEntry.js do plus-mfe-auth. Em dev, usa
 *     localhost:4001; em produção, substituído via variável de ambiente.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// Permite sobrescrever a URL do MFE em produção (ex: CDN ou nginx proxy)
// sem rebuildar o Shell. Padrão aponta para dev local do plus-mfe-auth.
const MFE_AUTH_URL =
  process.env.MFE_AUTH_URL || "http://localhost:4001/assets/remoteEntry.js";

export default defineConfig({
  plugins: [
    react(),
    federation({
      // Identificador único deste host no grafo do Module Federation.
      name: "shell",
      remotes: {
        // mfe_auth é o alias usado nos imports: import("mfe_auth/LoginPage").
        // O valor é a URL do manifest de módulos gerado pelo build do plus-mfe-auth.
        mfe_auth: MFE_AUTH_URL,
      },
      // shared garante que React seja instanciado uma única vez mesmo com múltiplos
      // MFEs carregados. Duas instâncias de React na mesma página causam erros de
      // contexto e hooks inválidos.
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    // esnext é exigido pelo Module Federation do Vite: usa import() dinâmico nativo,
    // que não funciona em targets mais antigos sem polyfills pesados.
    target: "esnext",
    // minify: false facilita depuração de problemas de Module Federation em build.
    minify: false,
  },
  server: {
    port: 3000,
    host: true, // Expõe em 0.0.0.0 para acesso via Docker/rede local.
  },
  preview: {
    port: 3000,
    host: true,
  },
});