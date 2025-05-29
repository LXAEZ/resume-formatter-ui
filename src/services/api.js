import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Existing single file functions
export const previewResumePdf = async (resumeData) => {
  try {
    const response = await axios.post(
      `${API_URL}/preview-resume-pdf`,
      resumeData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    return new Blob([response.data], { type: "application/pdf" });
  } catch (error) {
    console.error("Error previewing PDF:", error);
    throw new Error("Failed to preview resume PDF");
  }
};

export const parseResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/parse-resume`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error(error.response?.data?.detail || "Failed to parse resume");
  }
};

// New multiple file functions
export const parseMultipleResumes = async (files) => {
  const formData = new FormData();

  // Append each file to FormData
  files.forEach((file, index) => {
    formData.append("files", file);
  });

  try {
    const response = await axios.post(
      `${API_URL}/parse-multiple-resumes`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error parsing multiple resumes:", error);
    throw new Error(error.response?.data?.detail || "Failed to parse resumes");
  }
};

export const downloadResumeAsZip = async (fileIds) => {
  try {
    const response = await axios.post(
      `${API_URL}/download-resumes-zip`,
      { file_ids: fileIds },
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    return new Blob([response.data], { type: "application/zip" });
  } catch (error) {
    console.error("Error downloading zip:", error);
    throw new Error("Failed to download resumes as zip");
  }
};
