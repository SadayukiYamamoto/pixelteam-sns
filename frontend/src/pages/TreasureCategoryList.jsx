import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import styles from "./TreasureCategoryList.module.css";
import { logInteraction } from "../utils/analytics";

export default function TreasureCategoryList() {
  const { category } = useParams();
  const location = useLocation();
  const parentCategory = location.state?.parentCategory;
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const fetchTitles = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/treasure_posts/titles/?parent_category=${parentCategory}`
        );
        const data = await res.json();
        const filtered = data.filter(
          (p) =>
            (p.category || "").trim() === category &&
            (p.parent_category || "") === parentCategory
        );
        setTitles(filtered);
      } catch (err) {
        console.error("タイトル取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };
    if (parentCategory) fetchTitles();
  }, [category, parentCategory]);

  // Googleカラー順
  const colorClasses = [
    styles.blueBorder,
    styles.redBorder,
    styles.yellowBorder,
    styles.greenBorder,
  ];

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header title={category} />

        <div
          className="overflow-y-auto pb-32"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <main className={styles.container}>
            <h2 className={styles.title}>{category} の投稿タイトル一覧</h2>

            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>読み込み中...</p>
              </div>
            ) : titles.length === 0 ? (
              <p className={styles.emptyText}>まだ投稿がありません。</p>
            ) : (
              <ul className={styles.ulReset}>
                {titles.map((post, index) => (
                  <li
                    key={post.id}
                    className={`${styles.postCard} ${colorClasses[index % colorClasses.length]
                      }`}
                    onClick={() => {
                      logInteraction('knowhow', post.id, post.title || "（無題）");
                      navigate(
                        `/treasure/${encodeURIComponent(category)}/${post.id}`,
                        { state: { parentCategory, category } }
                      )
                    }}
                  >
                    <h3 className={styles.postTitle}>{post.title || "（無題）"}</h3>
                    <p className={styles.metaInfo}>
                      投稿日: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
        <Navigation activeTab="knowledge" />
      </div>
    </div>
  );
}
