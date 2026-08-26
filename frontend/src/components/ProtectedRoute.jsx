import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// requireProfile: pages that depend on styling/measurement data (wardrobe,
// outfits, try-on) should pass this so an incomplete profile gets routed
// to the onboarding step instead of erroring out on missing data.
export default function ProtectedRoute({ children, requireProfile = false }) {
  const { user, loading, profileComplete } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requireProfile && !profileComplete) return <Navigate to="/complete-profile" replace />;
  return children;
}
