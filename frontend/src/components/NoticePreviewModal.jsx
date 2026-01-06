// src/components/NoticePreviewModal.jsx
import React from "react";
import "./NoticePreviewModal.css";

function renderLinkCards(html) {
  // パターン1：<a href="URL">…</a>
  const anchorTagRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>[\s\S]*?<\/a>/g;

  html = html.replace(anchorTagRegex, (match, url) => {
    return `
      <div class="x-card">
        <a class="x-card-link" href="${url}" target="_blank">
          <div class="x-card-content">
            <div class="x-card-title">${url}</div>
            <div class="x-card-desc">リンクを開く</div>
          </div>
        </a>
      </div>
    `;
  });

  // 🟡 パターン2：生 URL（これが今抜けてる！！）
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;

  html = html.replace(urlRegex, (url) => {
    return `
      <div class="x-card">
        <a class="x-card-link" href="${url}" target="_blank">
          <div class="x-card-content">
            <div class="x-card-title">${url}</div>
            <div class="x-card-desc">リンクを開く</div>
          </div>
        </a>
      </div>
    `;
  });

  return html;
}



export default function NoticePreviewModal({
  title,
  category,
  image_url,
  header_text,
  body,
  notes,
  text_color,
  image_position,
  onClose,
}) {
  return (
    <div className="preview-modal-bg" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>

        {/* 閉じるボタン */}
        <div className="preview-header">
          <h3>プレビュー</h3>
          <button className="preview-close" onClick={onClose}>×</button>
        </div>

        <div className="notice-card-preview">

          {/* 画像の位置：header */}
          {image_url && image_position === "header" && (
            <img src={image_url} className="preview-img-header" />
          )}

          {/* カテゴリラベル */}
          <span className={`preview-category-label ${category}`}>
            {category}
          </span>

          {/* タイトル */}
          <h2 className="preview-title" style={{ color: text_color }}>
            {title}
          </h2>

          {/* ヘッダー文字 */}
          {header_text && (
            <p className="preview-header-text">{header_text}</p>
          )}

          {/* 画像の位置：本文の上 */}
          {image_url && image_position === "top" && (
            <img src={image_url} className="preview-img-top" />
          )}

          {/* 本文（HTMLレンダリング） */}
          <div
            className="preview-body"
            style={{ color: text_color }}
            dangerouslySetInnerHTML={{
              __html: renderLinkCards(body.replace(/\n/g, "<br>"))
            }}
            
            
          ></div>

          {/* 画像の位置：本文の下 */}
          {image_url && image_position === "bottom" && (
            <img src={image_url} className="preview-img-bottom" />
          )}

          {/* 注意事項 */}
          {notes && (
            <div className="preview-notes">
              <h4>■ 注意事項</h4>
              <p>{notes}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
