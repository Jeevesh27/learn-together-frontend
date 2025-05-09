
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onNewChat?: () => void;
  role?: string;
}

const Header: React.FC<HeaderProps> = ({ onNewChat, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <header className="bg-background border-b border-border p-3 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">MentorChat</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {role === 'student' && onNewChat && (
          <Button onClick={onNewChat} variant="outline" size="sm">
            New Question
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="font-medium">{user?.name}</DropdownMenuItem>
            <DropdownMenuItem className="text-muted-foreground">{user?.email}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/courses')}>Courses</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
