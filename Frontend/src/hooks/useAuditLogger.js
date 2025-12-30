// ============================================
// Frontend/src/hooks/useAuditLogger.js - UPDATED WITH BACKEND
// ============================================

import { useCallback } from 'react';
import auditLogAPI from '@/api/auditLog.api';
import SecurityUtils from '@/admin/utils/security.utils';

/**
 * Custom hook for logging audit events
 * Now integrated with backend API
 */
export const useAuditLogger = () => {
  /**
   * Log an audit event to backend
   */
  const logEvent = useCallback(async (action, resource, details = {}) => {
    const user = SecurityUtils.getCurrentUser();
    
    const auditLog = {
      action,
      resource,
      details,
      user: user ? {
        id: user.id || user._id,
        email: user.email,
        role: user.role
      } : null,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store locally as backup
    try {
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      logs.push(auditLog);
      
      if (logs.length > 100) {
        logs.shift(); // Keep only last 100 in localStorage
      }
      
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Error storing log locally:', error);
    }

    // Send to backend
    try {
      await auditLogAPI.logAction(action, resource, details);
    } catch (error) {
      console.error('Error sending log to backend:', error);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('📋 Audit Log:', auditLog);
    }

    return auditLog;
  }, []);

  /**
   * Log create action
   */
  const logCreate = useCallback((resource, data) => {
    return logEvent('CREATE', resource, { data });
  }, [logEvent]);

  /**
   * Log update action
   */
  const logUpdate = useCallback((resource, id, changes) => {
    return logEvent('UPDATE', resource, { id, changes });
  }, [logEvent]);

  /**
   * Log delete action
   */
  const logDelete = useCallback((resource, id) => {
    return logEvent('DELETE', resource, { id });
  }, [logEvent]);

  /**
   * Log view action
   */
  const logView = useCallback((resource, id) => {
    return logEvent('VIEW', resource, { id });
  }, [logEvent]);

  /**
   * Log export action
   */
  const logExport = useCallback((resource, format, filters) => {
    return logEvent('EXPORT', resource, { format, filters });
  }, [logEvent]);

  /**
   * Log login action
   */
  const logLogin = useCallback((email, success = true) => {
    return logEvent('LOGIN', 'auth', { email, success });
  }, [logEvent]);

  /**
   * Log logout action
   */
  const logLogout = useCallback(() => {
    return logEvent('LOGOUT', 'auth', {});
  }, [logEvent]);

  /**
   * Log security event
   */
  const logSecurityEvent = useCallback((eventType, details) => {
    return logEvent('SECURITY', eventType, details);
  }, [logEvent]);

  /**
   * Get all audit logs from backend
   */
  const getLogs = useCallback(async (filters = {}) => {
    try {
      const response = await auditLogAPI.getAllLogs(filters);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching logs:', error);
      
      // Fallback to localStorage if backend fails
      try {
        const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
        let filteredLogs = logs;

        // Apply filters
        if (filters.action) {
          filteredLogs = filteredLogs.filter(log => log.action === filters.action);
        }

        if (filters.resource) {
          filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
        }

        if (filters.userId) {
          filteredLogs = filteredLogs.filter(log => log.user?.id === filters.userId);
        }

        if (filters.startDate) {
          filteredLogs = filteredLogs.filter(log => 
            new Date(log.timestamp) >= new Date(filters.startDate)
          );
        }

        if (filters.endDate) {
          filteredLogs = filteredLogs.filter(log => 
            new Date(log.timestamp) <= new Date(filters.endDate)
          );
        }

        return filteredLogs.reverse();
      } catch (localError) {
        console.error('Error reading local logs:', localError);
        return [];
      }
    }
  }, []);

  /**
   * Get recent logs
   */
  const getRecentLogs = useCallback(async (limit = 100) => {
    try {
      const response = await auditLogAPI.getRecentActivity(limit);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent logs:', error);
      
      // Fallback to localStorage
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      return logs.slice(0, limit);
    }
  }, []);

  /**
   * Clear all audit logs
   */
  const clearLogs = useCallback(async () => {
    try {
      // Clear backend logs (only if super admin confirms)
      const confirmed = confirm(
        'This will delete ALL audit logs from the database. This action cannot be undone. Are you absolutely sure?'
      );
      
      if (confirmed) {
        await auditLogAPI.deleteAllLogs();
        localStorage.removeItem('audit_logs');
        await logEvent('CLEAR_LOGS', 'audit', {});
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      // Clear local storage anyway
      localStorage.removeItem('audit_logs');
    }
  }, [logEvent]);

  /**
   * Export logs to file
   */
  const exportLogs = useCallback(async (filters = {}, format = 'json') => {
    try {
      await auditLogAPI.exportLogs(filters, format);
      await logExport('audit_logs', format, filters);
    } catch (error) {
      console.error('Error exporting logs:', error);
      
      // Fallback: export local logs
      const logs = await getLogs(filters);
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }, [getLogs, logExport]);

  /**
   * Get audit statistics from backend
   */
  const getStats = useCallback(async (filters = {}) => {
    try {
      const response = await auditLogAPI.getStats(filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      
      // Fallback: calculate stats from local logs
      const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      
      const stats = {
        total: logs.length,
        byAction: {},
        byResource: {},
        byUser: {},
        recentActivity: logs.slice(0, 10)
      };

      logs.forEach(log => {
        stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
        stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
        
        if (log.user?.email) {
          stats.byUser[log.user.email] = (stats.byUser[log.user.email] || 0) + 1;
        }
      });

      return stats;
    }
  }, []);

  /**
   * Delete old logs (cleanup)
   */
  const deleteOldLogs = useCallback(async (days) => {
    try {
      const confirmed = confirm(
        `This will delete all audit logs older than ${days} days. Continue?`
      );
      
      if (confirmed) {
        await auditLogAPI.deleteOldLogs(days);
        await logEvent('CLEAR_LOGS', 'audit', { daysOld: days });
      }
    } catch (error) {
      console.error('Error deleting old logs:', error);
      throw error;
    }
  }, [logEvent]);

  return {
    // Log functions
    logEvent,
    logCreate,
    logUpdate,
    logDelete,
    logView,
    logExport,
    logLogin,
    logLogout,
    logSecurityEvent,
    
    // Utility functions
    getLogs,
    getRecentLogs,
    clearLogs,
    exportLogs,
    getStats,
    deleteOldLogs
  };
};

export default useAuditLogger;