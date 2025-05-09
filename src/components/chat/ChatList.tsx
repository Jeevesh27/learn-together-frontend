import React, { useEffect, useState } from 'react';
import { chatApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
  lastMessage?: {
    _id: string;
    message: string;
    createdAt: string;
    sender: string;
  };
  unreadCount?: number;
}

interface ChatListProps {
  selectedChatId?: string;
  onSelectChat: (chat: Chat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { onlineUsers, socket } = useSocket();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const response = await chatApi.getAllChats();
        setChats(response.chats);
        setFilteredChats(response.chats);
      } catch (error) {
        toast.error("Failed to load chats");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (data: any) => {
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat._id === data.message.chatId) {
              return {
                ...chat,
                lastMessage: {
                  _id: data.message._id,
                  message: data.message.message,
                  createdAt: data.message.createdAt,
                  sender: data.message.sender._id
                },
                unreadCount: selectedChatId !== chat._id ? 
                  (chat.unreadCount || 0) + 1 : 0
              };
            }
            return chat;
          });
        });
      };

      socket.on('message:received', handleNewMessage);

      return () => {
        socket.off('message:received', handleNewMessage);
      };
    }
  }, [socket, selectedChatId]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredChats(chats);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredChats(
        chats.filter(
          (chat) => 
            chat.members.mentor.name.toLowerCase().includes(term) ||
            chat.members.student.name.toLowerCase().includes(term) ||
            chat.courseId.name.toLowerCase().includes(term) ||
            chat.question.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, chats]);

  const getPartnerInfo = (chat: Chat) => {
    if (!user) return { name: "", id: "" };
    
    const isUserStudent = user.role === "student";
    const partner = isUserStudent ? chat.members.mentor : chat.members.student;
    
    return {
      name: partner.name,
      id: partner._id
    };
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    
    const date = new Date(timeString);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this week, show day name
    const dayDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Loading chats...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border">
        <Input
          type="text"
          placeholder="Search chats"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const partner = getPartnerInfo(chat);
            const isSelected = chat._id === selectedChatId;
            const isOnline = onlineUsers.has(partner.id);
            
            const initials = partner.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={chat._id}
                className={`p-3 border-b border-border cursor-pointer hover:bg-muted/20 ${
                  isSelected ? "bg-muted/30" : ""
                }`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 status-indicator online"></span>
                    )}
                  </div>
                  
                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{partner.name}</span>
                      {chat.lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage ? chat.lastMessage.message : chat.question}
                      </span>
                      {chat.unreadCount ? (
                        <span className="ml-2 inline-flex items-center justify-center h-5 w-5 text-xs bg-primary text-primary-foreground rounded-full">
                          {chat.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-muted-foreground/70 truncate">
                      {chat.courseId.name}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
