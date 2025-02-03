import React, { useState, useEffect } from "react";

import Router from "../../components/Router/Router";
import Header from "../../components/Header/Header";
import Login from "../../screens/Login/Login";

import styles from "./app.module.css";

// login con localStorge

const App = () => {
  const [isLogged, setIsLogged] = useState(false);

  const fetchData = async (username, password) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/user/getUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching user:`, error);
      throw error;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLogged(true);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const userData = await fetchData(username, password);
      localStorage.setItem("user", JSON.stringify(userData));
      setIsLogged(true);
    } catch (error) {
      console.error(`Error logging in:`, error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      setIsLogged(false);
    } catch (error) {
      console.error(`Error logging out:`, error);
    }
  };

  return (
    <div className={styles.container}>
      {isLogged ? (
        <>
          <Header logout={logout} />
          <Router />
        </>
      ) : (
        <Login login={login} />
      )}
    </div>
  );
};

export default App;
