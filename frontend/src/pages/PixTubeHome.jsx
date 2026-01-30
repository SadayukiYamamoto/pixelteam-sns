import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import VideoThumbnailCard from '../components/VideoThumbnailCard';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import { logInteraction } from '../utils/analytics';
import { PlayCircle, ChevronLeft, ChevronRight, Film, Medal } from 'lucide-react';
import { getFullUrl } from '../utils/contentHelper';
import './PixTubeHome.css';
import '../components/VideoThumbnailCard.css'; // Badge styles

import PullToRefresh from '../components/PullToRefresh';

const VIDEO_CATEGORIES = [
  {
    name: '全て',
    subcategories: []
  },
  {
    name: 'Pixel 知識',
    subcategories: ['応用知識', '基礎知識']
  },
  {
    name: '接客 知識',
    subcategories: ['上級編', '中級編', '初級編']
  },
  {
    name: 'ポートフォリオ',
    subcategories: ['応用知識', '基礎知識']
  },
  {
    name: 'コミュニケーション技術',
    subcategories: ['上級編', '中級編', '初級編']
  }
];

const PixTubeHome = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [selectedCategory, setSelectedCategory] = useState('全て');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [transitionLoading, setTransitionLoading] = useState(false);


  const navigate = useNavigate();

  const fetchVideos = async () => {
    try {
      const response = await axiosClient.get('videos/');
      const rawData = Array.isArray(response.data) ? response.data :
        (response.data && Array.isArray(response.data.results) ? response.data.results : []);

      const sorted = [...rawData].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setVideos(sorted);
      setFilteredVideos(sorted);
    } catch (error) {
      console.error('動画取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    let filtered = [...videos];
    if (selectedCategory !== '全て') {
      filtered = filtered.filter(v => {
        // New structure check
        if (v.parent_category === selectedCategory) {
          if (!selectedSubcategory) return true;
          return v.category === selectedSubcategory;
        }

        // Legacy compatibility check (e.g., category is "Pixel 基礎知識")
        if (!v.parent_category && v.category) {
          if (v.category.includes(selectedCategory)) {
            if (!selectedSubcategory) return true;
            return v.category.includes(selectedSubcategory);
          }
        }
        return false;
      });
    }
    setFilteredVideos(filtered);
  }, [selectedCategory, selectedSubcategory, videos]);

  const handleRefresh = async () => {
    await fetchVideos();
  };

  // ✅ 注目の動画（is_featured=true のものがあればそれ、なければ最新）
  const featuredVideo = filteredVideos.find(v => v.is_featured);
  const heroVideo = featuredVideo || filteredVideos[0]; // なければ最新を代替

  // heroVideo が決まったら、それ以外の動画をリストにする
  const otherVideos = filteredVideos.filter(v => v.id !== (heroVideo?.id));

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
        <Header />
        <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
          <div className="pix-content pb-[100px]" style={{ paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))' }}>
            {loading ? (
              <div className="video-loading-screen">
                <div className="pixtube-loading-spinner"></div>
                <p>読み込み中...</p>
              </div>
            ) : (
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
                        src={getFullUrl(heroVideo.thumb)}
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

                {/* 🏷 カテゴリー選択 */}
                <div className="category-section">
                  <div className="category-scroll-container">
                    {VIDEO_CATEGORIES.map((cat) => (
                      <button
                        key={cat.name}
                        className={`category-button ${selectedCategory === cat.name ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setSelectedSubcategory(null);
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {selectedCategory !== '全て' && (
                    <div className="subcategory-scroll-container">
                      <button
                        className={`subcategory-button ${selectedSubcategory === null ? 'active' : ''}`}
                        onClick={() => setSelectedSubcategory(null)}
                      >
                        全て
                      </button>
                      {VIDEO_CATEGORIES.find(c => c.name === selectedCategory)?.subcategories.map(sub => (
                        <button
                          key={sub}
                          className={`subcategory-button ${selectedSubcategory === sub ? 'active' : ''}`}
                          onClick={() => setSelectedSubcategory(sub)}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

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
            )}
            {transitionLoading && (
              <div className="video-transition-overlay">
                <div className="pixtube-loading-spinner"></div>
              </div>
            )}
          </div>
        </PullToRefresh>

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};


export default PixTubeHome;
