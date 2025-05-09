
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📝' },
    { path: '/courses', label: 'Courses', icon: '📚' },
  ];

  return (
    <div className="w-16 md:w-56 bg-sidebar text-sidebar-foreground flex flex-col h-screen shrink-0">
      <div className="p-4 border-b border-sidebar-border">
        <div className="hidden md:block text-xl font-bold">MentorChat</div>
        <div className="block md:hidden text-xl font-bold text-center">MC</div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 space-y-2 px-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            onClick={() => navigate(item.path)}
            variant="ghost"
            className={`w-full justify-start ${
              isActive(item.path) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            <span className="hidden md:inline-block">{item.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="hidden md:block text-sm">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs opacity-70">{user.role}</div>
        </div>
        <div className="block md:hidden text-center">👤</div>
      </div>
    </div>
  );
};

export default Sidebar;
