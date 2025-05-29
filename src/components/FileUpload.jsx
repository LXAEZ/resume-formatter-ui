import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

const FileUpload = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");

  const validFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const fileExtensions = "PDF, DOC, DOCX";

  const validateFile = (file) => {
    return validFileTypes.includes(file.type);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = (fileList) => {
    const files = Array.from(fileList);
    const validFiles = [];
    let hasError = false;

    files.forEach((file) => {
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        hasError = true;
      }
    });

    if (hasError) {
      setError(`Some files were invalid. Only ${fileExtensions} are allowed.`);
    } else {
      setError("");
    }

    if (validFiles.length > 0) {
      onFileSelect(validFiles); // Send array of valid files
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <Box>
      <Paper
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: "2px dashed",
          borderColor: dragActive
            ? "primary.main"
            : error
            ? "error.main"
            : "grey.300",
          borderRadius: 2,
          boxShadow: 0,
          p: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease-in-out",
          cursor: "pointer",
        }}
      >
        <input
          type="file"
          id="file-upload"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple
          onChange={handleChange}
          style={{ display: "none" }}
        />

        <FileUploadOutlinedIcon
          sx={{
            fontSize: 60,
            color: error ? "error.main" : "primary.main",
            mb: 2,
          }}
        />

        <Typography variant="h6" component="h2" gutterBottom>
          Drag and drop your resume(s)
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          or click to browse files (PDF, DOC, DOCX)
        </Typography>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <label htmlFor="file-upload">
          <Button
            component="span"
            variant="outlined"
            sx={{
              color: "#00000",
              borderColor: "#B7B7B7",
              "&:hover": {
                borderColor: "grey.600",
                backgroundColor: "grey.100",
              },
            }}
          >
            Browse Files
          </Button>
        </label>
      </Paper>
    </Box>
  );
};

export default FileUpload;
