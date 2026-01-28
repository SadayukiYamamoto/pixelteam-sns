import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { FiChevronRight, FiBook } from "react-icons/fi";
import styles from "./TreasurePixelPage.module.css";
import TreasureFAB from "../components/TreasureFAB";

export default function TreasurePixelPage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header title="Pixel 広場" />

        <div
          className="overflow-y-auto pb-32"
          style={{ height: "calc(100vh - 120px)", paddingTop: "calc(112px + env(safe-area-inset-top, 0px))" }}
        >
          <main className={styles.pixelPageContainer}>
            {/* Pixel グリーンの大きなバナー */}
            <div className={styles.hero}>
              <div className={styles.heroContent}>
                <h1 className={styles.heroTitle}>ノウハウ広場</h1>
                <p className={styles.heroSubtitle}>Gateway to Knowledge</p>
              </div>
              <div className={styles.heroSparkle}></div>
            </div>

            {/* 下部カードグリッド */}
            <div className={styles.gridContainer}>
              {/* Pixel Shop */}
              <div
                className={styles.card}
                onClick={() =>
                  navigate("/treasure-categories", {
                    state: { parentCategory: "Pixel-Shop" },
                  })
                }
              >
                <div className={styles.cardIcon}>
                  <img src="/icons/Pixel-Shop.png" alt="Pixel Shop" />
                </div>
                <h3 className={styles.cardTitle}>Shop チーム</h3>
                <p className={styles.cardSubtitle}>ノウハウ宝物庫</p>
              </div>

              {/* Pixel Event */}
              <div
                className={styles.card}
                onClick={() =>
                  navigate("/treasure-categories", {
                    state: { parentCategory: "Pixel-Event" },
                  })
                }
              >
                <div className={styles.cardIcon}>
                  <img src="/icons/Pixel-Event.png" alt="Pixel Event" />
                </div>
                <h3 className={styles.cardTitle}>Event チーム</h3>
                <p className={styles.cardSubtitle}>ノウハウ宝物庫</p>
              </div>
            </div>

            {/* ノウハウ一覧への導線 */}
            <div className={styles.listSection}>
              <div
                className={styles.listButton}
                onClick={() => navigate("/treasure-list")}
              >
                <div className={styles.listButtonContent}>
                  <div className={styles.listIconWrapper}>
                    <FiBook className={styles.listIcon} size={32} color="#10b981" />
                  </div>
                  <div className={styles.listText}>
                    <span className={styles.listTitle}>ノウハウ一覧</span>
                    <span className={styles.listDesc}>すべての投稿を時系列で見る</span>
                  </div>
                </div>
                <div className={styles.listArrow}>
                  <FiChevronRight size={24} />
                </div>
              </div>
            </div>
          </main>
        </div>

        <TreasureFAB />
        <Navigation activeTab="knowledge" />
      </div>
    </div>
  );
}
