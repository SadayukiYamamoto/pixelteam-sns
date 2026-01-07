import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiArrowLeft, FiSearch, FiAward, FiSmile, FiUser, FiChevronDown, FiChevronRight, FiMessageSquare } from "react-icons/fi";
import { HiStar } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "./VideoFeedbackAdminPage.css";

const VideoFeedbackAdminPage = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedVideoIds, setExpandedVideoIds] = useState({});

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/admin/videos/feedback/", {
                headers: { Authorization: `Token ${token}` }
            });
            setFeedbacks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedVideoIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredFeedbacks = feedbacks.filter(f =>
        f.video_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSatisfactionEmoji = (score) => {
        return ""; // 絵文字を表示しない
    };

    return (
        <div className="video-feedback-container">
            <Header />
            <main className="video-feedback-wrapper">

                <section className="video-feedback-header">
                    <div className="video-feedback-title-group">
                        <button onClick={() => navigate("/admin")} className="p-2 hover:bg-white rounded-full transition-all border-none bg-transparent cursor-pointer">
                            <FiArrowLeft size={24} />
                        </button>
                        <h1>動画テスト・アンケート分析</h1>
                    </div>
                    <p>各動画の学習効果とユーザー満足度を一覧で分析します。</p>
                </section>

                <div className="video-feedback-search-card">
                    <div className="search-input-wrapper">
                        <FiSearch className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="動画タイトルで検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-slate-400 font-black tracking-widest text-xs uppercase">Loading Analysis...</p>
                    </div>
                ) : (
                    <div className="feedback-results-card">
                        <table className="feedback-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '120px' }}>サムネイル</th>
                                    <th>題名</th>
                                    <th style={{ width: '150px' }}>平均点数</th>
                                    <th style={{ width: '150px' }}>平均満足度</th>
                                    <th style={{ width: '120px' }}>回答数</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFeedbacks.map((video) => (
                                    <React.Fragment key={video.video_id}>
                                        <tr
                                            className={`row-video ${expandedVideoIds[video.video_id] ? 'expanded' : ''}`}
                                            onClick={() => toggleExpand(video.video_id)}
                                        >
                                            <td className="thumb-cell">
                                                <div className="thumb-mini">
                                                    <img src={video.thumb} alt="" />
                                                </div>
                                            </td>
                                            <td className="title-cell">
                                                <div className="flex items-center gap-2">
                                                    {expandedVideoIds[video.video_id] ? <FiChevronDown size={14} className="text-emerald-500" /> : <FiChevronRight size={14} className="text-slate-300" />}
                                                    <span>{video.video_title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="score-badge">
                                                    <FiAward size={14} />
                                                    <span>{video.avg_score} pts</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="sat-badge">
                                                    <FiSmile size={14} />
                                                    <span>{video.avg_satisfaction > 0 ? `${video.avg_satisfaction} ${getSatisfactionEmoji(video.avg_satisfaction)}` : "---"}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="resp-badge">
                                                    <FiUser size={14} />
                                                    <span>{video.total_tests + video.total_surveys}件</span>
                                                </div>
                                            </td>
                                        </tr>

                                        <AnimatePresence>
                                            {expandedVideoIds[video.video_id] && video.logs.map((log, idx) => (
                                                <motion.tr
                                                    key={`${video.video_id}-${idx}`}
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="row-user-feedback"
                                                >
                                                    <td></td>
                                                    <td className="user-cell">
                                                        <div className="user-cell-content">
                                                            <div className="user-avatar-mini">
                                                                {log.display_name.charAt(0)}
                                                            </div>
                                                            <div className="user-name-info">
                                                                <span className="user-name-text">{log.display_name}</span>
                                                                <span className="user-id-text">{log.user_id.substring(0, 12)}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {log.test ? (
                                                            <div className="flex flex-col gap-2">
                                                                <div className="font-black text-slate-700">
                                                                    {log.test.score} <span className="text-[10px] text-slate-400">/ {log.test.max_score}</span>
                                                                </div>
                                                                {log.test_details && log.test_details.length > 0 && (
                                                                    <div className="test-detail-box">
                                                                        {log.test_details.map((td, tdIdx) => (
                                                                            <div key={tdIdx} className="test-detail-item">
                                                                                <span className="test-q-text">Q. {td.question}</span>
                                                                                <div className="test-a-group">
                                                                                    <span className="test-a-text">{td.user_choice}</span>
                                                                                    <span className={td.is_correct ? "indicator-correct" : "indicator-wrong"}>
                                                                                        {td.is_correct ? "正解" : "不正解"}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : <span className="text-slate-200">-</span>}
                                                    </td>
                                                    <td>
                                                        {log.survey?.satisfaction ? (
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(4)].map((_, i) => (
                                                                    <HiStar key={i} size={12} className={i < log.survey.satisfaction ? 'text-yellow-400' : 'text-slate-100'} />
                                                                ))}
                                                            </div>
                                                        ) : <span className="text-slate-200">-</span>}
                                                    </td>
                                                    <td>
                                                        {log.survey?.answers && log.survey.answers.length > 0 ? (
                                                            <div className="feedback-details-box">
                                                                {log.survey.answers.map((ans, aIdx) => (
                                                                    <div key={aIdx} className="feedback-item">
                                                                        <span className="feedback-q">{ans.question}</span>
                                                                        <span className="feedback-a">{ans.answer}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : <span className="text-slate-200">-</span>}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>

                        {filteredFeedbacks.length === 0 && (
                            <div className="feedback-empty">
                                <FiMessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                                <p>分析データが見つかりません</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default VideoFeedbackAdminPage;
