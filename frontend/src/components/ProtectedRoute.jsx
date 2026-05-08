import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_HOME = {
  student: '/student',
  mentor: '/mentor',
  admin: '/admin',
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { auth } = useAuth();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    // Redirect to the user's own dashboard
    const home = ROLE_HOME[auth.user.role] || '/login';
    return <Navigate to={home} replace />;
  }

  return children;
}
