"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  IconButton,
  Tooltip,
  TableRow,
} from "@mui/material";
import FileUpload from "./FileUpload";
import ResumeListView from "./ResumeListView";
import ResumePreviewModal from "./ResumePreviewModal";
import { useAuth } from "../auth/AuthContext";
import { parseMultipleResumes, deleteResume } from "../services/api";
import Login from "./Login";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CloseIcon from "@mui/icons-material/Close";

const ResumeParser = () => {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [parsedResumes, setParsedResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedResume, setSelectedResume] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");

  const [history, setHistory] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("resumeHistory");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("resumeHistory", JSON.stringify(history));
  }, [history]);

  if (!isAuthenticated) {
    return <Login />;
  }
  const handleRemoveFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };
  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.isArray(selectedFiles)
      ? selectedFiles
      : Array.from(selectedFiles);
    setFiles(fileArray);
    setStep(1);
  };

  const handleProcess = async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress(0);

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // Process all files
      const result = await parseMultipleResumes(files);

      // Complete the progress
      setLoadingProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        if (result.results && result.results.length > 0) {
          setParsedResumes(result.results);

          // Add to history
          const newHistoryEntries = result.results.map((resume) => ({
            id: resume.id,
            name: resume.filename,
            size: resume.file_size,
            date: new Date().toLocaleString(),
            data: resume.parsed_data,
          }));

          setHistory((prev) => [...prev, ...newHistoryEntries]);
          setStep(2);
        }

        if (result.errors && result.errors.length > 0) {
          setError(
            `${result.errors.length} files failed to process: ${result.errors
              .map((e) => e.filename)
              .join(", ")}`
          );
        }

        setLoadingProgress(0);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || "Failed to parse resumes");
      setLoadingProgress(0);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setFiles([]);
    setParsedResumes([]);
    setError(null);
    setLoadingProgress(0);
  };

  const handlePreviewResume = (resume) => {
    setSelectedResume(resume);
  };

  const handleDeleteResume = async (resumeId) => {
    try {
      await deleteResume(resumeId);
      setParsedResumes((prev) => prev.filter((r) => r.id !== resumeId));
      setHistory((prev) => prev.filter((h) => h.id !== resumeId));
    } catch (error) {
      setError("Failed to delete resume");
    }
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2);
  };

  return (
    <Box maxWidth="mx" mx="auto" my={4} px={8}>
      <Typography
        variant="h4"
        align="left"
        mx="auto"
        my={4}
        px={0}
        sx={{ fontWeight: 600 }}
      >
        Dashboard
      </Typography>

      {/* Toggle Switch Button */}
      <div className="mb-4">
        <div className="grid w-full grid-cols-2 rounded-md bg-gray-100 p-1 lg:w-[400px]">
          <button
            className={`flex items-center justify-center rounded-md py-2 text-sm font-medium transition ${
              activeTab === "upload"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("upload")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload
          </button>
          <button
            className={`flex items-center justify-center rounded-md py-2 text-sm font-medium transition ${
              activeTab === "history"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            History
          </button>
        </div>
      </div>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 1,
          mt: 2,
          boxShadow: 0,
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Upload View */}
        {activeTab === "upload" && step === 0 && (
          <>
            <Typography variant="h5" align="left" sx={{ fontWeight: 550 }}>
              Upload Resumes
            </Typography>
            <Typography align="left" color="text.secondary" sx={{ mb: 4 }}>
              Supported formats PDF and Word documents. You can select multiple
              files.
            </Typography>
            <FileUpload onFileSelect={handleFileSelect} multiple={true} />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={3}
            >
              <Button variant="outlined" disabled>
                Cancel
              </Button>
              <Button variant="contained" disabled>
                Upload Resumes
              </Button>
            </Box>
          </>
        )}

        {activeTab === "upload" && step === 1 && (
          <>
            {/* Title & Loading Bar Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 550 }}>
                Upload Resumes
              </Typography>

              {loading && (
                <Box width={150} sx={{ display: "flex", alignItems: "center" }}>
                  <LinearProgress
                    variant="determinate"
                    value={loadingProgress}
                    sx={{
                      flexGrow: 1,
                      height: 4,
                      borderRadius: 2,
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#00ff2e",
                      },
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Files selected count */}
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </Typography>

            {/* Files Table */}
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
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: 600, width: 40 }}>
                      S.No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, width: 120 }}
                      align="right"
                    >
                      Size (KB)
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 40 }}>
                      Actions
                    </TableCell>
                    {/* for remove */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file, index) => (
                    <TableRow
                      key={index}
                      sx={{ "&:nth-of-type(odd)": { bgcolor: "#fafafa" } }}
                    >
                      <TableCell>{index + 1}.</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <DescriptionOutlinedIcon
                            sx={{ fontSize: 16, mr: 1, color: "#666" }}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {file.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: 13 }}
                        >
                          {(file.size / 1024).toFixed(2)} KB
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Tooltip title="Delete" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <CloseIcon
                                fontSize="small"
                                sx={{ color: "error.main" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={loading}
                sx={{ px: 3, py: 1.2, fontWeight: 500 }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={handleProcess}
                disabled={files.length === 0 || loading}
                sx={{
                  bgcolor: "#1e1e1e",
                  boxShadow: 0,
                  borderRadius: 1,
                  px: 3,
                  py: 1.2,
                  fontWeight: 500,
                  "&:hover": { bgcolor: "#333333", boxShadow: 0 },
                }}
              >
                {loading
                  ? "Processing..."
                  : `Process ${files.length} File${
                      files.length !== 1 ? "s" : ""
                    }`}
              </Button>
            </Box>
          </>
        )}

        {activeTab === "upload" && step === 2 && (
          <Box>
            <ResumeListView
              resumes={parsedResumes}
              onPreview={handlePreviewResume}
              onDelete={handleDeleteResume}
            />

            <Button
              onClick={handleReset}
              variant="outlined"
              sx={{
                border: 0,
                height: "40px",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#9CA3AF",
                },
              }}
            >
              <ArrowBackOutlinedIcon sx={{ fontSize: 15 }} />
              Back
            </Button>
          </Box>
        )}

        {/* History View */}
        {activeTab === "history" && (
          <>
            <Typography variant="h5" align="left" sx={{ fontWeight: 550 }}>
              Resume History
            </Typography>
            <Typography align="left" color="text.secondary" sx={{ mb: 4 }}>
              View all previously uploaded resumes.
            </Typography>

            {history.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No resume history found. Upload resumes to get started.
                </Typography>
              </Box>
            ) : (
              <ResumeListView
                resumes={history.map((h) => ({
                  id: h.id,
                  filename: h.name,
                  file_size: h.size,
                  parsed_data: h.data,
                  status: "success",
                }))}
                onPreview={handlePreviewResume}
              />
            )}
          </>
        )}
      </Paper>

      {/* Resume Preview Modal */}
      <ResumePreviewModal
        open={!!selectedResume}
        onClose={() => setSelectedResume(null)}
        resume={selectedResume}
      />
    </Box>
  );
};

export default ResumeParser;
