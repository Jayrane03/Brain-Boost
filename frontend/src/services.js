let BASE_URL;
if (process.env.NODE_ENV === 'production') {
  BASE_URL = "https://brain-boost.onrender.com";
} else {
  BASE_URL = "http://localhost:5001";
}

export default BASE_URL;
