import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import "./MissionPage.css";

export default function MissionPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("daily");
  const [anim, setAnim] = useState("");

  const lists = {
    daily: [
      "ログインしよう",
      "個人実績を確認しよう",
      "店舗実績を確認しよう",
      "いいねをしよう",
      "コメントをしよう",
      "投稿をしよう",
    ],
    weekly: [
      "ノウハウを投稿しよう",
      "事務局だよりを視聴しよう",
      "動画を視聴しよう",
      "テストを受けよう",
    ],
    monthly: ["360°評価を回答しよう"],
  };

  const current = lists[tab];
  const completedCount = 1;
  const totalCount = current.length;

    // ーーーー フェードスライド実装 ーーーー
    const changeTab = (next) => {
      if (tab === next) return;
  
      setAnim("fade-out");
      setTimeout(() => {
        setTab(next);
        setAnim("fade-in");
      }, 200);
    };

    return (
      <div className="mission-container">
  
        {/* ===== ヘッダー ===== */}
        <div className="mission-header">
          <div className="mission-title">
            {tab === "daily" && "デイリーミッション"}
            {tab === "weekly" && "ウィークリーミッション"}
            {tab === "monthly" && "マンスリーミッション"}
          </div>
  
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{
                width: `${(completedCount / totalCount) * 100}%`
              }}
            />
          </div>
  
          <div className="mission-count">
            達成数：{completedCount} / {totalCount}
          </div>
        </div>
  
        {/* ===== カード一覧（フェードスライド付き） ===== */}
        <div className={`mission-list ${anim}`}>
  
          {/* 最初のカード */}
          <div className="mission-card mission-card-active">
            {current[0]}
            <button className="mission-clear-btn">達成</button>
          </div>
  
          {/* その他のカード */}
          {current.slice(1).map((item, i) => (
            <div className="mission-card" key={i}>
              {item}
            </div>
          ))}
        </div>
  
        {/* ===== 白い背景（下のエリア） ===== */}
        <div className="mission-footer-bg"></div>
  
        {/* ===== タブ ===== */}
        <div className="mission-tab-container">
          <button
            className={`mission-tab ${tab === "daily" ? "active" : ""}`}
            onClick={() => changeTab("daily")}
          >
            デイリー
          </button>
          <button
            className={`mission-tab ${tab === "weekly" ? "active" : ""}`}
            onClick={() => changeTab("weekly")}
          >
            ウィークリー
          </button>
          <button
            className={`mission-tab ${tab === "monthly" ? "active" : ""}`}
            onClick={() => changeTab("monthly")}
          >
            マンスリー
          </button>
        </div>
  
        {/* ===== × ボタン ===== */}
        <div className="mission-close-btn" onClick={() => navigate(-1)}>
          <XCircle size={34} color="#25a94b" />
        </div>
      </div>
    );
  }
  
