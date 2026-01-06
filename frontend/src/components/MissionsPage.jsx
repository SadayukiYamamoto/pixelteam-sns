import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { IoChevronBack, IoCheckmarkCircle, IoLockClosed } from "react-icons/io5";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";

const API_URL = import.meta.env.VITE_API_URL || "";

const MissionsPage = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState(null);
    const [activeTab, setActiveTab] = useState('daily');

    const fetchMissions = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axiosClient.get(`missions/`);
            setMissions(res.data);
        } catch (err) {
            console.error("Missions fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const handleClaim = async (missionId) => {
        const token = localStorage.getItem("token");
        setClaimingId(missionId);
        try {
            const res = await axiosClient.post(`missions/${missionId}/claim/`, {});

            if (res.status === 200) {
                // Fireworks!
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#22c55e', '#a3e635', '#ffffff']
                });

                // Refresh missions and update local user data if needed
                await fetchMissions();
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                user.exp = res.data.new_exp;
                user.level = res.data.new_level;
                localStorage.setItem("user", JSON.stringify(user));
            }
        } catch (err) {
            console.error("Claim error:", err);
            alert("特典の受け取りに失敗しました。時間切れの可能性があります。");
            fetchMissions();
        } finally {
            setClaimingId(null);
        }
    };

    const MissionCard = ({ mission }) => {
        const progressPercent = Math.min((mission.current_count / mission.target_count) * 100, 100);
        const canClaim = mission.is_completed && !mission.is_claimed;

        return (
            <motion.div
                layout
                className={`bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 flex items-center gap-4 ${mission.is_claimed ? 'opacity-60' : ''}`}
            >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${mission.is_claimed ? 'bg-slate-100 text-slate-400' :
                    mission.is_completed ? 'bg-green-100 text-green-500' : 'bg-slate-50 text-slate-400'
                    }`}>
                    {mission.is_claimed ? <IoCheckmarkCircle /> : mission.exp_reward}
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-slate-800 text-[15px]">{mission.title}</h4>
                        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                            {mission.exp_reward} EXP
                        </span>
                    </div>

                    <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            className={`absolute inset-0 rounded-full ${mission.is_completed ? 'bg-green-500' : 'bg-green-400'}`}
                        />
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className={mission.is_completed ? 'text-green-500' : 'text-slate-400'}>
                            {mission.current_count} / {mission.target_count}
                        </span>
                    </div>
                </div>

                <div>
                    {mission.is_claimed ? (
                        <div className="px-4 py-2 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold border border-slate-100">
                            達成済み
                        </div>
                    ) : canClaim ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleClaim(mission.id)}
                            disabled={claimingId === mission.id}
                            className="px-6 py-2.5 rounded-xl bg-green-500 text-white text-xs font-bold shadow-lg shadow-green-100 border-none animate-pulse"
                        >
                            受け取る
                        </motion.button>
                    ) : (
                        <div className="px-4 py-2 rounded-xl bg-slate-50 text-slate-300 text-xs font-bold border border-slate-100 flex items-center gap-1">
                            <IoLockClosed size={12} />
                            進行中
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* ヘッダー */}
            <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4 flex items-center gap-4">
                <Link to="/mypage" className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-600">
                    <IoChevronBack size={24} />
                </Link>
                <h1 className="text-xl font-black text-slate-800 tracking-tight">ミッション</h1>
            </div>

            <div className="px-6 pt-8 pb-48 max-w-lg mx-auto">
                <div className="mb-10 text-center">
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-3">Keep it up every day!</p>
                    <div className="flex justify-center">
                        <div className="bg-white px-6 py-3 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center min-w-[140px]">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Reset Time</span>
                            <span className="text-lg font-black text-slate-800 tabular-nums">AM 03:00</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Tab Switcher */}
                        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 mb-8">
                            {['daily', 'weekly'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-black transition-all border-none ${activeTab === tab
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-500'
                                        }`}
                                >
                                    {tab === 'daily' ? 'デイリー' : 'ウィークリー'}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ x: 10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -10, opacity: 0 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                {activeTab === 'daily' ? (
                                    <section>
                                        <div className="flex items-center gap-2 mb-6 px-2">
                                            <div className="w-1.5 h-5 bg-green-500 rounded-full" />
                                            <h3 className="font-black text-slate-800 tracking-tight text-sm">今日達成すべきこと</h3>
                                        </div>
                                        {missions.filter(m => m.mission_type === 'daily').map(mission => (
                                            <MissionCard key={mission.id} mission={mission} />
                                        ))}
                                    </section>
                                ) : (
                                    <section>
                                        <div className="flex items-center gap-2 mb-6 px-2">
                                            <div className="w-1.5 h-5 bg-lime-500 rounded-full" />
                                            <h3 className="font-black text-slate-800 tracking-tight text-sm">今週の目標</h3>
                                        </div>
                                        {missions.filter(m => m.mission_type === 'weekly').map(mission => (
                                            <MissionCard key={mission.id} mission={mission} />
                                        ))}
                                    </section>
                                )}
                                {/* Bottom Spacer */}
                                <div className="h-20" />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MissionsPage;
