// services/helper.js

// Vite exposes NODE_ENV through import.meta.env.MODE
const isProduction = import.meta.env.MODE === 'production';

let BASE_URL;

if (isProduction) {
  // In production, use the URL from your .env.production file
  BASE_URL = import.meta.env.VITE_API_URL;
} else {
  // In development, use your local backend URL
  BASE_URL = "http://localhost:5000";
}

// Export the BASE_URL string directly, not an object containing it.
export default BASE_URL;