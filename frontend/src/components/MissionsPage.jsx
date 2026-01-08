import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoCheckmarkCircle, IoLockClosed } from "react-icons/io5";
import confetti from "canvas-confetti";
import "../pages/MissionPage.css"; // Reuse the css file

const MissionsPage = () => {
    const navigate = useNavigate();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState(null);
    const [activeTab, setActiveTab] = useState('daily');

    const fetchMissions = async () => {
        try {
            const res = await axiosClient.get(`missions/`);
            if (res.data && res.data.length > 0) {
                setMissions(res.data);
            } else {
                // Fallback for UI demo
                const mockMissions = [
                    { id: 1, title: "ログインをする", exp_reward: 1, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'daily' },
                    { id: 2, title: "個人実績の確認をする", exp_reward: 1, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'daily' },
                    { id: 3, title: "店舗実績の確認をする", exp_reward: 1, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'daily' },
                    { id: 4, title: "いいねをする", exp_reward: 1, current_count: 1, target_count: 1, is_completed: true, is_claimed: false, mission_type: 'daily' },
                    { id: 5, title: "コメントをする", exp_reward: 1, current_count: 1, target_count: 1, is_completed: true, is_claimed: true, mission_type: 'daily' },
                    { id: 10, title: "投稿をする", exp_reward: 1, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'daily' },
                    { id: 6, title: "ノウハウを投稿する", exp_reward: 30, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'weekly' },
                    { id: 7, title: "事務局だよりを確認する", exp_reward: 10, current_count: 1, target_count: 1, is_completed: true, is_claimed: true, mission_type: 'weekly' },
                    { id: 8, title: "動画を視聴する", exp_reward: 10, current_count: 1, target_count: 1, is_completed: true, is_claimed: true, mission_type: 'weekly' },
                    { id: 9, title: "動画のテストを受ける", exp_reward: 30, current_count: 1, target_count: 1, is_completed: true, is_claimed: true, mission_type: 'weekly' },
                ];
                setMissions(mockMissions);
            }
        } catch (err) {
            console.error("Missions fetch error:", err);
            setMissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const handleClaim = async (missionId) => {
        setClaimingId(missionId);
        try {
            const res = await axiosClient.post(`missions/${missionId}/claim/`, {});
            if (res.status === 200) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#34d399', '#ffffff'],
                    zIndex: 20000
                });
                await fetchMissions();
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                user.exp = res.data.new_exp;
                user.level = res.data.new_level;
                localStorage.setItem("user", JSON.stringify(user));
            }
        } catch (err) {
            console.error("Claim error:", err);
            alert("特典の受け取りに失敗しました。");
            fetchMissions();
        } finally {
            setClaimingId(null);
        }
    };

    const MissionCard = ({ mission }) => {
        const progressPercent = Math.min((mission.current_count / mission.target_count) * 100, 100);
        const canClaim = mission.is_completed && !mission.is_claimed;
        const isAchieved = mission.is_claimed;

        return (
            <div className="premium-mission-card">
                {/* Left Reward Box */}
                <div className={`reward-box ${isAchieved ? 'achieved' : canClaim ? 'claimable' : ''}`}>
                    <span className="reward-val">{mission.exp_reward}</span>
                </div>

                {/* Middle Content */}
                <div className="mission-info">
                    <div className="mission-title-row">
                        <h4 className={`mission-name ${isAchieved ? 'is-achieved-text' : ''}`}>{mission.title}</h4>
                        <span className={`mission-exp ${isAchieved ? 'is-achieved-text-dim' : ''}`}>{mission.exp_reward} EXP</span>
                    </div>

                    {/* Progress Area */}
                    <div className="mission-progress-container">
                        <div className="mission-progress-track">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                className={`mission-progress-bar ${isAchieved ? 'bar-achieved' : mission.is_completed ? 'bar-completed' : 'bar-ongoing'}`}
                            />
                        </div>
                        <div className="mission-progress-labels">
                            <span className={`count-text ${isAchieved ? 'is-achieved-text-dim' : ''}`}>
                                {mission.current_count} / {mission.target_count}
                            </span>
                            {isAchieved && (
                                <span className="achieved-label">Achieved</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Action */}
                <div className="action-area">
                    {canClaim ? (
                        <button
                            onClick={() => handleClaim(mission.id)}
                            disabled={claimingId === mission.id}
                            className="claim-button"
                        >
                            受け取る
                        </button>
                    ) : isAchieved ? (
                        <div className="achieved-check-icon">
                            <IoCheckmarkCircle size={24} />
                        </div>
                    ) : (
                        <div className="locked-mission-icon">
                            <IoLockClosed size={18} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mission-page-root">
            <div className="mission-page-container">
                {/* Header Area */}
                <header className="mission-page-header">
                    <div className="header-top">
                        <div className="title-group">
                            <h2 className="main-title">Missions</h2>
                            <div className="tag-group">
                                <span className="tag-dim">DAILY / WEEKLY</span>
                                <span className="tag-accent">RESET AM 03:00</span>
                            </div>
                        </div>
                        <button onClick={() => navigate(-1)} className="close-circle-btn">
                            <IoClose size={24} />
                        </button>
                    </div>

                    <div className="tab-capsule">
                        {['daily', 'weekly'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            >
                                {tab === 'daily' ? 'デイリー' : 'ウィークリー'}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="mission-content">
                    {loading ? (
                        <div className="loading-spinner-wrap">
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div className="mission-sections">
                            <AnimatePresence mode="wait">
                                <motion.section
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="section-label-row">
                                        <div className={`vertical-bar ${activeTab === 'daily' ? 'bg-emerald' : 'bg-indigo'}`} />
                                        <h3 className="section-title">
                                            {activeTab === 'daily' ? '今日のミッション' : '今週の目標'}
                                        </h3>
                                    </div>
                                    <div className="mission-list-container">
                                        {missions.filter(m => m.mission_type === activeTab).map(mission => (
                                            <MissionCard key={mission.id} mission={mission} />
                                        ))}
                                        {missions.filter(m => m.mission_type === activeTab).length === 0 && (
                                            <div className="empty-state">
                                                <p>ALL CLEAR!</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.section>
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default MissionsPage;
