import { useState, useEffect } from "react";
import { BiSolidErrorAlt } from "react-icons/bi";

import styles from "./login.module.css";

const Login = ({ login }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (error) {
      setError(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <h1>COM Analyzer</h1>
        <div className={styles.loginBox}>
          <div className={styles.field}>
            <p>Usuario</p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <div className={styles.field}>
            <p>Contraseña</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <p className={styles.loginButton} onClick={handleLogin}>
            Iniciar sesión
          </p>
        </div>
      </div>
      {error && (
        <div className={styles.error}>
          <BiSolidErrorAlt />
          <p>Credenciales incorrectas</p>
        </div>
      )}
    </div>
  );
};

export default Login;
