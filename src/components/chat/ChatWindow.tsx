
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { messageApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Message {
  _id: string;
  message: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'mentor';
  };
  files?: string[];
  createdAt: string;
  seen?: string[];
  chatId?: string; // Added this property to fix the type error
}

interface Chat {
  _id: string;
  members: {
    mentor: {
      _id: string;
      name: string;
      email: string;
    };
    student: {
      _id: string;
      name: string;
      email: string;
    };
  };
  courseId: {
    _id: string;
    name: string;
  };
  question: string;
}

interface ChatWindowProps {
  chat: Chat;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { socket, joinChat, sendMessage, markSeen, onlineUsers } = useSocket();
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await messageApi.getMessages(chat._id);
        setMessages(response.messages);
      } catch (error) {
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    if (chat._id) {
      fetchMessages();
      joinChat(chat._id);
      markSeen(chat._id);
    }
  }, [chat._id, joinChat, markSeen]);
  
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data: { message: Message }) => {
        if (data.message.chatId === chat._id) {
          setMessages(prev => [...prev, data.message]);
          markSeen(chat._id);
        }
      };
      
      const handleMessageSeen = (data: { chatId: string, seenBy: string }) => {
        if (data.chatId === chat._id) {
          setMessages(prev => prev.map(msg => ({
            ...msg,
            seen: msg.seen ? [...msg.seen, data.seenBy] : [data.seenBy]
          })));
        }
      };
      
      socket.on('message:received', handleNewMessage);
      socket.on('message:seen', handleMessageSeen);
      
      return () => {
        socket.off('message:received', handleNewMessage);
        socket.off('message:seen', handleMessageSeen);
      };
    }
  }, [socket, chat._id, markSeen]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && files.length === 0) || !user || isSending) return;
    
    try {
      setIsSending(true);
      const response = await messageApi.sendMessage(newMessage, chat._id, files);
      setNewMessage('');
      setFiles([]);
      
      // We don't need to update messages here as socket will handle that
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getPartnerInfo = () => {
    if (!user) return { name: "", id: "", role: "" };
    
    const isUserStudent = user.role === "student";
    const partner = isUserStudent ? chat.members.mentor : chat.members.student;
    
    return {
      name: partner.name,
      id: partner._id,
      role: isUserStudent ? "mentor" : "student"
    };
  };
  
  const partner = getPartnerInfo();
  const isPartnerOnline = onlineUsers.has(partner.id);
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center">
        <div className="relative">
          <Avatar>
            <AvatarFallback className="bg-primary/20">
              {partner.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isPartnerOnline && (
            <span className="absolute bottom-0 right-0 status-indicator online"></span>
          )}
        </div>
        <div className="ml-3">
          <div className="font-medium">{partner.name}</div>
          <div className="text-sm text-muted-foreground capitalize">
            {partner.role} • {isPartnerOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm font-medium">{chat.courseId.name}</div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-muted/20 p-4 rounded-lg mb-4">
          <div className="font-medium">Question:</div>
          <div className="mt-1">{chat.question}</div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-4">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender._id === user?.userId;
            
            return (
              <div 
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-[75%]">
                  {!isOwnMessage && (
                    <div className="mb-1 text-sm font-medium">
                      {message.sender.name}
                    </div>
                  )}
                  <div 
                    className={`chat-message-bubble ${
                      isOwnMessage ? 'sender' : 'receiver'
                    } p-3 rounded-lg`}
                  >
                    {message.message}
                    
                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.files.map((file, index) => {
                          // Extract the filename from the URL
                          const fileName = file.substring(file.lastIndexOf('/') + 1);
                          return (
                            <a 
                              key={index}
                              href={file} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block bg-background/20 p-2 rounded text-xs hover:bg-background/40 truncate"
                            >
                              📎 {fileName}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="chat-message-time flex justify-end items-center space-x-1">
                    <span>{formatTime(message.createdAt)}</span>
                    {isOwnMessage && message.seen && message.seen.includes(partner.id) && (
                      <span className="message-seen-indicator">✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="border-t border-border p-3">
        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {files.map((file, index) => (
              <div key={index} className="bg-muted/20 px-2 py-1 rounded-md text-xs flex items-center">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-destructive"
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFilesChange}
              className="hidden"
            />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && files.length === 0) || isSending}
            type="button"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
