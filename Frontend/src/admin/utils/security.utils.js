// Frontend/src/admin/utils/security.utils.js

/**
 * Frontend security utilities for admin panel
 */
class SecurityUtils {
  /**
   * Get token from localStorage
   */
  static getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  /**
   * Set token in storage
   */
  static setToken(token, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', token);
  }

  /**
   * Remove token from storage
   */
  static removeToken() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  /**
   * Decode JWT token (manual implementation - no external dependencies)
   */
  static decodeToken(token = null) {
    try {
      const tokenToUse = token || this.getToken();
      if (!tokenToUse) return null;
      
      // JWT structure: header.payload.signature
      const parts = tokenToUse.split('.');
      if (parts.length !== 3) return null;
      
      // Decode the payload (second part)
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token = null) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  }

  /**
   * Get current user from token
   */
  static getCurrentUser() {
    if (!this.isAuthenticated()) return null;
    return this.decodeToken();
  }

  /**
   * Check if current user is admin
   */
  static isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  /**
   * Check if user has specific role
   */
  static hasRole(roles = []) {
    const user = this.getCurrentUser();
    if (!user || !user.role) return false;
    return roles.includes(user.role);
  }

  /**
   * Check if user has permission for action
   */
  static hasPermission(resource, action) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    if (this.isAdmin()) return true;

    const permissions = {
      admin: ['read', 'write', 'delete', 'update'],
      manager: ['read', 'write', 'update'],
      user: ['read']
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(action);
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove script tags
    const scripts = div.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handlers
    const allElements = div.querySelectorAll('*');
    allElements.forEach(el => {
      for (let attr of el.attributes) {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      }
    });
    
    return div.innerHTML;
  }

  /**
   * Generate CSRF token for forms
   */
  static generateCSRFToken() {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    sessionStorage.setItem('csrf_token', token);
    return token;
  }

  /**
   * Get CSRF token
   */
  static getCSRFToken() {
    let token = sessionStorage.getItem('csrf_token');
    if (!token) {
      token = this.generateCSRFToken();
    }
    return token;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
   * Calculate password strength
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
   * Validate file upload
   */
  static validateFileUpload(file, allowedTypes = [], maxSize = 5 * 1024 * 1024) {
    const errors = [];

    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check dangerous extensions
    const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.com'];
    const fileName = file.name.toLowerCase();
    const hasDangerousExt = dangerousExtensions.some(ext => fileName.endsWith(ext));
    
    if (hasDangerousExt) {
      errors.push('File type is not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Secure API call with auth header
   */
  static getAuthHeaders() {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    const csrfToken = this.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }

  /**
   * Log security event (for audit trail)
   */
  static logSecurityEvent(event, details = {}) {
    const logEntry = {
      event,
      details,
      timestamp: new Date().toISOString(),
      user: this.getCurrentUser()?.email || 'anonymous',
      userAgent: navigator.userAgent
    };

    // Store in localStorage for now (in production, send to backend)
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      console.log('Security Event:', logEntry);
    }
  }

  /**
   * Get security logs
   */
  static getSecurityLogs() {
    return JSON.parse(localStorage.getItem('security_logs') || '[]');
  }

  /**
   * Clear security logs
   */
  static clearSecurityLogs() {
    localStorage.removeItem('security_logs');
  }

  /**
   * Validate session and redirect if invalid
   */
  static validateSession(navigate) {
    if (!this.isAuthenticated()) {
      this.logSecurityEvent('session_invalid', { action: 'redirect_to_login' });
      this.removeToken();
      navigate('/login', { state: { from: window.location.pathname } });
      return false;
    }

    if (!this.isAdmin()) {
      this.logSecurityEvent('unauthorized_access', { 
        action: 'redirect_from_admin',
        attemptedPath: window.location.pathname 
      });
      navigate('/', { state: { error: 'Admin access required' } });
      return false;
    }

    return true;
  }

  /**
   * Auto logout on token expiry
   * ✅ FIXED: Disabled aggressive auto-logout timer
   */
  static setupAutoLogout(navigate, callback) {
    // ✅ DISABLED: Return empty cleanup function (no auto-logout timer)
    // Token expiration is now handled by axios interceptor only
    return () => {};
    
    // If you want to re-enable with longer interval, uncomment below:
    /*
    const checkInterval = 300000; // Check every 5 minutes
    
    const intervalId = setInterval(() => {
      if (!this.isAuthenticated()) {
        clearInterval(intervalId);
        this.logSecurityEvent('auto_logout', { reason: 'token_expired' });
        this.removeToken();
        if (callback) callback();
        navigate('/login', { state: { message: 'Your session has expired' } });
      }
    }, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
    */
  }

  /**
   * Encrypt sensitive data before storing (basic obfuscation)
   */
  static obfuscate(data) {
    try {
      return btoa(encodeURIComponent(JSON.stringify(data)));
    } catch (error) {
      console.error('Obfuscation error:', error);
      return null;
    }
  }

  /**
   * Decrypt obfuscated data
   */
  static deobfuscate(data) {
    try {
      return JSON.parse(decodeURIComponent(atob(data)));
    } catch (error) {
      console.error('Deobfuscation error:', error);
      return null;
    }
  }

  /**
   * Check for suspicious activity
   */
  static detectSuspiciousActivity() {
    const logs = this.getSecurityLogs();
    const recentLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      const now = new Date();
      return (now - logTime) < 3600000; // Last hour
    });

    // Check for multiple failed attempts
    const failedAttempts = recentLogs.filter(log => 
      log.event === 'unauthorized_access' || 
      log.event === 'session_invalid'
    ).length;

    return {
      suspicious: failedAttempts > 5,
      failedAttempts,
      recentLogs
    };
  }

  /**
   * Mask sensitive data for display
   */
  static maskData(data, visibleChars = 4) {
    if (!data || typeof data !== 'string') return data;
    
    if (data.length <= visibleChars) return data;
    
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  }

  /**
   * Prevent clickjacking
   */
  static preventClickjacking() {
    if (window.self !== window.top) {
      this.logSecurityEvent('clickjacking_attempt', { 
        referrer: document.referrer 
      });
      window.top.location = window.self.location;
    }
  }

  /**
   * Initialize security measures
   */
  static initialize(navigate) {
    // Prevent clickjacking
    this.preventClickjacking();

    // Setup auto logout (now disabled by default)
    const cleanup = this.setupAutoLogout(navigate);

    // Log initialization
    this.logSecurityEvent('security_initialized');

    // Return cleanup function
    return cleanup;
  }
}

// Export individual methods for convenient importing
export const getToken = () => SecurityUtils.getToken();
export const setToken = (token, remember) => SecurityUtils.setToken(token, remember);
export const removeToken = () => SecurityUtils.removeToken();
export const decodeToken = (token) => SecurityUtils.decodeToken(token);
export const isTokenExpired = (token) => SecurityUtils.isTokenExpired(token);
export const isAuthenticated = () => SecurityUtils.isAuthenticated();
export const getCurrentUser = () => SecurityUtils.getCurrentUser();
export const isAdmin = () => SecurityUtils.isAdmin();
export const hasRole = (roles) => SecurityUtils.hasRole(roles);
export const hasPermission = (resource, action) => SecurityUtils.hasPermission(resource, action);
export const sanitizeInput = (input) => SecurityUtils.sanitizeInput(input);
export const sanitizeHTML = (html) => SecurityUtils.sanitizeHTML(html);
export const generateCSRFToken = () => SecurityUtils.generateCSRFToken();
export const getCSRFToken = () => SecurityUtils.getCSRFToken();
export const isValidEmail = (email) => SecurityUtils.isValidEmail(email);
export const validatePasswordStrength = (password) => SecurityUtils.validatePasswordStrength(password);
export const validateFileUpload = (file, allowedTypes, maxSize) => SecurityUtils.validateFileUpload(file, allowedTypes, maxSize);
export const getAuthHeaders = () => SecurityUtils.getAuthHeaders();
export const logSecurityEvent = (event, details) => SecurityUtils.logSecurityEvent(event, details);
export const validateSession = (navigate) => SecurityUtils.validateSession(navigate);
export const maskData = (data, visibleChars) => SecurityUtils.maskData(data, visibleChars);

export default SecurityUtils;