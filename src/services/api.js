import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Existing functions
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
