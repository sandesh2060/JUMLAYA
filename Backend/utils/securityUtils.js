// Backend/utils/securityUtils.js

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('./AppError');

/**
 * Security utilities for admin and user operations
 */
class SecurityUtils {
  /**
   * Verify JWT token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { 
      expiresIn: '30d' 
    });
  }

  /**
   * Check if user has admin role
   */
  static isAdmin(user) {
    return user && user.role === 'admin';
  }

  /**
   * Check if user has required role
   */
  static hasRole(user, roles = []) {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  }

  /**
   * Check if user has permission for specific action
   */
  static hasPermission(user, resource, action) {
    if (this.isAdmin(user)) return true;

    const permissions = {
      admin: ['read', 'write', 'delete', 'update'],
      manager: ['read', 'write', 'update'],
      user: ['read']
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(action);
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeInput(obj);
    }

    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
    }
    
    return sanitized;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    };
  }

  /**
   * Calculate password strength score
   */
  static calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

    if (strength <= 40) return 'weak';
    if (strength <= 70) return 'medium';
    return 'strong';
  }

  /**
   * Hash sensitive data (not for passwords - use bcrypt for that)
   */
  static hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate random token
   */
  static generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken() {
    return this.generateRandomToken(32);
  }

  /**
   * Verify CSRF token
   */
  static verifyCSRFToken(token, sessionToken) {
    return token === sessionToken;
  }

  /**
   * Check if IP is whitelisted (for admin access)
   */
  static isIPWhitelisted(ip, whitelist = []) {
    if (whitelist.length === 0) return true;
    return whitelist.includes(ip);
  }

  /**
   * Get client IP from request
   */
  static getClientIP(req) {
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           req.connection.remoteAddress;
  }

  /**
   * Create audit log entry
   */
  static createAuditLog(user, action, resource, details = {}) {
    return {
      userId: user._id || user.id,
      userEmail: user.email,
      action,
      resource,
      details,
      timestamp: new Date(),
      ip: details.ip
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if request is from trusted origin
   */
  static isTrustedOrigin(origin) {
    const trustedOrigins = (process.env.TRUSTED_ORIGINS || '').split(',');
    return trustedOrigins.includes(origin);
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitiveData(data, fields = ['password', 'token', 'cardNumber']) {
    if (typeof data !== 'object' || data === null) return data;

    const masked = { ...data };
    
    fields.forEach(field => {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    });

    return masked;
  }

  /**
   * Encrypt data
   */
  static encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data
   */
  static decrypt(encryptedText) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
    
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Validate admin session
   */
  static validateAdminSession(req) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = this.verifyToken(token);
    
    if (!this.isAdmin(decoded)) {
      throw new AppError('Admin access required', 403);
    }

    return decoded;
  }

  /**
   * Rate limiting check helper
   */
  static checkRateLimit(identifier, limit = 100, windowMs = 60000) {
    // This is a simple in-memory implementation
    // For production, use Redis or similar
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const now = Date.now();
    const key = `${identifier}-${Math.floor(now / windowMs)}`;
    
    const current = this.rateLimitStore.get(key) || 0;
    
    if (current >= limit) {
      return { allowed: false, remaining: 0 };
    }

    this.rateLimitStore.set(key, current + 1);
    
    return { allowed: true, remaining: limit - current - 1 };
  }

  /**
   * Validate file upload security
   */
  static validateFileUpload(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
    const errors = [];

    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    // Check for dangerous extensions
    const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.com'];
    const fileExt = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    
    if (dangerousExtensions.includes(fileExt)) {
      errors.push('File extension is not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clean expired tokens/sessions
   */
  static cleanExpiredSessions() {
    if (!this.rateLimitStore) return;
    
    const now = Date.now();
    for (const [key] of this.rateLimitStore) {
      const timestamp = parseInt(key.split('-').pop());
      if (now - timestamp > 3600000) { // 1 hour
        this.rateLimitStore.delete(key);
      }
    }
  }
}

module.exports = SecurityUtils;