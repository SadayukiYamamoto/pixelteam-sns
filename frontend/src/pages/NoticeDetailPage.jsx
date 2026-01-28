import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { logInteraction } from "../utils/analytics";
import "./NoticeDetailPage.css";

const NoticeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("home"); // または適切なタブ

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                // publicなのでToken不要だが、閲覧制限があるならTokenありで取得
                // ここでは公開のお知らせと仮定して取得（Tokenあっても問題ない）
                const res = await axiosClient.get(`/notices/${id}/`);
                setNotice(res.data);

                // 🔥 ミッション進捗更新（事務局だよりを確認する）
                logInteraction('notice', id, res.data.title);
            } catch (error) {
                console.error("記事取得エラー", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotice();
    }, [id]);

    const renderLinkCards = (html) => {
        if (!html) return "";

        // パターン1：<a href="URL">…</a>
        const anchorTagRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>[\s\S]*?<\/a>/g;

        html = html.replace(anchorTagRegex, (match, url) => {
            return `
            <div class="x-card">
              <a class="x-card-link" href="${url}" target="_blank">
                <div class="x-card-content">
                  <div class="x-card-title">${url}</div>
                  <div class="x-card-desc">リンクを開く</div>
                </div>
              </a>
            </div>
          `;
        });

        // パターン2：生URL
        const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
        // 既にHTMLタグ内にあるURLは除外したいが、簡易的な置換として
        // 一度anchorタグ置換済みのHTMLに対して行うと二重置換のリスクがあるため
        // 本来はDOMパース推奨だが、今回は簡易実装で進める

        return html;
    };

    if (loading) return <div className="p-4">読み込み中...</div>;
    if (!notice) return <div className="p-4">記事が見つかりませんでした</div>;

    return (
        <div className="home-container">
            <div className="home-wrapper">
                <Header />
                <div
                    className="overflow-y-auto pb-32"
                    style={{
                        height: "calc(100vh - 120px)",
                        background: "white",
                        paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))'
                    }}
                >
                    <div className="notice-detail-container" style={{ paddingBottom: "100px" }}>

                        {/*戻るボタン*/}
                        <div style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
                            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer" }}>
                                ← 戻る
                            </button>
                        </div>

                        <div style={{ padding: "20px" }}>
                            {/* カテゴリ */}
                            <span className={`notice-label ${notice.category}`}>
                                {notice.category}
                            </span>

                            {/* タイトル */}
                            <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: "12px 0 8px", color: notice.text_color }}>
                                {notice.title}
                            </h1>

                            {/* 日付 */}
                            {notice.created_at && (
                                <p style={{ fontSize: "12px", color: "#888", marginBottom: "20px" }}>
                                    {notice.created_at.slice(0, 10)}
                                </p>
                            )}

                            {/* Header 画像 */}
                            {notice.image_url && notice.image_position === "header" && (
                                <img src={notice.image_url} alt="" style={{ width: "100%", borderRadius: "8px", marginBottom: "20px" }} />
                            )}

                            {/* TOP 画像 */}
                            {notice.image_url && notice.image_position === "top" && (
                                <img src={notice.image_url} alt="" style={{ width: "100%", borderRadius: "8px", marginBottom: "20px" }} />
                            )}

                            {/* 本文 HTML */}
                            <div
                                className="notice-body-content"
                                style={{ color: notice.text_color }}
                                dangerouslySetInnerHTML={{ __html: renderLinkCards(notice.body) }}
                            />

                            {/* Bottom 画像 */}
                            {notice.image_url && notice.image_position === "bottom" && (
                                <img src={notice.image_url} alt="" style={{ width: "100%", borderRadius: "8px", marginTop: "20px" }} />
                            )}
                        </div>
                    </div>
                </div>
                <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
    );
};

export default NoticeDetailPage;
