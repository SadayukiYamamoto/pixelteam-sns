import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pencil } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function TreasureFAB() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAllowed, setIsAllowed] = useState(true);

  const path = location.pathname;
  const state = location.state;

  useEffect(() => {
    const checkPermission = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const res = await axiosClient.get(`mypage/${userId}/`);
        if (res.data.team === "event") {
          setIsAllowed(false);
        }
      } catch (err) {
        console.error("権限チェック失敗:", err);
      }
    };
    checkPermission();
  }, []);

  // ノウハウ関係のパス（/treasure, /treasure-pixel, /treasure-categories など）で表示
  const isTreasurePage = path.startsWith("/treasure") || path.startsWith("/treasure-pixel") || path.startsWith("/treasure-categories");

  if (!isTreasurePage) return null;

  // 権限がない場合は表示しない
  if (!isAllowed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none flex justify-center z-[1000]">
      <div className="w-full max-w-[480px] relative h-32">
        <button
          onClick={() =>
            navigate("/treasure/new", {
              state: {
                parentCategory: state?.parentCategory || null,
                category: state?.category || null,
              },
            })
          }
          className="absolute bottom-24 right-5 pointer-events-auto bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center border-none cursor-pointer"
          style={{ width: '64px', height: '64px' }}
        >
          <Pencil size={30} color="#ffffff" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
