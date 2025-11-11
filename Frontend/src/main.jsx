import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./Context/UserContext.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <BrowserRouter>
      <Toaster />
      <App />
    </BrowserRouter>
  </UserProvider>
);
