import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FiPlus, FiEdit3 } from "react-icons/fi";
import { HiCheckCircle, HiXCircle } from "react-icons/hi"; // Solid icons for better match
import { FaGamepad } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "./AdminCommon.css";

export default function TestManagementPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/admin/videos/list/", {
                headers: { Authorization: `Token ${token}` },
            });
            setVideos(res.data);
        } catch (e) {
            console.error("Error fetching videos:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page-container min-h-screen bg-[#F8FAFC]">
            <Header />
            <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="admin-wrapper py-20 px-10"
            >
                <div className="max-w-[1180px] mx-auto">

                    {/* Header Area - Repositioned Higher & Clear of Table */}
                    <div className="flex justify-between items-center mb-28">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-5">
                                <h1 className="text-4xl font-black text-[#111827] tracking-tight">テスト管理</h1>
                                <div className="w-12 h-12 bg-[#DCFCE7] text-[#22C55E] rounded-2xl flex items-center justify-center border border-[#BBF7D0] shadow-sm">
                                    <FaGamepad size={24} />
                                </div>
                            </div>
                            <p className="text-[#94A3B8] text-[15px] font-bold mt-4 tracking-wide opacity-80">動画に紐づくテストデータの作成と編集が行えます。</p>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/tests/create"
                                className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-black shadow-[0_20px_50px_-10px_rgba(34,197,94,0.4)] transition-all border-none whitespace-nowrap"
                                style={{
                                    borderRadius: '16px',
                                    padding: '12px 40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '16px',
                                    fontSize: '17px',
                                    minWidth: 'max-content'
                                }}
                            >
                                <FiPlus size={28} className="stroke-[4]" />
                                <span>新規作成</span>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Table Container - Clean & Airy */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="bg-white rounded-[48px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-[#F1F5F9] overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-[#F1F5F9] bg-[#F9FAFB]">
                                        <th className="py-12 px-6 text-center text-[12px] font-black text-[#94A3B8] uppercase tracking-[0.3em] w-[240px]">サムネイル</th>
                                        <th className="py-12 px-6 text-center text-[12px] font-black text-[#94A3B8] uppercase tracking-[0.3em]">動画タイトル</th>
                                        <th className="py-12 px-6 text-center text-[12px] font-black text-[#94A3B8] uppercase tracking-[0.3em] w-[220px]">ステータス</th>
                                        <th className="py-12 px-6 text-center text-[12px] font-black text-[#94A3B8] uppercase tracking-[0.3em] w-[200px]">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F1F5F9]">
                                    <AnimatePresence>
                                        {videos.map((video, index) => (
                                            <motion.tr
                                                key={video.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 + (0.05 * index) }}
                                                className="hover:bg-[#F9FAFB]/50 transition-colors group/row"
                                            >
                                                <td className="py-16 px-6">
                                                    <div className="flex justify-center">
                                                        <div
                                                            className="w-[180px] rounded-[28px] overflow-hidden bg-gray-50 border border-[#F1F5F9] transition-transform duration-300 group-hover/row:scale-[1.02]"
                                                            style={{ aspectHeight: 'auto', aspectRatio: '16 / 9' }}
                                                        >
                                                            {video.thumb ? (
                                                                <img
                                                                    src={video.thumb}
                                                                    alt={video.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[#CBD5E1] text-[12px] font-bold uppercase tracking-widest">
                                                                    Empty
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-16 px-6">
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="font-bold text-[#1F2937] text-2xl leading-tight mb-3 group-hover/row:text-[#22C55E] transition-colors duration-300">{video.title}</div>
                                                        <div className="text-[12px] text-[#94A3B8] font-bold tracking-widest uppercase opacity-60 bg-[#F1F5F9] px-4 py-2 rounded-xl">ID: {video.id}</div>
                                                    </div>
                                                </td>
                                                <td className="py-16 px-6 text-center">
                                                    <div className="flex justify-center">
                                                        {video.has_test ? (
                                                            <div
                                                                className="bg-[#DCFCE7] text-[#15803D] font-black border border-[#BBF7D0] shadow-sm justify-center"
                                                                style={{
                                                                    padding: '12px 32px',
                                                                    borderRadius: '14px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    fontSize: '14px',
                                                                    minWidth: '130px'
                                                                }}
                                                            >
                                                                <HiCheckCircle size={20} className="text-[#22C55E]" />
                                                                <span>作成済み</span>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className="bg-[#F1F5F9] text-[#64748B] font-black border border-[#E2E8F0] shadow-sm justify-center"
                                                                style={{
                                                                    padding: '12px 32px',
                                                                    borderRadius: '14px',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '12px',
                                                                    fontSize: '14px',
                                                                    minWidth: '130px'
                                                                }}
                                                            >
                                                                <HiXCircle size={20} className="text-[#94A3B8]" />
                                                                <span>未作成</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-16 px-6 text-center">
                                                    <div className="flex justify-center">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => navigate(`/tests/edit/${video.id}`)}
                                                            className="bg-white border border-[#E5E7EB] hover:border-[#22C55E] hover:text-[#22C55E] text-[#475569] font-black shadow-sm group/btn justify-center"
                                                            style={{
                                                                padding: '12px 32px',
                                                                borderRadius: '14px',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                fontSize: '14px',
                                                                minWidth: '110px'
                                                            }}
                                                        >
                                                            <FiEdit3 size={18} className="text-[#22C55E] stroke-[2.5]" />
                                                            <span>{video.has_test ? "編集" : "作成"}</span>
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    {videos.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="4" className="py-80 text-center text-[#CBD5E1] font-black uppercase tracking-[0.4em] text-xl opacity-40">
                                                No videos found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
            <Navigation activeTab="mypage" />
        </div>
    );
}
