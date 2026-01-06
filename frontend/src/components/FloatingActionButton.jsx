import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";

export default function FloatingWriteButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // ノウハウページのみ表示
  const isTreasurePage = location.pathname.startsWith("/treasure");

  if (!isTreasurePage) return null;

  return (
    <button
      onClick={() => navigate("/treasure/new")}
      className="fixed bottom-28 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform transform hover:scale-110"
    >
      <Plus size={28} />
    </button>
  );
}
