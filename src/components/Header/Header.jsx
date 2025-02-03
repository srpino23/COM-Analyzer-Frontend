import { NavLink } from "react-router-dom";

import { SiAnalogue } from "react-icons/si";
import { IoGridOutline, IoSettingsOutline, IoPower } from "react-icons/io5";
import { FaRegMap } from "react-icons/fa";
import { FiServer } from "react-icons/fi";

import styles from "./header.module.css";

const Header = ({ logout }) => {
  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <SiAnalogue />
      </div>
      <nav className={styles.nav}>
        <div className={styles.pages}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? styles.active : styles.inactive
            }
          >
            <IoGridOutline />
          </NavLink>
          <NavLink
            to="/map"
            className={({ isActive }) =>
              isActive ? styles.active : styles.inactive
            }
          >
            <FaRegMap />
          </NavLink>
          <NavLink
            to="/devices"
            className={({ isActive }) =>
              isActive ? styles.active : styles.inactive
            }
          >
            <FiServer />
          </NavLink>
        </div>
        <div className={styles.settings}>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive ? styles.active : styles.inactive
            }
          >
            <IoSettingsOutline />
          </NavLink>
          <button onClick={handleLogout}>
            <IoPower />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
