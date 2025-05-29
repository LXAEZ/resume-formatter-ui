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

const Register = ({ onSwitchToLogin, onClose }) => {
  const { signup, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (passwordError) setPasswordError("");
    if (formError) setFormError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setFormError("");
    setSuccess("");

    // Validation
    if (
      !formData.username.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await signup(formData.username, formData.password);
      setSuccess("Account created successfully!");
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      // Error handled by context
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
          Create an account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your information to create an account
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {passwordError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {passwordError}
        </Alert>
      )}
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
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
          <Typography variant="subtitle2" gutterBottom>
            Password
          </Typography>
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

        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Confirm Password
          </Typography>
          <TextField
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            fullWidth
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
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
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <Box mt={3} textAlign="center">
        <Typography variant="body2">
          Already have an account?{" "}
          <Button
            variant="text"
            size="small"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Sign in
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
