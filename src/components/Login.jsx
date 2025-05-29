import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useAuth } from "../auth/AuthContext"; // Adjust path as needed

const Login = ({ onSwitchToRegister, onClose }) => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (submitted) setSubmitted(false);
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setSuccess(""); // Clear any previous success message

    if (!formData.username.trim() || !formData.password.trim()) {
      return;
    }

    try {
      await login(formData.username, formData.password);
      // Only set success message if login actually succeeds
      setSuccess("Login successful!");
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      // Clear success message on error (though it should already be cleared)
      setSuccess("");
    }
  };

  return (
    <Box
      width="100%"
      maxWidth={400}
      borderRadius={2}
      p={4}
      boxShadow={0}
      bgcolor="background.transparent"
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight="bold">
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your credentials to access your account
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {submitted &&
        (!formData.username.trim() || !formData.password.trim()) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Username and password are required.
          </Alert>
        )}

      <form onSubmit={handleSubmit}>
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Username
          </Typography>
          <TextField
            name="username"
            placeholder="john_doe"
            fullWidth
            required
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box mb={3}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle2">Password</Typography>
          </Box>
          <TextField
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            fullWidth
            required
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ py: 1.2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Sign in"}
        </Button>
      </form>

      <Box mt={3} textAlign="center">
        <Typography variant="body2">
          Don&apos;t have an account?{" "}
          <Button
            variant="text"
            size="small"
            onClick={onSwitchToRegister}
            disabled={loading}
          >
            Sign up
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
