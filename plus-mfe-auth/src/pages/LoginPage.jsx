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
  
const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001"; 
  
// Definição do contrato de propriedades (TypeScript) 
interface LoginPageProps { 
  onLogin?: (data: any) => void; 
} 
  
export default function LoginPage({ onLogin }: LoginPageProps) { 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false); 
  
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
       
      localStorage.setItem("token", data.access_token); 
      localStorage.setItem("refresh", data.refresh_token); 
       
      alert("Acesso liberado. Autenticação concluída com sucesso."); 
       
      if (onLogin) { 
        onLogin(data); 
      } 
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
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
            // Abordagem direta e tipada para alterar a borda do input 
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
            // Abordagem direta e tipada para alterar a borda do input 
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
            {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"} 
          </Button> 
        </Box> 
      </Box> 
    </Container> 
  ); 
}