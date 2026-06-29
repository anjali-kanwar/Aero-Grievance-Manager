import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const cameFromLogin = sessionStorage.getItem("cameFromLogin") === "true";
  return cameFromLogin ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;