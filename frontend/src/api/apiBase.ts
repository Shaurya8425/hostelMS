// src/api/apiBase.ts

// Use environment variable if available, otherwise default to Render backend
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://hostelms-hyhn.onrender.com/";
  // import.meta.env.VITE_API_BASE || "http://localhost:3000";
