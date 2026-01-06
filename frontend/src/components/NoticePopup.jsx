// src/components/NoticePopup.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { logInteraction } from "../utils/analytics";
import "./NoticePopup.css";


export default function NoticePopup({ onClose }) {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const res = await axiosClient.get(`notices/`);
      setNotices(res.data);
    } catch (err) {
      console.log("❌ popup API error:", err);
    }
  };

  return (
    <div className="notice-popup-bg" onClick={onClose}>
      {/* ←ここ修正！！ */}
      <div className="notice-popup-large" onClick={(e) => e.stopPropagation()}>

        {/* === ヘッダー === */}
        <div className="notice-popup-header">
          <h3>おしらせ</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* === 一覧 === */}
        <div className="notice-popup-list">
          {notices.map((item) => (
            <a
              key={item.id}
              href={`/notice/${item.id}`}
              onClick={() => logInteraction('notice', item.id, item.title)}
              className="notice-card-mini"
            >
              {/* 画像 */}
              {item.image_url && (
                <div className="aspect-1120-450">
                  <img src={item.image_url} alt="" />
                </div>
              )}


              {/* カテゴリ */}
              <span className={`notice-card-mini-label ${item.category}`}>
                {item.category}
              </span>

              {/* タイトル */}
              <div className="notice-card-mini-title">{item.title}</div>

              {/* 日付 */}
              <div className="notice-card-mini-date">
                {item.created_at?.slice(0, 10)}
              </div>
            </a>
          ))}
        </div>

        <div className="notice-popup-more">
          <a href="/notices">→ おしらせ一覧を見る</a>
        </div>

      </div>
    </div>
  );
}
