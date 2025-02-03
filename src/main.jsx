import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./screens/App/App";
import "./styles/global.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);