// ============================================
// Frontend/src/api/auditLog.api.js
// Audit Log API Service
// ============================================

import api from './axios.config';

const auditLogAPI = {
  /**
   * Get all audit logs with filters and pagination
   */
  getAllLogs: async (filters = {}, page = 1, limit = 50) => {
    try {
      const params = new URLSearchParams();
      
      // Add filters
      if (filters.action) params.append('action', filters.action);
      if (filters.resource) params.append('resource', filters.resource);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      // Add pagination
      params.append('page', page);
      params.append('limit', limit);
      
      // Add sorting
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      
      const response = await api.get(`/audit-logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching audit logs:', error);
      throw error;
    }
  },

  /**
   * Get single audit log by ID
   */
  getLogById: async (logId) => {
    try {
      const response = await api.get(`/audit-logs/${logId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching audit log:', error);
      throw error;
    }
  },

  /**
   * Create a new audit log entry
   */
  createLog: async (logData) => {
    try {
      const response = await api.post('/audit-logs', logData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating audit log:', error);
      throw error;
    }
  },

  /**
   * Get audit log statistics
   */
  getStats: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/audit-logs/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching audit stats:', error);
      throw error;
    }
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit = 20) => {
    try {
      const response = await api.get(`/audit-logs/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
      throw error;
    }
  },

  /**
   * Get logs by user
   */
  getLogsByUser: async (userId, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/audit-logs/user/${userId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user logs:', error);
      throw error;
    }
  },

  /**
   * Get logs by resource
   */
  getLogsByResource: async (resource, page = 1, limit = 50) => {
    try {
      const response = await api.get(`/audit-logs/resource/${resource}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching resource logs:', error);
      throw error;
    }
  },

  /**
   * Export audit logs
   */
  exportLogs: async (filters = {}, format = 'json') => {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await api.get(`/audit-logs/export?${params.toString()}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Download CSV file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit_logs_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true, message: 'Logs exported successfully' };
      } else {
        // Download JSON file
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `audit_logs_${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { success: true, message: 'Logs exported successfully' };
      }
    } catch (error) {
      console.error('❌ Error exporting logs:', error);
      throw error;
    }
  },

  /**
   * Delete old logs (cleanup)
   */
  deleteOldLogs: async (days) => {
    try {
      const response = await api.delete('/audit-logs/cleanup', {
        data: { days }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting old logs:', error);
      throw error;
    }
  },

  /**
   * Delete all logs (dangerous - super admin only)
   */
  deleteAllLogs: async () => {
    try {
      const response = await api.delete('/audit-logs/all');
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting all logs:', error);
      throw error;
    }
  },

  /**
   * Bulk log actions (for frontend-only logging before backend implementation)
   */
  logAction: async (action, resource, details = {}) => {
    try {
      const response = await api.post('/audit-logs', {
        action,
        resource,
        details,
        status: 'success',
        severity: 'low'
      });
      return response.data;
    } catch (error) {
      // Don't throw error for logging failures - just log to console
      console.error('❌ Error logging action:', error);
      return { success: false, error };
    }
  }
};

export default auditLogAPI;