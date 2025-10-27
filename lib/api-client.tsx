import axios from "axios";

const API_BASE_URL = "https://bold-helpful-gull.ngrok-free.app"; 

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
