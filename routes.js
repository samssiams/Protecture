const routes = {
  auth: {
    login: '/auth/login',       // Frontend login page
    signup: '/auth/signup',     // Frontend signup page
    otp: '/auth/otp',           // Frontend OTP page
  },
  api: {
    authLogin: '/api/auth/login',           // API route for login
    authSignup: '/api/auth/signup',         // API route for signup
    authOtp: '/api/auth/otp',               // API route for OTP verification
    googleLogin: '/api/auth/google-login',  // API route for Google login
  },
};

export default routes;
