import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { apiUrl } from "../api";

export default function AdminRoute({
  children,
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get(
          apiUrl("/auth/me"),
          {
            withCredentials: true,
          }
        );

        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return (
      <Navigate
        to="/events"
        replace
      />
    );
  }

  return children;
}
