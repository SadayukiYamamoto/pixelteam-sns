import React from "react";
import Header from "../Header";
import Navigation from "../Navigation";

export default function SwingManagement() {
  const items = [
    { name: "Akiba", url: "https://docs.google.com/spreadsheets/d/1KQ70H5YbBSAw7OYfTOiZeFxesgu0hNiC8YxcUGg_RqM/edit?usp=drive_link" },
    { name: "Yokohama", url: "https://docs.google.com/spreadsheets/d/1KQ70H5YbBSAw7OYfTOiZeFxesgu0hNiC8YxcUGg_RqM/edit?usp=drive_link" },
    { name: "Umeda", url: "https://docs.google.com/spreadsheets/d/1maz_FOfaiYSwU03IBsZb2hXu4xXGwO4k3S5E8_XYuQQ/edit?usp=drive_link" },
    { name: "Kyoto", url: "https://docs.google.com/spreadsheets/d/1kmIW3UA_2wbhaBqO9JgtPRk2AkrHtS42Y2O7OX522J8/edit?usp=drive_link" },
    { name: "Hakata", url: "https://docs.google.com/spreadsheets/d/1gtRGrN0p-r6SMJzKccMZpoQVScluivmNHjmzWHfl6Hk/edit?usp=drive_link" },
    { name: "Sendai", url: "https://docs.google.com/spreadsheets/d/1UjZS5BmQWkPS_yzoHlsswgxIU9TYUvDp7KzNmn_j7K0/edit?usp=drive_link" },
    { name: "Shinjuku", url: "" },
    { name: "Kichijoji", url: "https://docs.google.com/spreadsheets/d/1ttVnm6Kb2kfvPjHRZZF30zc7rLNrpFJO92eWPiMuFGM/edit?usp=drive_link" },
    { name: "Kawasaki", url: "https://docs.google.com/spreadsheets/d/1b1QX85guYK7uxkIVo7tRy5WxkzGh51q4wagIQkUFRPI/edit?usp=drive_link" },
    { name: "Sapporo", url: "" }
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-white">
      <Header />

      {/* スクロール領域 */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-32"
        style={{
          height: "calc(100vh - 120px)",
          paddingTop: "calc(112px + env(safe-area-inset-top, 0px))"
        }}
      >
        <h2 className="text-2xl font-bold mb-2">スイング管理（店舗一覧）</h2>
        <p className="text-gray-600 text-sm mb-4">
          各店舗のスイング管理表にアクセスできます。
        </p>

        <div className="grid grid-cols-3 gap-3 w-full">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => window.open(item.url, "_blank")}
              className="h-20 bg-white rounded-xl border shadow-sm 
                         flex items-center justify-center px-1
                         hover:shadow-md transition text-center w-full"
            >
              <p className="font-semibold text-sm text-gray-800 leading-tight break-words">
                {item.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Navigation />
    </div>
  );
}
