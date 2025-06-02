"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Tabs,
  ButtonGroup,
  Tab,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileTextIcon from "@mui/icons-material/Description";
import FilePdfIcon from "@mui/icons-material/PictureAsPdf";
import JsonViewer from "./JsonViewer";
import { FileText, File } from "lucide-react";
import { generatePDFBlob } from "./ResumePDFDownloader";
import { downloadResumePDF } from "./ResumePDFDownloader";
import { generateResumeDocx } from "./ResumeDocxDownloader";

const ResumePreviewModal = ({ open, onClose, resume }) => {
  const [viewMode, setViewMode] = useState("preview");
  const [downloading, setDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Generate PDF preview when resume changes
  useEffect(() => {
    if (resume?.parsed_data && viewMode === "preview") {
      generatePDFPreview();
    }

    // Cleanup function
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [resume, viewMode]);

  const generatePDFPreview = async () => {
    if (!resume?.parsed_data) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Generate PDF blob using the separated PDF generator
      const pdfBlob = generatePDFBlob(resume.parsed_data);

      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob);

      // Clean up previous URL if it exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Set the new URL to state
      setPdfUrl(url);
    } catch (err) {
      console.error("Error generating PDF preview: ", err);
      setError("Failed to generate PDF preview. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resume?.parsed_data) return;

    setDownloading(true);
    try {
      downloadResumePDF(resume.parsed_data);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setError("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!resume?.parsed_data) return;

    setDownloading(true);
    try {
      await generateResumeDocx(resume.parsed_data);
    } catch (error) {
      console.error("Error downloading DOCX:", error);
      setError("Failed to download DOCX. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  if (!resume) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: "flex",
        alignItems: "stretch",
        justifyContent: "stretch",
      }}
    >
      <Box
        sx={{
          bgcolor: "background.paper",
          width: "100vw",
          height: "100vh",
          overflowY: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            p: 2,
            zIndex: 1,
          }}
        >
          {/* Title Section - Centered with Close Button */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 2 }}
          >
            <Box sx={{ flex: 1 }} />
            <Box sx={{ textAlign: "center", flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {resume.filename}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {resume.parsed_data?.personal_details?.name ||
                  "Unknown Candidate"}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Stack>

          {/* Controls Row - Tabs on left, Buttons on right */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* View mode tabs - Left side */}
            <div className="grid w-full grid-cols-2 rounded-md bg-gray-100 p-1 max-w-[200px]">
              <button
                className={`flex items-center justify-center rounded-md px-1.5 py-1.5 text-xs font-medium transition ${
                  viewMode === "preview"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                onClick={() => handleViewModeChange("preview")}
              >
                Preview
              </button>
              <button
                className={`flex items-center justify-center rounded-md px-1.5 py-1.5 text-xs font-medium transition ${
                  viewMode === "json"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
                onClick={() => handleViewModeChange("json")}
              >
                JSON Data
              </button>
            </div>

            {/* Download buttons - Right side */}
            <ButtonGroup
              size="small"
              disableElevation
              sx={{
                "& .MuiButton-root": {
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  fontWeight: 500,
                  border: "1px solid #1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                },
                "& .MuiButtonGroup-grouped:not(:last-of-type)": {
                  borderRight: "3px solid #fff",
                },
              }}
            >
              <Button
                startIcon={
                  downloading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <FileText size={16} />
                  )
                }
                onClick={handleDownloadPDF}
                disabled={downloading}
              >
                {downloading ? "Generating..." : "Download PDF"}
              </Button>

              <Button
                startIcon={
                  downloading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <File size={16} />
                  )
                }
                onClick={handleDownloadDocx}
                disabled={downloading}
              >
                {downloading ? "Generating..." : "Download DOCX"}
              </Button>
            </ButtonGroup>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          {viewMode === "preview" ? (
            <Box
              sx={{
                maxWidth: "750px",
                mx: "auto",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {isGenerating ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 8,
                  }}
                >
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography>Generating PDF preview...</Typography>
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="error" gutterBottom>
                    {error}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={generatePDFPreview}
                    size="small"
                  >
                    Retry
                  </Button>
                </Box>
              ) : pdfUrl ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 2,
                    width: "100%",
                  }}
                >
                  <iframe
                    src={pdfUrl}
                    style={{
                      width: "750px",
                      height: "842px",
                      border: "1px solid #e0e0e0",
                    }}
                    title="Resume PDF Preview"
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography>Failed to generate PDF preview.</Typography>
                  <Button
                    variant="outlined"
                    onClick={generatePDFPreview}
                    sx={{ mt: 2 }}
                  >
                    Retry Preview
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                maxWidth: "750px",
                mx: "auto",
                width: "100%",
              }}
            >
              <JsonViewer data={resume.parsed_data} />
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default ResumePreviewModal;
