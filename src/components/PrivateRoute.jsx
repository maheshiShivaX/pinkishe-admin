import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          // 'http://localhost:8000/api/auth/validate-token',
          'https://vend91.padtracker.org/api/auth/validate-token',
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.valid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    validateToken();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    localStorage.removeItem("authToken"); 
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
