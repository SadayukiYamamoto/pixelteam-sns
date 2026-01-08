import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import * as LucideIcons from "lucide-react"; // アイコン動的読み込み
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { logInteraction } from "../utils/analytics";
import "../components/tasks/TaskPage.css";

// ★ ローディングスピナー（ぐるぐる）
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
  </div>
);

// ★ 業務カード（PokéPokéスタイル適用）
const BusinessCard = ({ item }) => {
  // item.icon_name から Lucide アイコンを取得
  const Icon = LucideIcons[item.icon_name] || LucideIcons.HelpCircle;

  // アイコン用のカラーマッピング（管理画面の COLOR_OPTIONS と同期）
  const colorMap = {
    "text-gray-800": "#1e293b",
    "text-red-500": "#ef4444",
    "text-blue-500": "#3b82f6",
    "text-green-500": "#10b981",
    "text-yellow-500": "#f59e0b",
    "text-purple-500": "#a855f7",
    "text-pink-500": "#ec4899",
    "text-cyan-500": "#06b6d4",
    // 予備の古いカラー値用
    "text-emerald-500": "#10b981",
  };

  const getIconColor = () => {
    return colorMap[item.color] || "#1e293b"; // デフォルトは黒
  };

  const iconColor = getIconColor();

  const triggerMission = async (actionType, actionDetail = null) => {
    try {
      await axiosClient.post(`missions/trigger/`,
        { action_type: actionType, action_detail: actionDetail }
      );
    } catch (err) {
      console.error("Mission trigger error:", err);
    }
  };

  const handleClick = () => {
    logInteraction('task', item.id, item.title);
    triggerMission('task_button', item.title);
    if (item.title === '健康観察') triggerMission('health_check_click');
    if (item.title === '個人実績報告' || item.title === '個人報告') {
      triggerMission('individual_report_click');
    }
    if (!item.url) return;
    if (item.url.startsWith("/")) {
      window.location.href = item.url;
    } else {
      window.open(item.url, "_blank");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="pokepoke-card flex flex-col items-center justify-center h-34 p-4 relative group transition-all duration-300"
      style={{
        margin: '10px',
        width: 'calc(100% - 20px)'
      }}
    >
      {/* ↓ くぼみを少し大きく、より角丸に調整 */}
      <div
        className="mb-3 flex items-center justify-center w-[72px] h-[72px] rounded-[28px] transition-all duration-300 group-hover:scale-105"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(255,255,255,0.7)'
        }}
      >
        <Icon
          size={34}
          strokeWidth={2.4}
          style={{ color: iconColor, stroke: iconColor }}
        />
      </div>

      <p className="text-[12px] font-bold text-slate-700 text-center leading-tight tracking-wide px-1">
        {item.title}
      </p>
    </button>
  );
};



const TaskPage = () => {
  const [team, setTeam] = useState(null); // null → 読み込み中
  const [tasks, setTasks] = useState([]); // APIから取得したタスク
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const init = async () => {
      try {
        // 1. チーム取得
        const teamRes = await axiosClient.get(`mypage/${userId}/`);
        const userTeam = teamRes.data.team;
        setTeam(userTeam);

        // 2. タスク一覧取得 (チームでフィルタ)
        // training は全部見れるとか、ロジックがあればここで調整
        // Backend側で ?team=xxx を受けてフィルタしている前提
        let query = "";
        if (userTeam === "event") query = "?team=event";
        if (userTeam === "shop") query = "?team=shop";

        const tasksRes = await axiosClient.get(`task_buttons/${query}`);
        console.log("📥 Tasks API Response:", tasksRes.data);
        setTasks(tasksRes.data);

      } catch (err) {
        console.error(err);
        setTeam("");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <LoadingSpinner />
        <Navigation />
      </>
    );
  }

  // カテゴリグループ化 (parent_category でグループ化)
  const grouped = tasks.reduce((acc, item) => {
    const sectionName = item.parent_category || "その他";
    (acc[sectionName] = acc[sectionName] || []).push(item);
    return acc;
  }, {});

  // 表示順序の定義
  const sectionOrder = [
    "申請・報告",
    "実績・確認",
    "実績・管理",
    "お知らせ・情報",
    "シフト・ツール",
    "関連サイト",
    "その他"
  ];

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const indexA = sectionOrder.indexOf(a);
    const indexB = sectionOrder.indexOf(b);
    // 定義にないものは最後に
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />

        <div
          className="pt-[72px] px-5 pb-[100px] bg-[#f9fafb]"
        >
          <div className="flex justify-center -mb-6 pt-6 relative z-10">
            <div className="pokepoke-label px-8 shadow-lg scale-110" style={{ marginTop: '30px' }}>
              業務一覧
            </div>
          </div>

          {Object.keys(grouped).length === 0 && (
            <div className="text-center text-gray-400 py-10">
              表示できる業務メニューがありません
            </div>
          )}

          {sortedKeys.map((sectionName) => (
            <div key={sectionName} className="mb-12">
              {/* セクションタイトル */}
              <div className="flex items-center space-x-2 px-2 mb-6">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full shadow-sm"></div>
                <p className="text-[17px] font-black text-slate-800 tracking-tight">
                  {sectionName}
                </p>
              </div>

              <div className="grid grid-cols-3 px-1">
                {grouped[sectionName].map((item) => (
                  <BusinessCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <Navigation activeTab="tasks" />
      </div>
    </div>
  );
};

export default TaskPage;
