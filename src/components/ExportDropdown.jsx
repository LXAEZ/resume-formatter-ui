import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";

const ExportDropdown = ({
  downloadPDF,
  handleDownloadDocx,
  downloadingDocx,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handlePDF = () => {
    handleClose();
    downloadPDF();
  };

  const handleDocx = () => {
    handleClose();
    handleDownloadDocx();
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        endIcon={<ArrowDropDownIcon />}
        onClick={handleClick}
      >
        Export
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handlePDF}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="PDF" />
        </MenuItem>
        <MenuItem onClick={handleDocx} disabled={downloadingDocx}>
          <ListItemIcon>
            {downloadingDocx ? (
              <CircularProgress size={20} />
            ) : (
              <DescriptionIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary="Docx" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportDropdown;
