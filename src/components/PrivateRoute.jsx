import { Navigate, Outlet } from "react-router-dom";
import { useAuthStatus } from '../hooks/useAuthStatus.js';
import Spinner from "./Spinner.jsx";

const PrivateRoute = () => {
  const { loggedIn, checkingStatus } = useAuthStatus();

  if(checkingStatus){
    return <Spinner />
  }

  // Rendering child component if loggedIn is true.. Here child is Profile component...
  return loggedIn ? <Outlet /> : <Navigate to='/sign-in' />;
};

export default PrivateRoute;
