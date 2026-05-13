/*
 * plus-mfe-auth/src/pages/LoginPage.tsx
 *
 * Componente principal do micro-frontend de autenticação.
 *
 * Papel na arquitetura:
 *   É o único componente exposto pelo plus-mfe-auth via Module Federation.
 *   O Shell o importa dinamicamente como `mfe_auth/LoginPage` e o renderiza
 *   na rota /login, passando `onLogin` como callback de pós-autenticação.
 *
 * Fluxo de dados:
 *   1. Usuário preenche email/senha e submete o formulário.
 *   2. handleSubmit faz POST para o plus-ms-auth (/auth/login).
 *   3. Em caso de sucesso, armazena os tokens no localStorage.
 *   4. Chama onLogin(data) para notificar o Shell, que então navega para /.
 *
 * Conexões externas:
 *   - plus-ms-auth: API REST de autenticação (porta 3001 em dev).
 *   - localStorage: contrato com o Shell — "token" é verificado por PrivateRoute.
 *   - onLogin prop: desacopla o MFE da lógica de navegação do Shell.
 */

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  CircularProgress
} from "@mui/material";

// URL do microserviço de autenticação. Injetada em build-time pelo Vite.
// Trade-off: variável de ambiente é resolvida no build, não em runtime —
// mudar a URL exige rebuild. Para flexibilidade total usaríamos um config.json.
const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

/*
 * Contrato de props deste componente.
 * onLogin é opcional para compatibilidade com uso standalone (main.jsx de dev).
 * Em produção, o Shell sempre passa onLogin para disparar a navegação pós-login.
 */
interface LoginPageProps {
  onLogin?: (data: any) => void;
}

/*
 * LoginPage — formulário de autenticação do sistema.
 *
 * Gerencia localmente o estado do formulário (email, password, error, loading).
 * Não usa context/store global porque todo o estado é efêmero e descartado após login.
 */
export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /*
   * Submissão do formulário de login.
   *
   * Faz POST para /auth/login e, em caso de sucesso:
   *   - Persiste access_token (JWT curto) e refresh_token (JWT longo) no localStorage.
   *   - Notifica o Shell via onLogin para acionar a navegação.
   *
   * Trade-off do localStorage: simples e síncrono, mas exposto a XSS.
   * Uma alternativa mais segura seria httpOnly cookie, porém requereria
   * configuração de CORS/SameSite no backend e é mais complexo com MFEs.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao fazer login");
      }

      const data = await res.json();

      // access_token: usado em cada requisição autenticada (expiração curta, ex: 15min).
      // refresh_token: usado para renovar o access_token sem novo login (expiração longa).
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh", data.refresh_token);

      alert("Acesso liberado. Autenticação concluída com sucesso.");

      if (onLogin) {
        onLogin(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      // Garante que o loading é removido tanto em sucesso quanto em erro.
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderRadius: 2,
          backgroundColor: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}
      >
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600, mb: 1, color: "#111827" }}>
          Estoque de Roupas Plus Size
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "#6b7280" }}>
          Acesso ao Sistema
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            disableElevation
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              borderRadius: 1.5,
              backgroundColor: "#111827",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "#374151"
              }
            }}
          >
            {/* CircularProgress substitui o texto para feedback visual imediato durante a requisição */}
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}