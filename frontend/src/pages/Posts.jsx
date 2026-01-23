import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMoreVertical } from "react-icons/fi";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { FaHeart, FaRegCommentDots } from "react-icons/fa";
import { AiFillBuild } from "react-icons/ai";
import "./Posts.css";
import axiosClient from "../api/axiosClient";
import FloatingWriteButton from "../components/FloatingWriteButton";
import CommentBottomSheet from "../components/CommentBottomSheet";
import { renderPostContent } from "../utils/textUtils";
import Avatar from "../components/Avatar";

const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const then = new Date(dateString);
  const diff = (now - then) / 1000;
  if (diff < 60) return "たった今";
  if (diff < 3600) return `${Math.floor(diff / 60)}分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}時間前`;
  return then.toLocaleDateString();
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hasNext, setHasNext] = useState(true);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(null);
  const [likeList, setLikeList] = useState([]);
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [showCommentSheet, setShowCommentSheet] = useState(null);
  const [likeListLoading, setLikeListLoading] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tag = queryParams.get("tag");
  const highlightId = queryParams.get("highlight");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const currentUserId = localStorage.getItem("userId");

  const handleEdit = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    try {
      await axiosClient.delete(`posts/${postId}/delete/`);
      alert("投稿を削除しました！");
      window.location.reload();
    } catch (error) {
      alert("削除に失敗しました。");
      console.error(error);
    }
  };

  const loadPostsFromDjango = async (offset = 0) => {
    if (loading) return;
    setLoading(true);

    try {
      const limit = 5;
      const response = await axiosClient.get(
        `posts_with_user/?offset=${offset}&limit=${limit}${tag ? `&tag=${tag}` : ''}${selectedCategory ? `&category=${selectedCategory}` : ''}`
      );

      const fetchedPosts = response.data.results.map((p) => ({
        id: p.id,
        content: p.content,
        createdAt: new Date(p.created_at),
        user_uid: p.user_uid,
        user: {
          displayName: p.display_name || "匿名",
          profileImage: p.profile_image || "/default-avatar.png",
        },
        imageUrl: p.image_url || p.image || null,
        isExpanded: false,
        likes: p.likes_count || 0,
        liked: p.liked || false,
        comments_count: p.comments_count || 0,
        category: p.category || "",
      }));

      setPosts((prev) => {
        const existingIds = new Set(prev.map(p => p.id));
        const newPosts = fetchedPosts.filter(p => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });

      setHasNext(response.data.has_next);
      setHasMore(response.data.has_next);
    } catch (err) {
      console.error("Django APIからの取得エラー:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadHighlightedPost = async () => {
    if (!highlightId) return;
    try {
      const res = await axiosClient.get(`posts/${highlightId}/`);
      const p = res.data;
      const highlightedPost = {
        id: p.id,
        content: p.content,
        createdAt: new Date(p.created_at),
        user_uid: p.user_uid || p.user?.id,
        user: {
          displayName: p.display_name || "匿名",
          profileImage: p.profile_image || "/default-avatar.png",
        },
        imageUrl: p.image_url || p.image || null,
        isExpanded: true,
        likes: p.likes_count || 0,
        liked: p.liked || false,
        comments_count: p.comments_count || 0,
        category: p.category || "",
        isHighlighted: true,
      };

      setPosts([highlightedPost]);
      loadPostsFromDjango(0);
    } catch (error) {
      console.error("ハイライト投稿の取得失敗:", error);
      loadPostsFromDjango(0);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasNext(true);
    setHasMore(true);

    if (highlightId) {
      loadHighlightedPost();
    } else {
      loadPostsFromDjango(0);
    }
  }, [tag, selectedCategory, highlightId]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosClient.get(`mypage/${currentUserId}/`);
        setUserProfile(res.data);
      } catch (err) {
        console.error("プロフィール取得失敗:", err);
      }
    };
    fetchProfile();
  }, [currentUserId]);

  const handleLike = async (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
            ...p,
            liked: !p.liked,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
            animating: true,
            animationType: p.liked ? "unlike" : "like",
          }
          : p
      )
    );

    // Animation reset timer
    setTimeout(() => {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, animating: false } : p))
      );
    }, 450);

    try {
      const res = await axiosClient.post(`posts/${postId}/like/`, {});
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
              ...p,
              likes: res.data.likes_count,
              liked: res.data.liked,
            }
            : p
        )
      );
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: !p.liked }
            : p
        )
      );
    }
  };

  const handleComment = (postId) => {
    setShowCommentSheet(postId);
  };

  const fetchLikeList = async (postId) => {
    setLikeListLoading(true);
    setShowLikeModal(true);
    try {
      const res = await axiosClient.get(`posts/${postId}/likes/`);
      setLikeList(res.data);
    } catch (error) {
      console.error("いいね一覧取得エラー:", error);
    } finally {
      setLikeListLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isExpanded: !p.isExpanded } : p))
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasNext) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 300) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNext, loading]);

  useEffect(() => {
    if (page === 0) return;
    loadPostsFromDjango(posts.length);
  }, [page]);

  return (
    <>
      <div className="home-container">
        <div className="home-wrapper">
          <Header />
          <div
            ref={scrollContainerRef}
            className="posts-content px-4 pb-[100px]"
            style={{ paddingTop: 'calc(72px + env(safe-area-inset-top, 0px))' }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ marginTop: '16px' }}>
              {tag ? `#${tag} の詳細` : "投稿一覧"}
            </h2>

            <div className="space-y-4">
              {posts.map((post, index) => (
                <div
                  key={`${post.id}-${index}`}
                  className={`post-card ${post.isHighlighted ? 'border-2 border-green-500 shadow-xl' : ''}`}
                  onClick={() => toggleExpand(post.id)}
                >
                  {String(post.user_uid) === String(currentUserId) && (
                    <div className="post-menu-container z-30">
                      <div
                        className="post-menu-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === post.id ? null : post.id);
                        }}
                      >
                        <FiMoreVertical />
                      </div>

                      {menuOpen === post.id && (
                        <div className="post-menu-dropdown z-40" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="post-menu-item"
                            onClick={() => {
                              setMenuOpen(null);
                              handleEdit(post.id);
                            }}
                          >
                            ✏️ 編集
                          </button>
                          <button
                            className="post-menu-item delete"
                            onClick={() => {
                              setMenuOpen(null);
                              handleDelete(post.id);
                            }}
                          >
                            🗑️ 削除
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className="post-user-info cursor-pointer hover:bg-gray-100 active:bg-gray-200 rounded-lg p-1.5 -ml-1 transition-all duration-200 relative z-10 inline-flex items-center w-fit max-w-[85%]"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (post.user_uid) {
                        navigate(`/mypage/${post.user_uid}`);
                      }
                    }}
                  >
                    <Avatar
                      src={post.user?.profileImage}
                      name={post.user?.displayName}
                      size="w-8 h-8"
                    />
                    <div className="ml-2">
                      <p className="font-bold text-sm leading-tight">{post.user?.displayName || "匿名"}</p>
                      <p className="text-[10px] text-gray-400">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>

                  <div className="post-content-wrapper">
                    {renderPostContent(post.content, post.isExpanded, () => toggleExpand(post.id), post.category)}
                  </div>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="投稿画像"
                      className="post-image rounded-lg mt-2 w-full object-contain max-h-[500px]"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}

                  <div className="reaction-bar flex items-center space-x-5 mt-3 text-gray-600">
                    <button
                      className="reaction-btn flex items-center space-x-1 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(post.id);
                      }}
                    >
                      <FaHeart
                        className={`heart ${post.liked ? "red" : ""} ${post.animating
                          ? post.animationType === "like"
                            ? "pop"
                            : "fade"
                          : ""
                          }`}
                      />

                      <span>
                        {post.likes || 0}
                      </span>
                    </button>
                    <button
                      className="reaction-btn flex items-center space-x-1 hover:text-blue-500 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComment(post.id);
                      }}
                    >
                      <FaRegCommentDots />
                      <span>{post.comments_count || 0}</span>
                    </button>

                    <div className="flex-1" />

                    <button
                      className="reaction-btn transition-all active:scale-95 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchLikeList(post.id);
                      }}
                      title="いいね一覧を表示"
                    >
                      <AiFillBuild size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <span className="text-gray-500 text-sm">読み込み中...</span>
                </div>
              )}
              {!hasMore && !loading && posts.length > 0 && (
                <p className="text-center text-gray-400 mt-2">すべて読み込みました</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔴 FLOATING BUTTONS - Standardized Centering Wrapper 🔴 */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-0 pointer-events-none z-[60]"
        style={{ bottom: '0px' }}
      >
        <FloatingWriteButton userTeam={userProfile?.team} isAbsolute={true} />
      </div>

      {showCommentSheet && (
        <CommentBottomSheet
          postId={showCommentSheet}
          onClose={() => setShowCommentSheet(null)}
        />
      )}

      {showLikeModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[110000] p-4"
          onClick={() => setShowLikeModal(false)}
        >
          <div
            className="bg-white rounded-[32px] w-full max-w-[340px] max-h-[70vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-2">
              <h3 className="text-lg font-black text-gray-800">いいねしたユーザー</h3>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              {likeListLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
                  <span className="text-gray-500 text-sm">読み込み中...</span>
                </div>
              ) : likeList.length > 0 ? (
                <div className="space-y-4 py-2">
                  {likeList.map((user, i) => (
                    <div
                      key={i}
                      className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded-xl transition-colors"
                      onClick={() => {
                        navigate(`/mypage/${user.user_id || user.id}`);
                        setShowLikeModal(false);
                      }}
                    >
                      < Avatar
                        src={user.profile_image}
                        name={user.display_name}
                        size="w-10 h-10"
                        className="ml-5"
                      />
                      <span className="font-bold text-gray-700 text-[15px] ml-5">{user.display_name || "匿名"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-gray-400 text-sm font-medium">まだ誰もいいねしていません。</p>
                </div>
              )}
            </div>

            <div className="p-6 pt-2">
              <button
                onClick={() => setShowLikeModal(false)}
                className="w-full py-4 bg-white text-gray-700 font-black rounded-2xl shadow-lg active:scale-[0.98] transition-all border-none text-[15px]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      <Navigation activeTab="post" />
    </>
  );
};

export default Posts;
