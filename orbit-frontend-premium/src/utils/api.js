// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_SIGNUP: `${API_BASE_URL}/auth/signup`,
  RESUME_UPLOAD: `${API_BASE_URL}/resume/upload`,
  RESUME_MY_RESUMES: `${API_BASE_URL}/resume/my-resumes`,
  RESUME_ANALYZE: `${API_BASE_URL}/resume/analyze`,
  RESUME_ROADMAP: `${API_BASE_URL}/resume/roadmap`,
  RESUME_JOBS: `${API_BASE_URL}/resume/jobs`,
  CHAT_MESSAGE: `${API_BASE_URL}/resume/chat`,
  PAYMENT_SUBSCRIPTION: `${API_BASE_URL}/payment/subscription`,
  PAYMENT_CREATE_CHECKOUT: `${API_BASE_URL}/payment/create-checkout-session`,
  PAYMENT_VERIFY: `${API_BASE_URL}/payment/verify-payment`,
};

// Get the base URL without /api suffix for services that need it
export const getApiBase = () => {
  const url = API_CONFIG.BASE_URL;
  return url.endsWith('/api') ? url.slice(0, -4) : url;
};

export default API_CONFIG;
