import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import axiosClient from "../api/axiosClient";
import styles from "./TreasurePostListPage.module.css";
import { FiChevronRight, FiClock } from "react-icons/fi";

export default function TreasurePostListPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/treasure_posts/");

            // ページネーション対応 (res.data.results または res.data が配列の場合)
            const data = res.data.results || res.data;

            if (Array.isArray(data)) {
                const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setPosts(sorted);
            } else {
                setPosts([]);
            }
        } catch (err) {
            console.error("ノウハウ一覧取得エラー:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostClick = (post) => {
        navigate(`/treasure/${post.category}/${post.id}`, {
            state: { parentCategory: post.parent_category }
        });
    };

    return (
        <div className="home-container">
            <div className="home-wrapper">
                <Header title="ノウハウ一覧" />

                <div
                    className="overflow-y-auto pb-32 pt-20"
                    style={{ height: "calc(100vh - 120px)" }}
                >
                    <main className={styles.listContainer}>
                        <div className={styles.listHeader}>
                            <h1 className={styles.title}>最新のノウハウ</h1>
                            <p className={styles.subtitle}>Knowledge Archive</p>
                        </div>

                        {loading ? (
                            <div className={styles.loading}>
                                <div className={styles.spinner}></div>
                                <p>読み込み中...</p>
                            </div>
                        ) : posts.length > 0 ? (
                            <div className={styles.postList}>
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className={styles.postItem}
                                        onClick={() => handlePostClick(post)}
                                    >
                                        {/* 既読判定バッジ */}
                                        {post.is_read && (
                                            <div className={styles.readBadge}>
                                                <span className={styles.readText}>既読</span>
                                            </div>
                                        )}

                                        <div className={styles.postInfo}>
                                            <div className={styles.dateRow}>
                                                <span className={styles.postDate}>
                                                    <FiClock className={styles.dateIcon} />
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </span>
                                                {post.category && (
                                                    <span className={styles.categoryTag}>{post.category}</span>
                                                )}
                                            </div>
                                            <h3 className={styles.postTitle}>{post.title || "（無題）"}</h3>
                                        </div>
                                        <FiChevronRight className={styles.arrowIcon} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.empty}>
                                <p>投稿がありません。</p>
                            </div>
                        )}
                    </main>
                </div>

                <Navigation activeTab="knowledge" />
            </div>
        </div>
    );
}
