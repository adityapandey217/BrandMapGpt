import axios from 'axios';


// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://brandmapgpt.onrender.com', // Update with your backend URL
  timeout: 200000, // 200 seconds timeout for LLM processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const submitBrandMapForm = async (formData) => {
  try {
    // Transform form data to match backend expectations
    const requestData = {
      brand_name: formData.brandName,
      brand_description: formData.brandDescription,
      origin_country: formData.originCountry,
      target_countries: formData.targetCountries,
      brand_keywords: formData.brandKeywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword),
      competitors: formData.competitors.split(',').map(c => c.trim()).filter(c => c)
    };

    // Validate required fields
    if (!requestData.brand_name) {
      throw new Error('Brand name is required');
    }
    if (!requestData.brand_description) {
      throw new Error('Brand description is required');
    }
    if (!requestData.origin_country) {
      throw new Error('Origin country is required');
    }
    if (!requestData.target_countries || requestData.target_countries.length === 0) {
      throw new Error('At least one target country is required');
    }
    if (!requestData.brand_keywords || requestData.brand_keywords.length === 0) {
      throw new Error('Brand keywords are required');
    }

    console.log('Submitting brand map request:', requestData);
    console.log('API endpoint:', `${api.defaults.baseURL}/api/brandmap/`);

    const response = await api.post('/api/brandmap/', requestData);

    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    console.log('Brand map response received:', response.data);
    return response.data;

  } catch (error) {
    console.error('Full error object:', error);
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The server is taking too long to respond. Please try again.');
    }
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || error.response.data?.detail || 'Unknown server error';
      
      console.error('Server error response:', {
        status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      switch (status) {
        case 400:
          throw new Error(`Invalid request: ${message}`);
        case 401:
          throw new Error('Authentication required. Please check your credentials.');
        case 403:
          throw new Error('Access forbidden. You do not have permission to perform this action.');
        case 404:
          throw new Error('API endpoint not found. Please check your configuration.');
        case 429:
          throw new Error('Too many requests. Please wait a moment before trying again.');
        case 500:
          throw new Error(`Server error: ${message}`);
        case 502:
        case 503:
        case 504:
          throw new Error('Service temporarily unavailable. Please try again later.');
        default:
          throw new Error(`Request failed with status ${status}: ${message}`);
      }
    }
    
    if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your internet connection and try again.');
    }
    
    // Something else happened
    console.error('Request setup error:', error.message);
    throw new Error(error.message || 'An unexpected error occurred. Please try again.');
  }
};




export default api;