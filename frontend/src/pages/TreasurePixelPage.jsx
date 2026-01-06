import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import styles from "./TreasurePixelPage.module.css";

export default function TreasurePixelPage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-wrapper">
        <Header title="Pixel 広場" />

        <div
          className="overflow-y-auto pb-32"
          style={{ height: "calc(100vh - 120px)" }}
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
          </main>
        </div>

        <Navigation activeTab="knowledge" />
      </div>
    </div>
  );
}
