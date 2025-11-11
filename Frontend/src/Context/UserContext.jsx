import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

// Create Context
const UserContext = createContext(null);

// Custom Hook
export const useFetchedUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [loggedInUser, setloggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);





  //GETING TOKEN FROM LOCALSTORAGE
  const token = localStorage.getItem("token");

  //FATCHING USER 
  const fetchUser = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setloggedInUser(res.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      setloggedInUser(null);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (token) fetchUser();
    else setLoading(false);
  }, [token]);

  const value = {
    loggedInUser,
    setloggedInUser,
    loading,
    refetchUser: fetchUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
