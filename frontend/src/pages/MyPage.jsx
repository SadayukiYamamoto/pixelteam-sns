import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import "./Mypage.css";
import { useNavigate, useParams } from "react-router-dom";
import { FaHeart, FaRegCommentDots, FaUserCircle, FaListAlt, FaMedal, FaComments, FaTrophy } from "react-icons/fa";
import { FiAward } from "react-icons/fi";
import { Edit, Logout } from "@mui/icons-material";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import PointCard from "../components/PointCard";
import LoginPopupManager from "../components/LoginPopupManager";
import PostItem from "../components/PostItem"; // Assuming PostItem is used for list
import Avatar from "../components/Avatar";
// Ensure PostItem handles styling internally or wrap it

const ADMIN_UID = "Xx7gnfTCPQMXlNS5ceM4uUltoD03"; // 管理者ID

import PullToRefresh from "../components/PullToRefresh";

const MyPage = () => {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [badges, setBadges] = useState([]);
  const [points, setPoints] = useState(0);
  const [activeTab, setActiveTab] = useState("chat"); // Default to chat
  const [loading, setLoading] = useState(true);

  // ログイン中の自分のID
  const myUserId = localStorage.getItem("userId");
  const isOwnProfile = !urlUserId || (myUserId && urlUserId.toLowerCase() === myUserId.toLowerCase());

  const fetchMyPage = async () => {
    try {
      const fetchId = urlUserId || myUserId;
      const apiPath = isOwnProfile
        ? `mypage/${fetchId}/`
        : `profile/${fetchId}/`;

      const res = await axiosClient.get(apiPath);
      const data = res.data;
      setProfile(data);
      setPosts(data.posts || []);
      setBadges(data.badges || []);
      setPoints(data.points || 0);
    } catch (err) {
      console.error("MyPage API エラー:", err);
      if (err.response?.status === 401) {
        alert("ログインの有効期限が切れました。もう一度ログインしてください。");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!storedUserId || !token) {
      alert("ログインが必要です。");
      navigate("/login");
      return;
    }

    fetchMyPage();
  }, [navigate, urlUserId, myUserId, isOwnProfile]);

  const handleRefresh = async () => {
    await fetchMyPage();
  };

  const handleLogout = () => {
    if (window.confirm("ログアウトしますか？")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  if (loading) return <div className="loading-text">読み込み中...</div>;
  if (!profile) return <p>ユーザー情報が見つかりません。</p>;

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />

        <PullToRefresh onRefresh={handleRefresh}>
          <div className="mypage-content pb-[100px]">
            {/* プロフィール (Reverted Style) */}
            <div className="mypage-profile-section">
              <Avatar
                src={profile.profile_image}
                name={profile.display_name}
                size="w-24 h-24"
                className="mypage-profile-icon"
              />
              <h2 className="mypage-name">{profile.display_name}</h2>
              <p className="mypage-id">@{profile.user_id}</p>
              <p className="mypage-team">
                所属：{profile.team === "shop" ? "Pixel-Shop"
                  : profile.team === "event" ? "Pixel-Event"
                    : profile.team === "training" ? "Pixel-Training"
                      : "未設定"}
              </p>
              {profile.introduction && (
                <p className="mt-3 text-sm text-gray-600 px-6 whitespace-pre-wrap leading-relaxed max-w-md mx-auto">
                  {profile.introduction}
                </p>
              )}
              {profile.team === "shop" && profile.shop_name && (
                <p className="mypage-shop">
                  店舗：{profile.shop_name}
                </p>
              )}

              {isOwnProfile && (
                <div className="mypage-btn-group" style={{ padding: "0 10px", marginTop: "16px" }}>
                  <button
                    className="mypage-btn mypage-edit-button"
                    onClick={() => navigate(`/profile-edit/${profile.user_id}`)}
                  >
                    <Edit style={{ fontSize: "14px", marginRight: "4px" }} />
                    マイページの編集
                  </button>

                  <button
                    className="mypage-btn mypage-mission-button"
                    onClick={() => navigate("/missions")}
                  >
                    <FaMedal style={{ fontSize: "14px", marginRight: "6px" }} />
                    ミッション
                  </button>

                  <button className="mypage-btn mypage-logout-button" onClick={handleLogout}>
                    <Logout style={{ fontSize: "14px", marginRight: "4px" }} />
                    ログアウト
                  </button>
                </div>
              )}

              {/* Level UI (Reverted) */}
              {/* Level UI (Visible only to own profile) */}
              {isOwnProfile && (
                <div className="level-box" style={{ marginTop: "16px" }}>
                  <div className="level-header">
                    <span className="level-number">Lv. {profile.level || 0}</span>
                  </div>
                  <div className="exp-bar">
                    <div
                      className="exp-bar-fill"
                      style={{
                        width: `${Math.min(
                          ((profile.exp % 100) / 100) * 100,
                          100
                        )}%`,
                        backgroundColor: "#22c55e"
                      }}
                    />
                  </div>
                  <p className="exp-text">
                    {profile.exp % 100} / 100 EXP (Total: {profile.exp})
                  </p>
                </div>
              )}
            </div>


            {/* Tabs */}
            <div className="flex bg-white rounded-xl shadow-sm mb-6 overflow-hidden divide-x divide-gray-100">
              {["chat", "reports", "points", "badges"]
                .filter(tab => {
                  if (tab === 'points') {
                    // ポイントは「自分自身」かつ「イベントチーム以外」の場合のみ表示
                    if (!isOwnProfile) return false;
                    if (profile.team === 'event') return false;
                  }
                  return true;
                })
                .map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-sm font-bold transition-colors border-none outline-none focus:outline-none ${activeTab === tab
                      ? "bg-lime-50 text-lime-600"
                      : "text-gray-400 hover:bg-gray-50 bg-white"
                      }`}
                  >
                    {tab === "chat" && "雑談"}
                    {tab === "reports" && "個人報告"}
                    {tab === "points" && "ポイント"}
                    {tab === "badges" && "バッジ"}
                  </button>
                ))}
            </div>

            {/* === タブ内容 === */}
            <div className="mypage-tab-content">

              {/* 1. 雑談 Tab (Chat) */}
              {activeTab === "chat" && (
                <div>
                  {posts.filter(p => p.category === '雑談' || !p.category || (p.category !== '個人報告' && p.category !== 'individual_report')).length > 0 ? (
                    posts
                      .filter(p => p.category === '雑談' || !p.category || (p.category !== '個人報告' && p.category !== 'individual_report'))
                      .map((post) => (
                        <PostItem
                          key={post.id}
                          post={{
                            ...post,
                            profileImage: profile.profile_image,
                            user: profile.display_name,
                            time: new Date(post.created_at).toLocaleDateString(),
                            likes: post.likes_count || 0,
                            comments: post.comments_count || 0,
                            image: post.image_url || post.image
                          }}
                          hideReactions={true}
                        />
                      ))
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      雑談投稿はありません
                    </div>
                  )}
                </div>
              )}

              {/* 2. 個人報告 Tab (Reports) */}
              {activeTab === "reports" && (
                <div>
                  {posts.filter(p => p.category === '個人報告' || p.category === 'individual_report').length > 0 ? (
                    posts
                      .filter(p => p.category === '個人報告' || p.category === 'individual_report')
                      .map((post) => (
                        <PostItem
                          key={post.id}
                          post={{
                            ...post,
                            profileImage: profile.profile_image,
                            user: profile.display_name,
                            time: new Date(post.created_at).toLocaleDateString(),
                            likes: post.likes_count || 0,
                            comments: post.comments_count || 0,
                            image: post.image_url || post.image
                          }}
                          hideReactions={true}
                        />
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <FaListAlt size={48} className="text-gray-200 mb-4" />
                      <p className="text-gray-400 mb-2">個人報告の投稿はありません</p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Points Tab */}
              {activeTab === "points" && (
                <div className="py-6">
                  <PointCard points={points} />
                </div>
              )}

              {/* 4. Badges Tab */}
              {activeTab === "badges" && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-yellow-100 rounded-full mb-2 border-[1.5px] border-yellow-800/40">
                      <FiAward size={40} strokeWidth={2.5} style={{ color: '#422006' }} />
                    </div>
                    <h3 className="font-bold text-gray-700">獲得バッジコレクション</h3>
                  </div>

                  {badges.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {badges.map((badge) => (
                        <div key={badge.id} className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2 border border-gray-100 shadow-sm overflow-hidden">
                            <img src={badge.image_url} alt={badge.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs font-bold text-gray-600 text-center leading-tight">
                            {badge.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      まだバッジを獲得していません
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </PullToRefresh>

        <Navigation activeTab="mypage" />
        <LoginPopupManager />
      </div>
    </div >
  );
};

export default MyPage;
