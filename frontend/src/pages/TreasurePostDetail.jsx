import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaHeart, FaRegCommentDots, FaTimes, FaEllipsisV } from "react-icons/fa";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import TreasureCommentBottomSheet from "../components/TreasureCommentBottomSheet";
import Avatar from "../components/Avatar";
import styles from "./TreasurePostDetail.module.css";

import { processHtmlContent } from '../utils/contentHelper'; // Import helper

export default function TreasurePostDetail() {
  const { category, postId } = useParams();
  const location = useLocation();
  const parentCategory = location.state?.parentCategory;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "";
  const [previewIndex, setPreviewIndex] = useState(0);
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const [showMenu, setShowMenu] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/api/treasure_posts/${postId}/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error("投稿詳細エラー:", err);
      } finally {
        setLoading(false);
      }
    };

    const markAsRead = async () => {
      try {
        await fetch(`${API_URL}/api/treasure_posts/${postId}/read/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
      } catch (err) {
        console.error("既読処理エラー:", err);
      }
    };

    fetchPost();
    markAsRead();
  }, [postId, API_URL]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>読み込み中...</p>
      </div>
    );
  }

  // 🗑 投稿削除処理
  const handleDelete = async () => {
    if (!window.confirm("本当にこの投稿を削除しますか？")) return;

    try {
      const res = await fetch(`${API_URL}/api/treasure_posts/${postId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_uid: user?.userId || null,
        }),
      });

      if (res.ok) {
        alert("投稿を削除しました。");

        if (parentCategory) {
          navigate("/treasure-categories", {
            state: { parentCategory },
          });
          return;
        }

        navigate(`/treasure/${encodeURIComponent(category)}`);
        return;
      }

      let errorText = "不明なエラー";
      try {
        const data = await res.json();
        errorText = data.error || errorText;
      } catch (e) { }
      alert(`削除に失敗しました: ${errorText}`);
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除中にエラーが発生しました。");
    }
  };

  // ✏️ 編集ページへ遷移
  const handleEdit = () => {
    navigate(`/treasure/edit/${postId}`);
  };

  // 💚 いいね処理
  const handleLike = async () => {
    try {
      const res = await fetch(`${API_URL}/api/treasure_posts/${postId}/like/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setPost({ ...post, liked: data.liked, likes_count: data.likes_count });
    } catch (err) {
      console.error("いいえエラー:", err);
    }
  };

  if (!post) return <div className={styles.emptyText}>投稿が見つかりません。</div>;

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />

        <div
          className="overflow-y-auto pb-32 pt-20"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <main className={styles.postContainer}>
            <div className={styles.card}>
              <div className={styles.headerRow}>
                <h2 className={styles.title}>{post.title || "（無題）"}</h2>

                {user && (post.user_uid === user.userId) && (
                  <div className={styles.menuWrapper}>
                    <FaEllipsisV
                      className={styles.menuIcon}
                      onClick={() => setShowMenu(!showMenu)}
                    />
                    {showMenu && (
                      <div className={styles.menuDropdown}>
                        <button onClick={handleEdit}>編集</button>
                        <button className={styles.deleteBtn} onClick={handleDelete}>削除</button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.userInfo}>
                <Avatar
                  src={post.profile_image}
                  name={post.display_name}
                  size="w-10 h-10"
                  className={styles.userAvatar}
                />
                <div className={styles.userMeta}>
                  <span className={styles.displayName}>
                    {post.display_name || "名無し"}
                  </span>
                  <span className={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {(post.age || post.gender || post.device_used || post.anxiety_needs || post.appeal_points) && (
                <div className={styles.targetInfoSection}>
                  <span className={styles.sectionLabel}>ターゲット情報 & ニーズ</span>

                  {(post.age || post.gender || post.device_used) && (
                    <div className={styles.targetPills}>
                      {post.age && (
                        <div className={styles.targetPill}>
                          <span className={styles.pillLabel}>年齢</span>
                          {post.age}
                        </div>
                      )}
                      {post.gender && (
                        <div className={styles.targetPill}>
                          <span className={styles.pillLabel}>性別</span>
                          {post.gender}
                        </div>
                      )}
                      {post.device_used && (
                        <div className={styles.targetPill}>
                          <span className={styles.pillLabel}>端末</span>
                          {post.device_used}
                        </div>
                      )}
                    </div>
                  )}

                  {(post.anxiety_needs || post.appeal_points) && (
                    <div className={styles.targetGrid}>
                      {post.anxiety_needs && (
                        <div className={styles.targetBox}>
                          <span className={styles.boxLabel}>不安要素 & ニーズ</span>
                          <div className={styles.boxText}>{post.anxiety_needs}</div>
                        </div>
                      )}
                      {post.appeal_points && (
                        <div className={styles.targetBox}>
                          <span className={styles.boxLabel}>訴求ポイント</span>
                          <div className={styles.boxText}>{post.appeal_points}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.contentArea}>
                <span className={styles.contentLabel}>トークの流れ</span>
                <div
                  dangerouslySetInnerHTML={{
                    __html: processHtmlContent(post.content),
                  }}
                />
              </div>

              {post.image_urls && post.image_urls.length > 0 && (
                <div className={styles.imageGrid}>
                  {post.image_urls.map((url, index) => (
                    <div
                      key={index}
                      className={styles.imageWrapper}
                      onClick={() => {
                        setIsPreviewOpen(true);
                        setPreviewIndex(index);
                      }}
                    >
                      <img
                        src={url}
                        alt={`投稿画像${index + 1}`}
                        className={styles.image}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.interactionBar}>
                <button
                  className={`${styles.actionBtn} ${post.liked ? styles.liked : ""}`}
                  onClick={handleLike}
                >
                  <FaHeart />
                  <span>{post.likes_count || 0}</span>
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={() => setIsCommentOpen(true)}
                >
                  <FaRegCommentDots />
                  <span>{post.comments_count || 0}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                if (parentCategory) {
                  navigate(`/treasure-categories`, {
                    state: { parentCategory },
                  });
                } else {
                  navigate(`/treasure/${encodeURIComponent(category)}`);
                }
              }}
              className={styles.backButton}
            >
              ← カテゴリに戻る
            </button>
          </main>
        </div>

        {isPreviewOpen && (
          <div
            className={styles.previewOverlay}
            onClick={() => setIsPreviewOpen(false)}
          >
            <div
              className={styles.previewContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={post.image_urls[previewIndex]}
                alt={`プレビュー画像 ${previewIndex + 1}`}
                className={styles.previewImage}
              />

              {post.image_urls.length > 1 && (
                <button
                  className={`${styles.arrowButton} ${styles.leftArrow}`}
                  onClick={() =>
                    setPreviewIndex(
                      (previewIndex - 1 + post.image_urls.length) %
                      post.image_urls.length
                    )
                  }
                >
                  ←
                </button>
              )}

              {post.image_urls.length > 1 && (
                <button
                  className={`${styles.arrowButton} ${styles.rightArrow}`}
                  onClick={() =>
                    setPreviewIndex((previewIndex + 1) % post.image_urls.length)
                  }
                >
                  →
                </button>
              )}

              <button
                className={styles.closeButton}
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕
              </button>

              <div className={styles.counter}>
                {previewIndex + 1} / {post.image_urls.length}
              </div>
            </div>
          </div>
        )}

        {isCommentOpen && (
          <TreasureCommentBottomSheet
            postId={postId}
            onClose={() => setIsCommentOpen(false)}
            onCommentAdded={() => {
              setPost({
                ...post,
                comments_count: (post.comments_count || 0) + 1,
              });
            }}
          />
        )}

        <Navigation activeTab="knowledge" />
      </div>
    </div>
  );
}
