
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, message: string, files?: string[]) => void;
  markSeen: (chatId: string) => void;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to socket.io server
    const newSocket = io('https://311a-160-22-60-12.ngrok-free.app', {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
      
      // Let server know we're online
      if (user.userId) {
        newSocket.emit('user:online', { userId: user.userId });
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      toast.error('Failed to connect to chat service');
      setIsConnected(false);
    });

    newSocket.on('user:online', ({ userId }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.add(userId);
        return updated;
      });
    });

    newSocket.on('user:offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    newSocket.on('error', ({ message }) => {
      toast.error(message || 'Socket error');
    });

    // Clean up on unmount
    return () => {
      if (newSocket && user?.userId) {
        newSocket.emit('user:offline', { userId: user.userId });
        newSocket.disconnect();
        setIsConnected(false);
      }
    };
  }, [user]);

  const joinChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('join:chat', { chatId });
    }
  };

  const leaveChat = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('leave:chat', { chatId });
    }
  };

  const sendMessage = (chatId: string, message: string, files?: string[]) => {
    if (socket && isConnected) {
      socket.emit('send:message', { chatId, message, files });
    } else {
      toast.error('Not connected to chat service');
    }
  };

  const markSeen = (chatId: string) => {
    if (socket && isConnected) {
      socket.emit('mark:seen', { chatId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChat,
        leaveChat,
        sendMessage,
        markSeen,
        onlineUsers
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
