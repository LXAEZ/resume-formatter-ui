import React from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const AuthModal = ({ open, onClose, children }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogContent sx={{ position: "relative", pt: 4 }}>
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>
      {children}
    </DialogContent>
  </Dialog>
);

export default AuthModal;