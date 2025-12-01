import {Navigate, useLocation} from "react-router-dom";
import {useAdmin} from "@/hooks/useAdmin";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({children}: ProtectedRouteProps) => {
  const {admin} = useAdmin();
  const location = useLocation();

  // If no admin is logged in, redirect to login page
  if (!admin) {
    return <Navigate to="/admin/login" state={{from: location}} replace />;
  }

  // If admin is logged in, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
