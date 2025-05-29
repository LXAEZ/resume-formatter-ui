import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Divider,
  useTheme,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import FileUpload from "./FileUpload";
import ResumePreview from "./ResumePreview";
import { useAuth } from "../auth/AuthContext";
import { parseResume } from "../services/api";
import Login from "./Login";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadIcon from "@mui/icons-material/Upload";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Settings } from "lucide-react";
import { Modal, IconButton } from "@mui/material";
import JsonViewer from "./JsonViewer";

const ResumeParser = () => {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]); // Changed to array for multiple files
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("preview");
  const [modalViewMode, setModalViewMode] = useState("preview"); // or "json"
  const [loadingProgress, setLoadingProgress] = useState(0);

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
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedResume, setSelectedResume] = useState(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleFileSelect = (selectedFiles) => {
    // Convert FileList to array if needed
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
      // Process all files (for now, we'll just process the first one)
      // You can modify this to process all files
      const data = await parseResume(files[0]);

      // Complete the progress
      setLoadingProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        const entry = {
          id: Date.now(),
          name: files[0]?.name,
          size: files[0]?.size,
          date: new Date().toLocaleString(),
          data,
        };
        setParsedData(data);
        setHistory((prev) => [...prev, entry]);
        setStep(2);
        setLoadingProgress(0);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || "Failed to parse resume");
      setLoadingProgress(0);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setFiles([]);
    setParsedData(null);
    setError(null);
    setViewMode("preview");
    setLoadingProgress(0);
  };

  const handleChangeView = (event, newValue) => {
    setViewMode(newValue);
  };

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
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

        {/* Sample content based on tab */}
        <div className="mt-4">{activeTab === "upload"}</div>
      </div>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 1,
          mt: 2,
          boxShadow: 0,
          border: "1px,solid,  #e5e7eb",
        }}
      >
        {/* Upload View */}
        {activeTab === "upload" && step === 0 && (
          <>
            <Typography variant="h5" align="left" sx={{ fontWeight: 550 }}>
              Upload Resume
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
                Upload Resume
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
              <Typography variant="h5" align="left" sx={{ fontWeight: 550 }}>
                Upload Resume
              </Typography>

              {loading && (
                <Box
                  sx={{
                    width: 250,
                    backgroundColor: "transparent",
                    p: 0,
                    borderRadius: 0,
                    boxShadow: "none",
                    border: "none",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {Math.round(loadingProgress)}%
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Files selected count - below title */}
            <Typography align="left" color="text.secondary" sx={{ mb: 4 }}>
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </Typography>

            {/* Files Table - Windows Explorer Style */}
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
                    <TableCell sx={{ fontWeight: 600, width: "60px" }}>
                      S.No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Box display="flex" alignItems="center">
                        <DescriptionOutlinedIcon sx={{ fontSize: 16, mr: 1 }} />
                        Name
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, width: "120px" }}
                      align="right"
                    >
                      Size (Kb)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files.map((file, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:nth-of-type(odd)": { bgcolor: "#fafafa" },
                      }}
                    >
                      <TableCell sx={{ py: 1.5 }}>{index + 1}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Box display="flex" alignItems="center">
                          <DescriptionOutlinedIcon
                            sx={{ fontSize: 16, mr: 1, color: "#666" }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {file.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          {(file.size / 1024).toFixed(2)} KB
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {error && (
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography color="error" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                color="primary"
                onClick={handleProcess}
                sx={{
                  bgcolor: "#1e1e1e",
                  boxShadow: 0,
                  borderRadius: 1,
                  px: 3,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": { bgcolor: "#333333", boxShadow: 0 },
                }}
                disabled={files.length === 0 || loading}
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

        {activeTab === "upload" && step === 2 && parsedData && (
          <Box>
            {/* View Mode Tabs */}
            <Box textAlign="left" mt={0}>
              <Button
                onClick={handleReset}
                variant="outlined"
                sx={{
                  border: 0,
                  height: "40px",
                  color: "#374151", // slate-700
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
            <Tabs
              value={viewMode}
              onChange={handleChangeView}
              centered
              sx={{ mb: 3 }}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab value="preview" label="Preview" />
              <Tab value="json" label="JSON Data" />
            </Tabs>

            {/* Preview Mode */}
            {viewMode === "preview" && (
              <Box px={4}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    width: "100%",
                    boxShadow: 0,
                    maxWidth: 1000, // or your preferred width like 700, 600, etc.
                    mx: "auto",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: 1000, // or your preferred width like 700, 600, etc.
                      mx: "auto", // centers the preview inside the Card
                    }}
                  >
                    <ResumePreview parsedData={parsedData} />
                  </Box>
                </Card>
              </Box>
            )}

            {/* JSON View Mode */}
            {viewMode === "json" && (
              <Box px={4}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    width: "100%",
                    boxShadow: 0,
                    maxWidth: 1000, // or your preferred width like 700, 600, etc.
                    mx: "auto",
                  }}
                >
                  <JsonViewer data={parsedData} />
                </Card>
              </Box>
            )}
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
                  No resume history found. Upload a resume to get started.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  maxHeight: 400,
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    pb: 1,
                  }}
                >
                  {[...history].reverse().map((entry) => (
                    <Box
                      key={entry.id}
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        p: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        minWidth: "100%",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            background: "#E4E3E4",
                            width: 34,
                            height: 34,
                          }}
                        >
                          <DescriptionOutlinedIcon
                            sx={{ fontSize: 18, color: "#2F2F2F" }}
                          />
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 500, lineHeight: 1.2 }}
                          >
                            {entry.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ lineHeight: 1.2 }}
                          >
                            {(entry.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", lineHeight: 1.2 }}
                          >
                            {entry.date}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        onClick={() => setSelectedResume(entry)}
                        sx={{
                          borderRadius: "20%",
                          border: 1,
                          borderColor: "#B7B7B7",
                          "&:hover": { bgcolor: "#e5e7eb" },
                          p: 1,
                        }}
                      >
                        <VisibilityOutlinedIcon
                          sx={{ fontSize: 20, color: "#454545" }}
                        />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </>
        )}
      </Paper>
      {/* Resume Preview Modal */}
      <Modal
        open={!!selectedResume}
        onClose={() => {
          setSelectedResume(null);
          setModalViewMode("preview");
        }}
        sx={{
          display: "flex",
          alignItems: "stretch",
          justifyContent: "stretch",
        }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 2,
            borderRadius: 0,
            width: "100vw",
            height: "100vh",
            overflowY: "auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Back Button */}
          <IconButton
            onClick={() => {
              setSelectedResume(null);
              setModalViewMode("preview");
            }}
            sx={{
              position: "fixed",
              top: 16,
              left: 16,
              zIndex: 1300, // above modal content
              bgcolor: "background.default",
              boxShadow: 1,
            }}
            aria-label="Back"
          >
            <ArrowBackOutlinedIcon />
          </IconButton>

          {/* Title */}
          <Typography variant="h6" mb={2} sx={{ mt: 4, textAlign: "center" }}>
            {selectedResume?.name}
          </Typography>

          {/* Toggle Switch Button for Modal */}
          <Box display="flex" justifyContent="left" mb={4} ml={7}>
            <div className="mb-4">
              <div className="grid w-full grid-cols-2 rounded-md bg-gray-100 p-1 lg:w-[200px]">
                <button
                  className={`flex items-center justify-center rounded-md py-1.5 text-sm font-medium transition ${
                    viewMode === "preview"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setViewMode("preview")}
                >
                  Preview
                </button>
                <button
                  className={`flex items-center justify-center rounded-md py-1.5 text-sm font-medium transition ${
                    viewMode === "json"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  onClick={() => setViewMode("json")}
                >
                  JSON Data
                </button>
              </div>
            </div>
          </Box>

          {/* Content */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, mt: 1 }}>
            <Box
              sx={{
                maxWidth: "1200px", // Control the width of preview/json content
                mx: "auto", // Center horizontally
                width: "100%", // Allow responsiveness
              }}
            >
              {modalViewMode === "preview" ? (
                <ResumePreview parsedData={selectedResume?.data} />
              ) : (
                <JsonViewer data={selectedResume?.data} />
              )}
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ResumeParser;
