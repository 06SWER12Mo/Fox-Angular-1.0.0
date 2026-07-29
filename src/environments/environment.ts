export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: 'http://localhost:8081/api/v1',
  imageUrl: 'http://localhost:8081/api/images',
  
  // Auth Configuration
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    userKey: 'user_data'
  },
  
  // Pagination Defaults
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [5, 10, 20, 50, 100]
  },
  
  // File Upload
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  
  // Currency
  currency: {
    code: 'ILS',
    symbol: '₪'
  },
  
  // Feature Flags
  features: {
    enableRegistration: true,
    enableGuestCheckout: false,
    enableReviews: true
  }
};