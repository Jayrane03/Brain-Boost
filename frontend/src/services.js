const BASE_URL = import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:5001'; 
// const BASE_URL = "http://localhost:5173";

export default BASE_URL;
