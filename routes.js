const routes = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    otp: '/auth/otp',
  },
  pages: {
    home: '/',
    profile: '/home/profile',
    about: '/about',
  },
  api: {
    authLogin: '/api/auth/login',
    authSignup: '/api/auth/register',
    authOtp: '/api/auth/otp',
    googleLogin: '/api/auth/google-login',
    profile: '/api/profile', // For current user profile
    profileById: '/api/profile/[id]', // For profile by ID
    imageUpload: '/api/profile/imageUpload', // For uploading images
    about: '/api/about',
  },
};

export default routes;
