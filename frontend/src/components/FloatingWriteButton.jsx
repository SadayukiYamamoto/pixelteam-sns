import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";
import { Capacitor } from "@capacitor/core";

const FloatingWriteButton = ({ userTeam, isAbsolute = false }) => {
  const navigate = useNavigate();
  const isIos = Capacitor.getPlatform() === 'ios';

  // Pixel-Event チームは投稿不可
  if (userTeam === "event") return null;

  const buttonContent = (
    <button
      onClick={() => navigate("/post")}
      className={`absolute right-[20px] pointer-events-auto bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-xl transition-all transform hover:scale-110 flex items-center justify-center border-none allow-fill`}
      aria-label="新規投稿"
      style={{
        width: '60px',
        height: '60px',
        bottom: 'calc(110px + env(safe-area-inset-bottom, 0px))'
      }}
    >
      <FaPen size={24} />
    </button>
  );

  if (isAbsolute) return buttonContent;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[548px] h-0 pointer-events-none z-50">
      {buttonContent}
    </div>
  );
};

export default FloatingWriteButton;
