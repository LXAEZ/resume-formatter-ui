"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  ButtonGroup,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  VisibilityOutlined as VisibilityIcon,
  DownloadOutlined as DownloadIcon,
  DescriptionOutlined as DescriptionIcon,
  DeleteOutlined as DeleteIcon,
} from "@mui/icons-material";
import { FileText } from "lucide-react";
import { Text } from "lucide-react";
import { getResumesData } from "../services/api";
import { generateZipFile } from "../utils/zipGenerator";
import { downloadResumePDF } from "./ResumePDFDownloader";
import { generateResumeDocx } from "./ResumeDocxDownloader";
import { grey } from "@mui/material/colors";

const ResumeListView = ({ resumes, onPreview, onDelete }) => {
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedResumes(resumes.map((resume) => resume.id));
    } else {
      setSelectedResumes([]);
    }
  };

  const handleSelectResume = (resumeId) => {
    setSelectedResumes((prev) => {
      if (prev.includes(resumeId)) {
        return prev.filter((id) => id !== resumeId);
      } else {
        return [...prev, resumeId];
      }
    });
  };

  const handleBulkDownload = async (format) => {
    if (selectedResumes.length === 0) {
      setDownloadError("Please select at least one resume to download");
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      if (selectedResumes.length === 1) {
        // Single file download - use direct download
        const selectedResume = resumes.find((r) => r.id === selectedResumes[0]);
        if (selectedResume) {
          if (format === "pdf") {
            downloadResumePDF(selectedResume.parsed_data);
          } else if (format === "docx") {
            await generateResumeDocx(selectedResume.parsed_data);
          }
        }
      } else {
        // Multiple files - get data from backend and create ZIP
        const response = await getResumesData(selectedResumes);
        await generateZipFile(response.resumes, format);
      }

      // Clear selection after successful download
      setSelectedResumes([]);
    } catch (error) {
      setDownloadError(
        error.message || `Failed to download ${format.toUpperCase()} file(s)`
      );
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getFileName = (filename) => {
    return filename.length > 30 ? filename.substring(0, 30) + "..." : filename;
  };

  if (!resumes || resumes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <DescriptionIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No resumes uploaded yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload some resumes to see them here
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with bulk actions */}
      <Box sx={{ mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {/* Left side: Heading + Chip */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Parsed Resumes ({resumes.length})
            </Typography>
            {selectedResumes.length > 0 && (
              <Chip
                label={`${selectedResumes.length} selected`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ height: 18 }} // Match Typography height better
              />
            )}
          </Stack>

          {/* Right side: Download buttons */}
          {selectedResumes.length > 0 && (
            <ButtonGroup
              size="small"
              disableElevation
              sx={{
                "& .MuiButton-root": {
                  backgroundColor: "#1976d2", // custom blue
                  color: "#fff", // white text
                  fontWeight: 500,
                  border: "1px solid #1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0", // darker blue on hover
                  },
                },
                "& .MuiButtonGroup-grouped:not(:last-of-type)": {
                  borderRight: "3px solid #fff", // white divider
                },
              }}
            >
              <Button
                startIcon={
                  downloading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <FileText size={15} />
                  )
                }
                onClick={() => handleBulkDownload("pdf")}
                disabled={downloading}
              >
                {downloading ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                startIcon={
                  downloading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Text size={15} />
                  )
                }
                onClick={() => handleBulkDownload("docx")}
                disabled={downloading}
              >
                {downloading ? "Generating..." : "Download DOCX"}
              </Button>
            </ButtonGroup>
          )}
        </Stack>

        {downloadError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setDownloadError(null)}
          >
            {downloadError}
          </Alert>
        )}

        {downloading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {selectedResumes.length === 1
              ? "Generating file..."
              : `Generating ZIP file with ${selectedResumes.length} resumes... This may take a few moments.`}
          </Alert>
        )}
      </Box>

      {/* Resume table */}
      <TableContainer
        component={Paper}
        sx={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          mb: 2,
          boxShadow: 0,
          maxHeight: 300,
          overflow: "auto",
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedResumes.length > 0 &&
                    selectedResumes.length < resumes.length
                  }
                  checked={
                    resumes.length > 0 &&
                    selectedResumes.length === resumes.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Candidate</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Size
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resumes.map((resume, index) => {
              const isSelected = selectedResumes.includes(resume.id);
              const isOdd = index % 2 === 0; // zero-based: 0,2,4... are “odd” rows visually
              return (
                <TableRow
                  key={resume.id}
                  onClick={() => handleSelectResume(resume.id)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? "#CFFFDF" // always highlight selected
                      : isOdd
                      ? "#fafafa" // default odd row grey
                      : "transparent", // default even row white
                  }}
                >
                  <TableCell
                    padding="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectResume(resume.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getFileName(resume.filename)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {resume.parsed_data?.personal_details?.name || "Unknown"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(resume.file_size)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resume.status === "success" ? "Parsed" : "Failed"}
                      color={resume.status === "success" ? "success" : "error"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(resume);
                        }}
                        sx={{}}
                      >
                        <VisibilityIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      {onDelete && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(resume.id);
                          }}
                          sx={{ border: 1, borderColor: "grey.300" }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResumeListView;
