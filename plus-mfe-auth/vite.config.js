/*
 * plus-mfe-auth/vite.config.js
 *
 * Configuração do Vite para o micro-frontend de autenticação (remote).
 *
 * Papel na arquitetura:
 *   Define este MFE como "remote" no Module Federation: ele compila seus
 *   componentes em chunks independentes e gera o remoteEntry.js — o manifesto
 *   que o Shell consulta para descobrir o que está disponível.
 *
 * Conexões externas:
 *   - O Shell (plus-shell) referencia este remoteEntry.js via MFE_AUTH_URL.
 *   - LoginPage é o único componente exposto; novos componentes são adicionados
 *     em `exposes` sem alterações no Shell (princípio Open/Closed do MF).
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      // Nome que identifica este remote no grafo do Module Federation.
      // Deve coincidir com a chave declarada em `remotes` do Shell.
      name: "mfe_auth",
      // Arquivo gerado no build que lista todos os módulos expostos.
      // O Shell faz fetch deste arquivo para montar o grafo de dependências.
      filename: "remoteEntry.js",
      exposes: {
        // Alias público → caminho local. O Shell importa como "mfe_auth/LoginPage".
        // Trade-off: expor por alias desacopla o path interno do contrato público,
        // permitindo mover o arquivo sem quebrar o Shell.
        "./LoginPage": "./src/pages/LoginPage.tsx",
      },
      // Compartilhar React evita duas instâncias na mesma página (causa erros de hooks).
      // O Shell é o singleton provider; este MFE usa a instância do host.
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext", // Exigido pelo Module Federation do Vite para import() dinâmico nativo.
    minify: false,    // Facilita depuração de problemas de federação em build de QA.
  },
  server: {
    port: 4001,
    host: true, // Expõe em 0.0.0.0 para acesso via Docker/rede local.
  },
  preview: {
    port: 4001,
    host: true,
  },
});


