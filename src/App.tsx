import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Zlomkarna from "./Zlomkarna";

const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <Routes>
        <Route path="/" element={<Navigate to="/ucime-se" replace />} />
        <Route path="/ucime-se/*" element={<Zlomkarna />} />
        <Route path="/soutez/*" element={<Zlomkarna />} />
        <Route path="*" element={<Navigate to="/ucime-se" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
