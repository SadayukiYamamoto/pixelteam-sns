import React from "react";
import "./VideoThumbnailCard.css";
import { PlayCircle, Medal } from "lucide-react";

const VideoThumbnailCard = ({ video, onClick }) => {
  // 事務局 or アバターなし → 緑丸
  const isOffice = video.user === "事務局" || !video.userAvatar;

  // バッジ判定ロジック
  let badge = null;

  if (video.is_test_passed && video.is_watched) {
    badge = (
      <div className="status-triangle badge-gold">
        <Medal size={14} className="medal-icon" />
        <span className="status-text text-gold">全て完了</span>
      </div>
    );
  } else if (!video.is_test_passed && video.is_watched) {
    badge = (
      <div className="status-triangle badge-blue">
        <span className="status-text">動画完了</span>
      </div>
    );
  } else if (video.is_test_passed && !video.is_watched) {
    badge = (
      <div className="status-triangle badge-green">
        <span className="status-text text-xs-small">テスト<br />合格</span>
      </div>
    );
  }

  return (
    <div className="video-card" onClick={onClick}>
      <div className="thumbnail-container">
        <img src={video.thumb} alt={video.title} className="thumbnail" />
        {badge}
        <div className="thumbnail-overlay">
          <PlayCircle size={48} className="play-icon" />
        </div>
        <span className="duration">{video.duration}</span>
      </div>

      <div className="video-info">
        {isOffice ? (
          <div
            className="avatar"
            style={{
              backgroundColor: "#22c55e", // 緑色
            }}
          ></div>
        ) : (
          <img
            src={video.userAvatar}
            alt={video.user}
            className="avatar"
          />
        )}

        <div className="video-text">
          <p className="title">{video.title}</p>
          <p className="user">{video.user}</p>
          <p className="views">{video.views} 回視聴</p>
        </div>
      </div>
    </div>
  );
};

export default VideoThumbnailCard;
