import axios from "axios";

const API_BASE = "http://localhost:8080/api/wbs";

export const analyzeFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE}/analyze/file`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  console.log("API Response:", response.data);
  return response.data;
};

export const analyzeText = async (text) => {
  const response = await axios.post(`${API_BASE}/analyze/text`, { wbsText: text });
  return response.data;
};
