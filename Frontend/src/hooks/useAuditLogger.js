// Frontend/src/hooks/useAuditLogger.js

import { useCallback } from 'react';
import SecurityUtils from '@/admin/utils/security.utils';

/**
 * Custom hook for logging audit events in admin panel
 */
export const useAuditLogger = () => {
  /**
   * Log an audit event
   */
  const logEvent = useCallback((action, resource, details = {}) => {
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

    // Store locally
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    logs.push(auditLog);
    
    // Keep only last 500 logs
    if (logs.length > 500) {
      logs.shift();
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(logs));

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('📋 Audit Log:', auditLog);
    }

    // TODO: Send to backend API in production
    // sendToBackend(auditLog);

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
   * Get all audit logs
   */
  const getLogs = useCallback((filters = {}) => {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    
    let filteredLogs = logs;

    // Filter by action
    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    // Filter by resource
    if (filters.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
    }

    // Filter by user
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.user?.id === filters.userId);
    }

    // Filter by date range
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

    return filteredLogs.reverse(); // Most recent first
  }, []);

  /**
   * Clear all audit logs
   */
  const clearLogs = useCallback(() => {
    localStorage.removeItem('audit_logs');
    logEvent('CLEAR_LOGS', 'audit', {});
  }, [logEvent]);

  /**
   * Export logs to JSON
   */
  const exportLogs = useCallback((filters = {}) => {
    const logs = getLogs(filters);
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    logExport('audit_logs', 'json', filters);
  }, [getLogs, logExport]);

  /**
   * Get audit statistics
   */
  const getStats = useCallback(() => {
    const logs = getLogs();
    
    const stats = {
      total: logs.length,
      byAction: {},
      byResource: {},
      byUser: {},
      recentActivity: logs.slice(0, 10)
    };

    logs.forEach(log => {
      // Count by action
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      
      // Count by resource
      stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
      
      // Count by user
      if (log.user?.email) {
        stats.byUser[log.user.email] = (stats.byUser[log.user.email] || 0) + 1;
      }
    });

    return stats;
  }, [getLogs]);

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
    clearLogs,
    exportLogs,
    getStats
  };
};

export default useAuditLogger;