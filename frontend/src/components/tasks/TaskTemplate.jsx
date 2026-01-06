import React from "react";
import Header from "../Header";
import Navigation from "../Navigation";

export default function TaskTemplate({ title, description, items }) {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#f6f7f9]">
      {/* 固定ヘッダー */}
      <Header />

      {/* スクロール領域 */}
      <div
        className="flex-1 overflow-y-auto px-4 pt-6 pb-32"
        style={{ height: "calc(100vh - 120px)" }}
      >
        <div className="flex justify-center -mb-2">
          <div className="pokepoke-label scale-100 shadow-lg px-8">
            {title}
          </div>
        </div>

        {description && (
          <p className="text-gray-500 text-[11px] font-black mt-8 mb-6 text-center">{description}</p>
        )}

        <div className="grid grid-cols-3 gap-3 w-full">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => window.open(item.url, "_blank")}
              className="h-24 bg-white pokepoke-card 
                         flex items-center justify-center px-2
                         hover:shadow-xl transition-all text-center w-full"
            >
              <p className="font-black text-[12px] text-gray-800 leading-tight break-words">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Navigation activeTab="tasks" />
    </div>
  );
}
