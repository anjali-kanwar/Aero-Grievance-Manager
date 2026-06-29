import { Navigate } from "react-router";

const InternalRoute = ({ children }) => {
  const cameFromLogin = sessionStorage.getItem("cameFromLogin") === "true";
  const cameFromHome = sessionStorage.getItem("cameFromHome") === "true";

  if (!cameFromLogin || !cameFromHome) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default InternalRoute;