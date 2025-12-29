import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { socketClient } from '../utils/socketClient';

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const newSocket = socketClient.connect();
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('authenticate', user._id);
      });

      newSocket.on('notification', (notification) => {
        // Handle incoming notification
        console.log('New notification:', notification);
        // You can dispatch to context or show toast
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return { socket, isConnected };
};