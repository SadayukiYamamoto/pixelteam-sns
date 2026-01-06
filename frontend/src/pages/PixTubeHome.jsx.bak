import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import VideoThumbnailCard from '../components/VideoThumbnailCard';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { logInteraction } from '../utils/analytics';
import { PlayCircle, ChevronLeft, ChevronRight, Film, Medal } from 'lucide-react';
import './PixTubeHome.css';
import '../components/VideoThumbnailCard.css'; // Badge styles

const PixTubeHome = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitionLoading, setTransitionLoading] = useState(false);


  const navigate = useNavigate();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axiosClient.get('videos/');
        // 🔽 response.data が配列であることを確認してからソート
        const rawData = Array.isArray(response.data) ? response.data :
          (response.data && Array.isArray(response.data.results) ? response.data.results : []);

        const sorted = [...rawData].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setVideos(sorted);
      } catch (error) {
        console.error('動画取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  // ✅ 注目の動画（is_featured=true のものがあればそれ、なければ最新）
  const featuredVideo = videos.find(v => v.is_featured);
  const heroVideo = featuredVideo || videos[0]; // なければ最新を代替

  // ヒーロー以外をショート動画リストなどにするなら除外が必要だが、
  // 現状は「ショート動画」セクションは別途定義されている？
  // 元のコード: shortVideos = videos.slice(1) なので、ヒーロー以外の残り全部としていた

  // 修正案:
  // heroVideo が決まったら、それ以外の動画をリストにする
  const otherVideos = videos.filter(v => v.id !== (heroVideo?.id));

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 1); // カルーセル機能は実質1枚なら不要だが維持

  // バッジレンダリングヘルパー
  const renderBadge = (video) => {
    if (!video) return null;
    if (video.is_test_passed && video.is_watched) {
      return (
        <div className="status-triangle badge-gold">
          <Medal size={14} className="medal-icon" />
          <span className="status-text text-gold">全て完了</span>
        </div>
      );
    } else if (!video.is_test_passed && video.is_watched) {
      return (
        <div className="status-triangle badge-blue">
          <span className="status-text">動画完了</span>
        </div>
      );
    } else if (video.is_test_passed && !video.is_watched) {
      return (
        <div className="status-triangle badge-green">
          <span className="status-text text-xs-small">テスト<br />合格</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header className="header pxtube" />
        <div
          className="overflow-y-auto pb-32"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          <div className="pix-content">
            {loading && (
              <div className="video-loading-screen">
                <div className="pixtube-loading-spinner"></div>
                <p>読み込み中...</p>
              </div>
            )}
            {!loading && (
              <div className="pix-content">
                <>
                  {/* 🎥 注目の動画 (Featured) */}
                  {heroVideo && (
                    <section className="long-video-section">
                      <h2 className="section-title">注目の動画</h2>
                      <div
                        className="carousel-slide cursor-pointer"
                        onClick={() => {
                          logInteraction('video', heroVideo.id, heroVideo.title);
                          navigate(`/video/${heroVideo.id}`);
                        }} // 🎯 クリックで遷移
                      >
                        <img
                          src={heroVideo.thumb}
                          alt={heroVideo.title}
                          className="carousel-image"
                        />
                        {renderBadge(heroVideo)}
                        <div className="carousel-overlay">
                          <p className="carousel-meta">
                            <Film size={14} className="icon" />
                            {heroVideo.duration} | {heroVideo.user}
                          </p>
                          <h3 className="carousel-title">{heroVideo.title}</h3>
                        </div>
                        <PlayCircle className="play-icon" size={50} />
                      </div>
                    </section>
                  )}

                  {/* 🎬 その他の動画 (以前のショート動画セクション) */}
                  <section className="short-video-section">
                    <h2 className="section-title">その他の動画</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {otherVideos.map((video) => (
                        <div
                          key={video.id}
                          className="cursor-pointer"
                        >
                          <VideoThumbnailCard
                            video={video}
                            onClick={() => {
                              logInteraction('video', video.id, video.title);
                              setTransitionLoading(true);
                              navigate(`/video/${video.id}`);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              </div>
            )}
            {transitionLoading && (
              <div className="video-transition-overlay">
                <div className="pixtube-loading-spinner"></div>
              </div>
            )}
          </div>
        </div>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};


export default PixTubeHome;
