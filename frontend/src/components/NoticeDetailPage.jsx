// src/components/NoticeDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./NoticeDetailPage.css";

export default function NoticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notice, setNotice] = useState(null);

  useEffect(() => {
    loadNoticeDetail();
  }, []);

  const loadNoticeDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/notices/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setNotice(res.data);
    } catch (err) {
      console.log("Notice detail API error:", err);
    }
  };

  if (!notice) {
    return <div className="notice-detail-loading">読み込み中...</div>;
  }


  return (
    <div className="notice-detail-container">

      {/* 戻るボタン */}
      <button className="notice-back-btn" onClick={() => navigate(-1)}>
        ← 戻る
      </button>

      <div className="notice-detail-card">

        {/* 画像：header */}
        {notice.image_url && notice.image_position === "header" && (
          <div className="aspect-1120-450">
          <img src={notice.image_url} alt="" />
        </div>
        
        )}

        {/* カテゴリ */}
        <span className={`notice-detail-category ${notice.category}`}>
          {notice.category}
        </span>

        {/* タイトル */}
        <h1
          className="notice-detail-title"
          style={{ color: notice.text_color }}
        >
          {notice.title}
        </h1>

        {/* ヘッダー文字 */}
        {notice.header_text && (
          <p
            className={
              notice.is_bold_header
                ? "notice-detail-header bold"
                : "notice-detail-header"
            }
          >
            {notice.header_text}
          </p>
        )}

        {/* 画像：top */}
        {notice.image_url && notice.image_position === "top" && (
          <img src={notice.image_url} className="notice-detail-img" />
        )}

        {/* 本文 */}
        <div
          className="notice-detail-body"
          style={{ color: notice.text_color }}
          dangerouslySetInnerHTML={{
  __html: renderLinkCards(
    notice.body?.replace(/\n/g, "<br>")
  ),
}}
        ></div>

        {/* 画像：bottom */}
        {notice.image_url && notice.image_position === "bottom" && (
          <img src={notice.image_url} className="notice-detail-img" />
        )}

        {/* 注意事項 */}
        {notice.notes && (
          <div className="notice-detail-notes">
            <h4>■ 注意事項</h4>
            <p>{notice.notes}</p>
          </div>
        )}

        {/* 期間表示 */}
        {(notice.period_start || notice.period_end) && (
          <div className="notice-detail-period">
            📅 {notice.period_start || "未設定"} 〜{" "}
            {notice.period_end || "未設定"}
          </div>
        )}
      </div>
    </div>
  );
}
