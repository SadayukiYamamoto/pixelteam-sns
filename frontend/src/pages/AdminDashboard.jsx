import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { FaUsers, FaMedal, FaEnvelope, FaVideo, FaThumbtack, FaListAlt, FaUpload, FaChartBar, FaStore, FaHome, FaBullhorn, FaUserCog, FaFileSignature, FaCoins } from "react-icons/fa";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("admin");
    const navigate = useNavigate();

    // カードの定義
    const adminLinks = [
        {
            title: "ホーム管理",
            description: "事務局だよりやショート動画の配置を行います。",
            path: "/admin/home",
            icon: <FaHome size={40} color="#10b981" />,
            color: "border-green-500",
        },
        {
            title: "投稿ピックアップ",
            description: "ホームに表示するおすすめの投稿を選択します。",
            path: "/admin/posts",
            icon: <FaThumbtack size={40} color="#3b82f6" />,
            color: "border-blue-500",
        },
        {
            title: "お知らせ管理",
            description: "お知らせの投稿・編集・削除を行います。",
            path: "/admin/notices",
            icon: <FaBullhorn size={40} color="#4f46e5" />,
            color: "border-indigo-500",
        },
        {
            title: "動画管理",
            description: "動画の確認や削除を行います。",
            path: "/admin/videos",
            icon: <FaVideo size={40} color="#ef4444" />,
            color: "border-red-500",
        },

        {
            title: "ユーザー管理",
            description: "ユーザー情報の編集・権限設定を行います。",
            path: "/admin/users",
            icon: <FaUserCog size={40} color="#10b981" />,
            color: "border-green-500",
        },
        {
            title: "バッジ管理",
            description: "バッジの作成・付与を行います。",
            path: "/admin/badges",
            icon: <FaMedal size={40} color="#f59e0b" />,
            color: "border-yellow-500",
        },
        {
            title: "視聴分析 (Matrix)",
            description: "ユーザーごとの動画視聴状況を分析します。",
            path: "/analytics/matrix",
            icon: <FaChartBar size={40} color="#8b5cf6" />,
            color: "border-purple-500",
        },
        {
            title: "動画視聴データ", // 追加
            description: "誰がどの動画をいつ見たか詳細を確認します。",
            path: "/admin/analytics/videos/watch-logs",
            icon: <FaListAlt size={40} color="#f97316" />,
            color: "border-orange-500",
        },
        {
            title: "テスト管理",
            description: "動画に紐づくテストを確認・編集・作成します。",
            path: "/admin/tests",
            icon: <FaFileSignature size={40} color="#ec4899" />,
            color: "border-pink-500",
        },
        {
            title: "投稿管理一覧",
            description: "すべての投稿を一覧で確認・編集・削除します。",
            path: "/admin/posts/manage",
            icon: <FaListAlt size={40} color="#6366f1" />,
            color: "border-indigo-500",
        },
        {
            title: "動画アップロード",
            description: "新しい動画をアップロードします。",
            path: "/video/upload",
            icon: <FaUpload size={40} color="#ef4444" />,
            color: "border-red-500",
        },
        {
            title: "ユーザー統計",
            description: "投稿数、動画視聴、テスト結果などの統計を確認します。",
            path: "/admin/analytics/users",
            icon: <FaChartBar size={40} color="#10b981" />,
            color: "border-green-500",
        },
        {
            title: "店舗管理",
            description: "店舗ごとの週報・ノウハウ提出状況を確認します。",
            path: "/admin/analytics/shops",
            icon: <FaStore size={40} color="#8b5cf6" />,
            color: "border-purple-500",
        },
        {
            title: "ポイント管理",
            description: "ユーザーのポイント増減を行います。",
            path: "/admin/points",
            icon: <FaCoins size={40} color="#fbbf24" />,
            color: "border-yellow-500",
        },
        {
            title: "業務管理",
            description: "業務ボタンの追加・編集・並び替えを行います。",
            path: "/admin/tasks",
            icon: <FaStore size={40} color="#059669" />,
            color: "border-green-600",
        },
        {
            title: "ボタン操作分析",
            description: "誰がどのボタン（投稿・動画・業務等）をタップしたか分析します。",
            path: "/admin/analytics/interactions",
            icon: <FaChartBar size={40} color="#10b981" />,
            color: "border-green-500",
        },
        {
            title: "ログインPOPUP管理",
            description: "ログイン時に表示するポップアップ（オシャレなお知らせ）を設定・有効化します。",
            path: "/admin/login-popup",
            icon: <FaBullhorn size={40} color="#f97316" />,
            color: "border-orange-500",
        },
        {
            title: "EXP管理",
            description: "ユーザーの経験値(EXP)の直接編集・レベル確認を行います。",
            path: "/admin/exp",
            icon: <FaChartBar size={40} color="#10b981" />,
            color: "border-green-500",
        },
        {
            title: "レベル報酬管理",
            description: "レベル到達時に付与されるバッジの報酬設定を行います。",
            path: "/admin/level-rewards",
            icon: <FaMedal size={40} color="#ec4899" />,
            color: "border-pink-500",
        },
        {
            title: "テスト・アンケート分析",
            description: "テスト成績やアンケート満足度の詳細を動画ごとに分析します。",
            path: "/admin/videos/feedback",
            icon: <FaFileSignature size={40} color="#10b981" />,
            color: "border-green-500",
        },
    ];

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header />
                <div className="max-w-7xl mx-auto p-4 md:p-10">
                    <h1 style={styles.title}>管理画面ダッシュボード</h1>
                    <p style={styles.subtitle}>管理機能を選択してください</p>

                    <div style={styles.grid}>
                        {adminLinks.map((link, index) => (
                            <div
                                key={index}
                                style={styles.card}
                                onClick={() => navigate(link.path)}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                                }}
                            >
                                <div style={styles.iconWrapper}>{link.icon}</div>
                                <h2 style={styles.cardTitle}>{link.title}</h2>
                                <p style={styles.cardDesc}>{link.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

const styles = {
    container: {
        padding: "20px",
        paddingBottom: "100px",
        flex: 1,
        overflowY: "auto",
        fontFamily: "'Inter', sans-serif",
    },
    title: {
        fontSize: "28px",
        fontWeight: "900",
        marginBottom: "12px",
        color: "#111827",
        letterSpacing: "-0.025em",
    },
    subtitle: {
        fontSize: "15px",
        color: "#64748B",
        marginBottom: "40px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "24px",
    },
    card: {
        backgroundColor: "white",
        borderRadius: "28px",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.03)",
        border: "1px solid #F1F5F9",
        height: "100%",
    },
    iconWrapper: {
        marginBottom: "20px",
        padding: "20px",
        borderRadius: "24px",
        backgroundColor: "#F8FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    cardTitle: {
        fontSize: "17px",
        fontWeight: "800",
        color: "#111827",
        marginBottom: "10px",
    },
    cardDesc: {
        fontSize: "12px",
        color: "#64748B",
        lineHeight: "1.6",
    },
};

export default AdminDashboard;
