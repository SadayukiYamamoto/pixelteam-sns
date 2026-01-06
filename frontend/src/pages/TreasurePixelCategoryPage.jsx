import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import styles from "./TreasurePixelCategoryPage.module.css";
import TreasureFAB from "../components/TreasureFAB";

export default function TreasurePixelCategoryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const parentCategory = location.state?.parentCategory;

  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || "";

  // 下層の通常カテゴリ（これは今までの TreasurePage と同じ）
  const categories = [
    "iOS-Switch",
    "Design-talk",
    "Portfolio",
    "Google-AI",
    "Gemini",
    "Google-Pixel",
  ];

  useEffect(() => {
    if (!parentCategory) return;

    const fetchCounts = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/treasure_posts/category_counts/?parent_category=${parentCategory}`
        );
        const data = await res.json();
        setCounts(data);
      } catch (err) {
        console.error("件数取得エラー:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [parentCategory]);

  if (!parentCategory) return <div>親カテゴリが指定されていません。</div>;

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header title={`${parentCategory} カテゴリ`} />

        <div
          className="overflow-y-auto pb-32"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <main className={styles.container}>
            <h2 className={styles.title}>{parentCategory} のカテゴリー一覧</h2>

            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>読み込み中...</p>
              </div>
            ) : (
              <div className={styles.cardList}>
                {categories.map((cat) => (
                  <div
                    key={cat}
                    onClick={() =>
                      navigate(`/treasure/${encodeURIComponent(cat)}`, {
                        state: { parentCategory, category: cat },
                      })
                    }
                    className={styles.card}
                  >
                    <div className={styles.cardLeft}>
                      <img
                        src={`/icons/${cat}.png`}
                        alt={cat}
                        className={styles.icon}
                      />
                      <span className={styles.label}>{cat}</span>
                    </div>
                    <span className={styles.count}>
                      ノウハウ {counts[cat] || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
        <TreasureFAB />
        <Navigation activeTab="knowledge" />
      </div>
    </div>
  );
}
