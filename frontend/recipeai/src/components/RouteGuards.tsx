import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import FoodLoadingScreen from "./FoodLoadingScreen";
import { useUser } from "../context/context";

interface RouteGuardProps {
  children: ReactNode;
}

interface ProtectedRouteProps extends RouteGuardProps {
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <FoodLoadingScreen
        title="Checking session..."
        subtitle="Please wait while we verify your login"
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const GuestRoute = ({ children }: RouteGuardProps) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <FoodLoadingScreen
        title="Preparing sign in..."
        subtitle="Checking your current session"
      />
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
