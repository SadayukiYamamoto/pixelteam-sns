// src/components/NoticePage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./NoticePage.css";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function NoticePage() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const token = localStorage.getItem("djangoToken");
      const config = {};
      if (token) {
        config.headers = { Authorization: `Token ${token}` };
      }
      const res = await axios.get(`${API_URL}/api/notices/`, config);
      setNotices(res.data);
    } catch (err) {
      console.log("❌ Notice API error:", err);
    }
  };

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />
        <div
          className="overflow-y-auto pb-40"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <div className="notice-page">
            <h1 className="notice-title">📢 お知らせ</h1>

            <div className="notice-list">
              {notices.map((item) => (
                <div className="notice-card" key={item.id}>
                  {/* 画像：header */}
                  {item.image_url && item.image_position === "header" && (
                    <img src={item.image_url} className="notice-img" />
                  )}

                  {/* カテゴリー */}
                  <span className={`notice-label ${item.category}`}>
                    {item.category}
                  </span>

                  {/* タイトル */}
                  <h2
                    className="notice-card-title"
                    style={{ color: item.text_color }}
                  >
                    {item.title}
                  </h2>

                  {/* サブタイトル（header_text） */}
                  {item.header_text && (
                    <p className="notice-header-text">{item.header_text}</p>
                  )}

                  {/* 画像：top */}
                  {item.image_url && item.image_position === "top" && (
                    <img src={item.image_url} className="notice-img" />
                  )}

                  {/* 本文 */}
                  <div
                    className="notice-body"
                    style={{ color: item.text_color }}
                    dangerouslySetInnerHTML={{
                      __html: item.body?.replace(/\n/g, "<br>"),
                    }}
                  ></div>

                  {/* 画像：bottom */}
                  {item.image_url && item.image_position === "bottom" && (
                    <img src={item.image_url} className="notice-img" />
                  )}

                  {/* 注意事項 */}
                  {item.notes && (
                    <div className="notice-notes">
                      <h4>■ 注意事項</h4>
                      <p>{item.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Navigation activeTab="home" />
      </div>
    </div>
  );
}
