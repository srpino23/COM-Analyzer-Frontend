import { Routes, Route } from "react-router-dom";
import Home from "../../screens/Home/Home";
import Map from "../../screens/Map/Map";
import Devices from "../../screens/Devices/Devices";
import Settings from "../../screens/Settings/Settings";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<Map />} />
      <Route path="/devices" element={<Devices />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default Router;
