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
  const [file, setFile] = useState(null);
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

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
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
      const data = await parseResume(file);

      // Complete the progress
      setLoadingProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        const entry = {
          id: Date.now(),
          name: file?.name,
          size: file?.size,
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
    setFile(null);
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
      <Box display="flex" justifyContent="left" mb={4}>
        <Box
          role="tablist"
          aria-orientation="horizontal"
          className="h-10 items-center justify-center rounded-md p-1 text-muted-foreground grid w-full grid-cols-2 lg:w-[400px]"
          tabIndex={0}
          data-orientation="horizontal"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            width: { xs: "100%", lg: "400px" },
            height: "50px",
            borderRadius: "6px",
            padding: "4px",
            outline: "none",
            backgroundColor: "#f3f4f6", // bg-muted equivalent
          }}
        >
          <Button
            type="button"
            role="tab"
            disableRipple
            disableFocusRipple
            aria-selected={activeTab === "upload"}
            data-state={activeTab === "upload" ? "active" : "inactive"}
            onClick={() => setActiveTab("upload")}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s",
              textTransform: "none",
              backgroundColor:
                activeTab === "upload" ? "#ffffff" : "transparent",
              color: activeTab === "upload" ? "#000000" : "#6b7280",
              boxShadow:
                activeTab === "upload"
                  ? "0 1px 2px rgba(0, 0, 0, 0.05)"
                  : "none",
            }}
          >
            <UploadIcon sx={{ mr: 1, height: 16, width: 16 }} />
            Upload
          </Button>
          <Button
            type="button"
            role="tab"
            disableRipple
            disableFocusRipple
            aria-selected={activeTab === "history"}
            data-state={activeTab === "history" ? "active" : "inactive"}
            onClick={() => setActiveTab("history")}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              borderRadius: "4px",
              padding: "6px 12px",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 0.2s",
              textTransform: "none",
              backgroundColor:
                activeTab === "history" ? "#ffffff" : "transparent",
              color: activeTab === "history" ? "#000000" : "#6b7280",
              boxShadow:
                activeTab === "history"
                  ? "0 1px 2px rgba(0, 0, 0, 0.05)"
                  : "none",
            }}
          >
            <AccessTimeIcon sx={{ mr: 1, height: 16, width: 16 }} />
            History
          </Button>
        </Box>
      </Box>

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
              Supported formats PDF and Word documents.
            </Typography>
            <FileUpload onFileSelect={handleFileSelect} />

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
            <Typography variant="h5" align="left" sx={{ fontWeight: 550 }}>
              Upload Resume
            </Typography>
            <Typography align="left" color="text.secondary" sx={{ mb: 4 }}>
              Supported formats PDF and Word documents.
            </Typography>
            <Box
              sx={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                p: 3,
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#ffffff",
              }}
            >
              {/* Loading Bar Background */}
              {loading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${loadingProgress}%`,
                    height: "100%",
                    backgroundColor: "rgba(0, 255, 46, 0.3)", // Green transparent
                    transition: "width 0.3s ease-out",
                    zIndex: 1,
                  }}
                />
              )}

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ position: "relative", zIndex: 2 }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  {/* Rounded Icon with background */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: "#D7D7D7",
                      width: 40, // Icon size
                      height: 40, // Icon size
                    }}
                  >
                    <DescriptionOutlinedIcon
                      sx={{ fontSize: 20, color: "#fffff" }}
                    />
                  </Box>

                  <Box>
                    {/* File name */}
                    <Typography variant="subtitle1" sx={{ fontWeight: "500" }}>
                      {file?.name}
                    </Typography>

                    {/* File size below file name */}
                    <Typography variant="body2" color="text.secondary">
                      {(file?.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

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
                disabled={!file || loading}
              >
                {loading ? "Uploading" : "Upload Resume"}
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
          <Typography variant="h6" mb={2} sx={{ mt: 6, textAlign: "center" }}>
            {selectedResume?.name}
          </Typography>

          {/* Toggle Switch Button for Modal */}
          <Box display="flex" justifyContent="left" mb={4} ml={7}>
            <Box
              role="tablist"
              aria-orientation="horizontal"
              tabIndex={0}
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                width: { xs: "100%", sm: "200px" }, // Smaller than before
                height: "38px", // Reduced height
                borderRadius: "6px",
                padding: "2px",
                outline: "none",
                backgroundColor: "#f3f4f6",
              }}
            >
              <Button
                type="button"
                role="tab"
                disableRipple
                disableFocusRipple
                aria-selected={modalViewMode === "preview"}
                onClick={() => setModalViewMode("preview")}
                sx={{
                  px: "10px",
                  py: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                  borderRadius: "4px",
                  textTransform: "none",
                  transition: "all 0.2s",
                  backgroundColor:
                    modalViewMode === "preview" ? "#ffffff" : "transparent",
                  color: modalViewMode === "preview" ? "#000000" : "#6b7280",
                  boxShadow:
                    modalViewMode === "preview"
                      ? "0 1px 2px rgba(0, 0, 0, 0.05)"
                      : "none",
                }}
              >
                Preview
              </Button>
              <Button
                type="button"
                role="tab"
                disableRipple
                disableFocusRipple
                aria-selected={modalViewMode === "json"}
                onClick={() => setModalViewMode("json")}
                sx={{
                  px: "10px",
                  py: "4px",
                  fontSize: "13px",
                  fontWeight: 500,
                  borderRadius: "4px",
                  textTransform: "none",
                  transition: "all 0.2s",
                  backgroundColor:
                    modalViewMode === "json" ? "#ffffff" : "transparent",
                  color: modalViewMode === "json" ? "#000000" : "#6b7280",
                  boxShadow:
                    modalViewMode === "json"
                      ? "0 1px 2px rgba(0, 0, 0, 0.05)"
                      : "none",
                }}
              >
                JSON Data
              </Button>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2 }}>
            <Box
              sx={{
                maxWidth: "800px", // Control the width of preview/json content
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
