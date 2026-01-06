import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import "./VideoPlayer.css";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Navigation from "./Navigation";
import { ArrowLeft, Volume2, VolumeX, Play, Pause, RotateCcw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function VideoPlayer() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [videoData, setVideoData] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [playedOnce, setPlayedOnce] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(null); // 'play', 'pause', 'seek-forward', 'seek-backward'
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fetchVideo = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/videos/${id}/`);
      setVideoData(res.data);
    } catch (err) {
      console.error("動画データ取得エラー:", err);
    }
  };

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const sendWatchLog = async (sec) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await axios.post(
        `${API_URL}/api/videos/save_log/`,
        { video_id: id, watch_time: sec },
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch (err) {
      console.error("❌ 視聴ログ送信エラー:", err);
    }
  };

  useEffect(() => {
    if (!startTime || !isPlaying) return;
    const interval = setInterval(() => sendWatchLog(10), 10000);
    return () => clearInterval(interval);
  }, [startTime, isPlaying]);

  useEffect(() => {
    const handleUnload = () => {
      if (!startTime) return;
      const sec = Math.floor((Date.now() - startTime) / 1000);
      sendWatchLog(sec);
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [startTime]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setShowCenterIcon('play');
      } else {
        videoRef.current.pause();
        setShowCenterIcon('pause');
      }
      setTimeout(() => setShowCenterIcon(null), 500);
    }
  }, []);

  const handlePlay = async () => {
    if (!startTime) setStartTime(Date.now());
    if (!playedOnce) {
      setPlayedOnce(true);
      const token = localStorage.getItem("token");

      // 1. 再生回数インクリメント (認証/未認証問わずカウントする場合はToken無しでもOKだが、APIに合わせて)
      try {
        await axios.post(
          `${API_URL}/api/videos/add_view/`,
          { video_id: id },
          // トークンがあれば送るが、AllowAnyなら無くても通る
          token ? { headers: { Authorization: `Token ${token}` } } : {}
        );
      } catch (err) {
        console.error("再生数カウントエラー:", err);
      }

      // 2. 視聴ログ開始 (Token必須)
      if (token) {
        try {
          await axios.post(
            `${API_URL}/api/videos/save_log/`,
            { video_id: id, watch_time: 0 },
            { headers: { Authorization: `Token ${token}` } }
          );
        } catch (err) {
          console.error("視聴ログ開始エラー:", err);
        }
      }

      // 更新されたデータを再取得
      fetchVideo();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const targetMute = !isMuted;
      setIsMuted(targetMute);
      videoRef.current.muted = targetMute;
    }
  };

  const seek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      setShowCenterIcon(seconds > 0 ? 'seek-forward' : 'seek-backward');
      setTimeout(() => setShowCenterIcon(null), 500);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        setVolume(prev => {
          const v = Math.min(1, prev + 0.1);
          if (videoRef.current) videoRef.current.volume = v;
          return v;
        });
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        setVolume(prev => {
          const v = Math.max(0, prev - 0.1);
          if (videoRef.current) videoRef.current.volume = v;
          return v;
        });
      } else if (e.code === "ArrowRight") {
        seek(5);
      } else if (e.code === "ArrowLeft") {
        seek(-5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  if (!videoData) {
    return (
      <div className="video-loading-screen">
        <div className="pixtube-loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />

        <div
          className="overflow-y-auto pb-32"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <div className="video-player-scroll-area" style={{ padding: "0 10px" }}>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
              <span>戻る</span>
            </button>

            <div className="video-main-section">
              <div className="video-wrapper" onClick={togglePlay}>
                <video
                  ref={videoRef}
                  src={videoData.video_url}
                  playsInline
                  onPlay={() => {
                    handlePlay();
                    setIsPlaying(true);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  className="video-element"
                />

                {/* YouTube Style Overlay Icons */}
                {showCenterIcon && (
                  <div className="video-center-overlay">
                    <div className="video-icon-circle">
                      {showCenterIcon === "play" && (
                        <Play size={40} fill="white" />
                      )}
                      {showCenterIcon === "pause" && (
                        <Pause size={40} fill="white" />
                      )}
                      {showCenterIcon === "seek-forward" && (
                        <div className="seek-icon-wrap">
                          <span>+5s</span>
                        </div>
                      )}
                      {showCenterIcon === "seek-backward" && (
                        <div className="seek-icon-wrap">
                          <span>-5s</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="video-controls-modern">
                <div className="seek-bar-container">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="seek-slider"
                  />
                  <div className="time-display">
                    <span>{formatTime(currentTime)}</span>
                    <span> / </span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className="bottom-controls">
                  <div className="left-controls">
                    <button className="icon-btn" onClick={togglePlay}>
                      {isPlaying ? (
                        <Pause size={22} fill="currentColor" />
                      ) : (
                        <Play size={22} fill="currentColor" />
                      )}
                    </button>
                    <div className="volume-control-wrap">
                      <button className="icon-btn" onClick={toggleMute}>
                        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="modern-volume-slider"
                      />
                    </div>
                  </div>

                  <div className="right-controls">
                    <button
                      className="icon-btn"
                      onClick={() => {
                        if (videoRef.current) videoRef.current.currentTime = 0;
                      }}
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="video-info-card">
              <h2 className="video-title">{videoData.title}</h2>

              <div className="video-meta-row">
                <span className="video-user">投稿者: {videoData.user}</span>
                <div className="video-views-badge">
                  再生回数:{" "}
                  <span className="views-count">{videoData.views}</span>回
                </div>
              </div>

              <div className="video-stats-card">
                <div className="stats-icon">
                  <div className="pulse"></div>
                </div>
                <p>
                  累計視聴: <strong>{videoData.watch_time}</strong> 秒
                </p>
              </div>

              <button
                className="test-button-modern"
                onClick={() => navigate(`/videos/${id}/test`)}
              >
                理解度テストに進む
                <Play size={18} fill="white" />
              </button>
            </div>
          </div>
        </div>

        <Navigation />
      </div>
    </div>
  );
}
