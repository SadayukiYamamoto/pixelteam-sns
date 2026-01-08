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
  // ... (keep existing lines until return)


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
    fetchPost();
  }, [postId]);

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

        // Pixel 構造の場合（親カテゴリがある場合）
        if (parentCategory) {
          navigate("/treasure-categories", {
            state: { parentCategory },
          });
          return;
        }

        // 旧Treasure用（親カテゴリなしのとき）
        navigate(`/treasure/${encodeURIComponent(category)}`);
        return;
      }

      // エラー処理
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
      console.error("いいねエラー:", err);
    }
  };


  if (!post) return <div className={styles.emptyText}>投稿が見つかりません。</div>;

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header />

        <div
          className="overflow-y-auto pb-32"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <main className={styles.postContainer}>
            <div className={styles.card}>
              <div className={styles.headerRow}>
                <h2 className={styles.title}>{post.title || "（無題）"}</h2>

                {/* 投稿者本人のみ編集・削除メニュー表示 */}
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

              {/* ユーザー情報 */}
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

              {/* コンテンツエリア (Rich Text) */}
              <div
                className={styles.contentArea}
                dangerouslySetInnerHTML={{
                  __html: processHtmlContent(post.content),
                }}
              />

              {/* 複数画像対応 - コンテンツとは別に表示する場合（Tiptapに入っていない画像用） */}
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

              {/* インタラクションバー */}
              <div className={styles.interactionBar}>
                <button
                  className={`${styles.actionBtn} ${post.liked ? styles.liked : ""
                    }`}
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

        {/* 🔍 画像プレビュー */}
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

              {/* ← 左矢印 */}
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

              {/* → 右矢印 */}
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

              {/* ✕ 閉じるボタン */}
              <button
                className={styles.closeButton}
                onClick={() => setIsPreviewOpen(false)}
              >
                ✕
              </button>

              {/* ページ表示（例：2 / 4） */}
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
              // コメント数リフレッシュ（オプション：再取得するか、手動で+1するか）
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
