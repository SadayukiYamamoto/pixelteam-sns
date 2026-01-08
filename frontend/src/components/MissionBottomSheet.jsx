import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoCheckmarkCircle, IoLockClosed } from "react-icons/io5";
import confetti from "canvas-confetti";

const MissionBottomSheet = ({ isOpen, onClose }) => {
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
                // Fallback to user's requested missions for UI demo
                const mockMissions = [
                    { id: 1, title: "ログインをする", exp_reward: 1, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'daily' },
                    { id: 2, title: "個人実績の確認をする", exp_reward: 1, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'daily' },
                    { id: 3, title: "店舗実績の確認をする", exp_reward: 1, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'daily' },
                    { id: 4, title: "いいねをする", exp_reward: 1, current_count: 1, target_count: 1, is_completed: true, is_claimed: false, mission_type: 'daily' },
                    { id: 5, title: "コメントをする", exp_reward: 1, current_count: 0, target_count: 1, is_completed: false, is_claimed: false, mission_type: 'daily' },
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
        if (isOpen) {
            fetchMissions();
        }
    }, [isOpen]);

    const handleClaim = async (missionId) => {
        setClaimingId(missionId);
        try {
            const res = await axiosClient.post(`missions/${missionId}/claim/`, {});
            if (res.status === 200) {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#34d399', '#ffffff'] });
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
            <div style={{ display: 'flex', alignItems: 'center', padding: '24px 0', borderBottom: '1px solid #f1f5f9', gap: '20px' }}>
                {/* Left Reward Box */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid ' + (isAchieved ? '#d1fae5' : '#f1f5f9'),
                    backgroundColor: isAchieved ? '#ecfdf5' : canClaim ? '#d1fae5' : '#ffffff',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}>
                    <span style={{
                        fontSize: '24px',
                        fontWeight: '900',
                        color: isAchieved ? '#6ee7b7' : canClaim ? '#10b981' : '#cbd5e1'
                    }}>
                        {mission.exp_reward}
                    </span>
                </div>

                {/* Middle Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                        <h4 style={{
                            fontSize: '16px',
                            fontWeight: '900',
                            color: isAchieved ? '#cbd5e1' : '#1e293b',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {mission.title}
                        </h4>
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '900',
                            color: isAchieved ? '#e2e8f0' : '#94a3b8',
                            letterSpacing: '0.1em'
                        }}>
                            {mission.exp_reward} EXP
                        </span>
                    </div>

                    {/* Progress Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{
                            height: '6px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                style={{
                                    height: '100%',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    borderRadius: '999px',
                                    backgroundColor: isAchieved ? '#d1fae5' : mission.is_completed ? '#10b981' : '#6ee7b7'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '900',
                                color: isAchieved ? '#e2e8f0' : '#64748b'
                            }}>
                                {mission.current_count} / {mission.target_count}
                            </span>
                            {isAchieved && (
                                <span style={{ fontSize: '10px', fontWeight: '900', color: '#6ee7b7', fontStyle: 'italic' }}>Achieved</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Action */}
                <div style={{ minWidth: '80px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {canClaim ? (
                        <button
                            onClick={() => handleClaim(mission.id)}
                            disabled={claimingId === mission.id}
                            style={{
                                backgroundColor: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '999px',
                                padding: '10px 16px',
                                fontSize: '11px',
                                fontWeight: '900',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            受け取る
                        </button>
                    ) : isAchieved ? (
                        <div style={{ color: '#10b981', paddingRight: '8px' }}>
                            <IoCheckmarkCircle size={24} />
                        </div>
                    ) : (
                        <div style={{ color: '#f1f5f9', paddingRight: '8px' }}>
                            <IoLockClosed size={18} />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            zIndex: 10000,
                            backdropFilter: 'blur(8px)'
                        }}
                    />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 250, mass: 1 }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            margin: '0 auto',
                            width: '100%',
                            maxWidth: '512px',
                            backgroundColor: '#ffffff',
                            borderTopLeftRadius: '48px',
                            borderTopRightRadius: '48px',
                            zIndex: 10001,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            height: '85vh',
                            boxShadow: '0 -10px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {/* Header Area */}
                        <div style={{ padding: '40px 40px 24px', flexShrink: 0, backgroundColor: '#ffffff' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                                <div style={{ width: '64px', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '999px' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '36px', fontWeight: '900', color: '#1e293b', margin: '0 0 8px', letterSpacing: '-0.05em', lineHeight: 1 }}>Missions</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#94a3b8', backgroundColor: '#f8fafc', padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>DAILY / WEEKLY</div>
                                        <div style={{ fontSize: '11px', fontWeight: '900', color: '#10b981', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>RESET AM 03:00</div>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{
                                        backgroundColor: '#f8fafc',
                                        border: 'none',
                                        borderRadius: '999px',
                                        padding: '12px',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <IoClose size={24} />
                                </button>
                            </div>

                            <div style={{ backgroundColor: 'rgba(241, 245, 249, 0.5)', padding: '6px', borderRadius: '24px', display: 'flex', gap: '8px' }}>
                                {['daily', 'weekly'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            flex: 1,
                                            padding: '14px 0',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: '900',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
                                            color: activeTab === tab ? '#1e293b' : '#94a3b8',
                                            boxShadow: activeTab === tab ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                                        }}
                                    >
                                        {tab === 'daily' ? 'デイリー' : 'ウィークリー'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 160px' }}>
                            <div style={{ marginTop: '32px' }}>
                                {loading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                                        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '4px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%' }} />
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'daily' ? (
                                            <section style={{ animation: 'fadeIn 0.5s ease-both' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                                    <div style={{ width: '10px', height: '32px', backgroundColor: '#10b981', borderRadius: '999px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }} />
                                                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', margin: 0 }}>今日のミッション</h3>
                                                </div>
                                                <div>
                                                    {missions.filter(m => m.mission_type === 'daily').map(mission => (
                                                        <MissionCard key={mission.id} mission={mission} />
                                                    ))}
                                                    {missions.filter(m => m.mission_type === 'daily').length === 0 && (
                                                        <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.4 }}>
                                                            <p style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '900' }}>ALL CLEAR!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>
                                        ) : (
                                            <section style={{ animation: 'fadeIn 0.5s ease-both' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                                    <div style={{ width: '10px', height: '32px', backgroundColor: '#6366f1', borderRadius: '999px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }} />
                                                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', margin: 0 }}>今週の目標</h3>
                                                </div>
                                                <div>
                                                    {missions.filter(m => m.mission_type === 'weekly').map(mission => (
                                                        <MissionCard key={mission.id} mission={mission} />
                                                    ))}
                                                    {missions.filter(m => m.mission_type === 'weekly').length === 0 && (
                                                        <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.4 }}>
                                                            <p style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '900' }}>ALL CLEAR!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <style>{`
                            @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(10px); }
                                to { opacity: 1; transform: translateY(0); }
                            }
                        `}</style>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MissionBottomSheet;
