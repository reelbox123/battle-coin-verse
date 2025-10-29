import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import FlowProviderWrapper from "./components/FlowProviderWrapper.tsx";

createRoot(document.getElementById("root")!).render(
  <FlowProviderWrapper>
    <App />
  </FlowProviderWrapper>
);

