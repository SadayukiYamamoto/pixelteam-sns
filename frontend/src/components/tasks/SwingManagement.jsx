import React from "react";
import Header from "../Header";
import Navigation from "../Navigation";

export default function SwingManagement() {
  const items = [
    { name: "Akiba", url: "https://docs.google.com/spreadsheets/d/13899BiQpMehwhqlPEVB6A7RdjBYe7haSWp67kqMIoRc/edit?gid=1362822343#gid=1362822343" },
    { name: "Yokohama", url: "https://docs.google.com/spreadsheets/d/1gV7MVkjc64HJTuNNpGMcL9BWGOakQo9sMgU-6O2PPDI/edit?gid=1716537036#gid=1716537036" },
    { name: "Umeda", url: "https://docs.google.com/spreadsheets/d/1kSMeyXV25nvxnJfsUsruBvACAj3t9-H7ry8X141jyRQ/edit?usp=drive_link" },
    { name: "Kyoto", url: "https://docs.google.com/spreadsheets/d/1kVhUrf-VD1RDFjORshvic11e3X2jUzTp1MS5r-rpdiA/edit?usp=drive_link" },
    { name: "Hakata", url: "https://docs.google.com/spreadsheets/d/1nMHTH-vR0qPq9Q3178Yg_DQQfzjX_8Fgk0IJvD30rNU/edit?usp=drive_link" },
    { name: "Sendai", url: "https://docs.google.com/spreadsheets/d/1e6NgrVhZsq5b1wESftxyI0zbIGoEgv8FXOx4-VpZxCw/edit?usp=drive_link" },
    { name: "Kichijoji", url: "https://docs.google.com/spreadsheets/d/1hyfDW91xJvbr_j8Ge3O2CTHRQSY-rAtxBodRxUJMx_A/edit?usp=drive_link" },
    { name: "Kawasaki", url: "https://docs.google.com/spreadsheets/d/17IFkdmYKAV5Mr7tlyr4D36K6C8CHhlFm4zHYuwPtb9M/edit?usp=drive_link" }
  ];

  return (
    <div className="relative flex flex-col min-h-screen bg-white">
      <Header />

      {/* スクロール領域 */}
      <div
        className="flex-1 overflow-y-auto px-3 pt-4 pb-32"
        style={{ height: "calc(100vh - 120px)" }}
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
