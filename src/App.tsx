import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Lecture from "./pages/Lecture";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/v/:slug" element={<Lecture />} />
      <Route path="/v/:slug/:topic" element={<Lecture />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
