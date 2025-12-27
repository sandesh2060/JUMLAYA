// // =====================================================
// // CUSTOM SANITIZATION (NoSQL Injection Prevention)
// // =====================================================
// const sanitizeData = (data) => {
//   // Handle null/undefined
//   if (data == null) return data;
  
//   // Handle arrays
//   if (Array.isArray(data)) {
//     return data.map(item => sanitizeData(item));
//   }
  
//   // Handle objects
//   if (typeof data === 'object') {
//     const result = {};
//     for (const key in data) {
//       // Skip dangerous keys (NoSQL injection prevention)
//       if (key.startsWith('$') || key.includes('.')) {
//         console.warn(`⚠️ Blocked key: ${key}`);
//         continue;
//       }
//       // Keep safe keys
//       result[key] = sanitizeData(data[key]);
//     }
//     return result;
//   }
  
//   // Return primitives as-is
//   return data;
// };

// const sanitizeMiddleware = (req, res, next) => {
//   // Only sanitize if body exists
//   if (req.body && Object.keys(req.body).length > 0) {
//     req.body = sanitizeData(req.body);
//   }
  
//   // Only sanitize if params exists
//   if (req.params && Object.keys(req.params).length > 0) {
//     req.params = sanitizeData(req.params);
//   }
  
//   // Handle query separately
//   if (req.query && Object.keys(req.query).length > 0) {
//     req.query = sanitizeData({ ...req.query });
//   }
  
//   next();
// };

// app.use(sanitizeMiddleware);