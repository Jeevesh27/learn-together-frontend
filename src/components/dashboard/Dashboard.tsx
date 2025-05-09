
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import CourseSelector from '@/components/courses/CourseSelector';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

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
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showCourseSelector, setShowCourseSelector] = useState(false);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          onNewChat={() => setShowCourseSelector(true)} 
          role={user.role} 
        />

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat List */}
          <div className="w-1/4 border-r border-border">
            <ChatList 
              selectedChatId={selectedChat?._id} 
              onSelectChat={setSelectedChat} 
            />
          </div>

          {/* Chat Window or Course Selector */}
          <div className="w-3/4 flex flex-col">
            {showCourseSelector ? (
              <CourseSelector 
                onClose={() => setShowCourseSelector(false)}
                onChatCreated={(chat) => {
                  setSelectedChat(chat);
                  setShowCourseSelector(false);
                }}
              />
            ) : selectedChat ? (
              <ChatWindow chat={selectedChat} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-muted/10">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-muted-foreground">
                    Select a chat or start a new conversation
                  </h2>
                  {user.role === "student" && (
                    <button
                      onClick={() => setShowCourseSelector(true)}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                      Start a new conversation
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
