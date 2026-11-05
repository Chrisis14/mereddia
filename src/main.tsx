import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./theme";
import { MereddiaGame } from "./game/MereddiaGame";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <MereddiaGame />
  </ThemeProvider>,
);
