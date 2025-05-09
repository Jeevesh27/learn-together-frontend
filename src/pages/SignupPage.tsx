
import Signup from '@/components/auth/Signup';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const SignupPage = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Signup />;
};

export default SignupPage;
