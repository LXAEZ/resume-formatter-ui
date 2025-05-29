import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { generateResumeDocx } from "./ResumeDocxDownloader";
import { generatePDFBlob, downloadResumePDF } from "./ResumePDFDownloader";
import ExportDropdown from "./ExportDropdown";
import { FileJson, FileIcon as FilePdf } from "lucide-react";

const ResumePreview = ({ parsedData }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [error, setError] = useState(null);

  // Generate PDF preview on component mount and when parsedData changes
  useEffect(() => {
    generatePDFPreview();

    // Cleanup function to revoke the blob URL when component unmounts or data changes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [parsedData]);

  const generatePDFPreview = async () => {
    if (!parsedData) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Generate PDF blob using the separated PDF generator
      const pdfBlob = generatePDFBlob(parsedData);

      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob);

      // Clean up previous URL if it exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Set the new URL to state
      setPdfUrl(url);
    } catch (error) {
      console.error("Error generating PDF preview: ", error);
      setError("Failed to generate PDF preview. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!parsedData) return;

    try {
      downloadResumePDF(parsedData);
    } catch (error) {
      console.error("Error downloading PDF: ", error);
      setError("Failed to download PDF. Please try again.");
    }
  };

  const handleDownloadDocx = async () => {
    if (!parsedData) return;

    setDownloadingDocx(true);
    try {
      await generateResumeDocx(parsedData);
    } catch (err) {
      setError(err.message || "DOCX download error");
      console.error(err);
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleRetryPreview = () => {
    setError(null);
    generatePDFPreview();
  };

  if (!parsedData) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography>No resume data available for preview.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={6}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Resume Preview
        </Typography>
        <div className="flex gap-2">
          <Button variant="outlined" onClick={() => handleDownloadPDF("json")}>
            <FileJson className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="contained" onClick={() => handleDownloadDocx("pdf")}>
            <FilePdf className="mr-2 h-4 w-4" />
            Download Docx
          </Button>
        </div>
      </Stack>

      {error && (
        <Box sx={{ textAlign: "center", py: 2, mb: 2 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="outlined" onClick={handleRetryPreview} size="small">
            Retry
          </Button>
        </Box>
      )}

      {isGenerating ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography>Generating PDF preview...</Typography>
        </Box>
      ) : pdfUrl ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 2,
          }}
        >
          <iframe
            src={pdfUrl}
            style={{
              width: "750px", // A4 width in points (~8.27in * 72)
              height: "842px", //
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
  );
};

export default ResumePreview;
