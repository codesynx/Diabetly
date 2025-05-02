import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth state
  if (isLoading) {
    return null;
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    // Redirect to signin, but remember where they were trying to go
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 