/*
 * plus-shell/src/App.jsx
 *
 * Componente raiz do Shell — orquestra o roteamento global e o carregamento
 * dos micro-frontends remotos.
 *
 * Papel na arquitetura:
 *   O Shell é o "host" do Module Federation. Ele não implementa features de
 *   domínio; apenas decide QUAL MFE exibir para cada rota. Novos MFEs são
 *   adicionados aqui sem alterar os demais.
 *
 * Conexões externas:
 *   - mfe_auth/LoginPage: componente remoto provido pelo plus-mfe-auth (porta 4001).
 *     Resolvido em runtime pelo Module Federation, não existe no bundle do Shell.
 *   - localStorage["token"]: contrato implícito com o plus-mfe-auth — após login
 *     bem-sucedido o MFE armazena o JWT e o Shell usa isso para proteger rotas.
 */

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// lazy() adia o download do chunk do MFE para o momento em que a rota é acessada.
// Trade-off: primeira visita à /login tem latência extra (fetch do remoteEntry.js
// + chunk do componente), mas o bundle inicial do Shell permanece pequeno.
const LoginPage = lazy(() => import("mfe_auth/LoginPage"));

/*
 * Guarda de rota que verifica autenticação antes de renderizar conteúdo protegido.
 *
 * Usa localStorage como fonte de verdade no lado cliente. Trade-off: o token pode
 * estar expirado — a API rejeitará a requisição nesse caso. Uma verificação mais
 * robusta chamaria o backend, mas para este contexto localStorage é suficiente.
 */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  // Se não há token, redireciona para /login sem registrar histórico (replace),
  // evitando que o botão "voltar" retorne à rota protegida.
  return token ? children : <Navigate to="/login" replace />;
}

/*
 * Tela principal pós-login. Placeholder do módulo de gestão de estoque.
 * Centraliza a ação de logout: limpa todo o localStorage (tokens + dados de sessão)
 * e força navegação hard para /login, garantindo que estado React não persista.
 */
function Dashboard() {
  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Plus — Dashboard</h1>
      <p>Bem-vindo ao sistema de gestão de estoque.</p>
      <button
        onClick={() => {
          // localStorage.clear() remove access_token e refresh_token de uma vez.
          // window.location.href provoca reload completo, limpando estado React.
          localStorage.clear();
          window.location.href = "/login";
        }}
      >
        Sair
      </button>
    </div>
  );
}

/*
 * Componente App — define o roteamento declarativo da aplicação.
 *
 * Suspense envolve todas as rotas porque qualquer delas pode conter um MFE remoto
 * carregado com lazy(). O fallback é exibido enquanto o chunk JavaScript chega
 * pela rede — especialmente relevante na primeira carga do plus-mfe-auth.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<p>Carregando...</p>}>
        <Routes>
          <Route
            path="/login"
            element={
              // onLogin é o contrato de comunicação Shell ↔ MFE:
              // o MFE chama essa prop após salvar o token, e o Shell decide para
              // onde navegar. Mantém o MFE desacoplado da lógica de roteamento do Shell.
              <LoginPage
                onLogin={() => (window.location.href = "/")}
              />
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
