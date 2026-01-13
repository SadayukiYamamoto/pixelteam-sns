import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import Header from "../../components/Header";
import Navigation from "../../components/Navigation";
import "../../admin/AdminCommon.css";
import { FiPlus, FiTrash2, FiAward, FiChevronLeft, FiPlusCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./AdminLevelRewards.css";

const AdminLevelRewards = () => {
    const navigate = useNavigate();
    const [rewards, setRewards] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);

    // Form state for adding new reward
    const [newReward, setNewReward] = useState({
        level: "",
        badge_id: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rewardsRes, badgesRes] = await Promise.all([
                axiosClient.get("/missions/admin/level-rewards/"),
                axiosClient.get("/admin/badges/")
            ]);

            setRewards(rewardsRes.data.sort((a, b) => a.level - b.level));
            setBadges(badgesRes.data);
        } catch (error) {
            console.error("Error fetching level reward data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReward = async (e) => {
        e.preventDefault();
        if (!newReward.level || !newReward.badge_id) return;

        try {
            await axiosClient.post("/missions/admin/level-rewards/", newReward);
            setNewReward({ level: "", badge_id: "" });
            setIsFormVisible(false);
            fetchData();
            alert("レベル報酬を追加しました");
        } catch (error) {
            console.error("Error adding reward:", error);
            alert("追加に失敗しました。このレベルには既に報酬が設定されている可能性があります。");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("この報酬設定を削除しますか？")) return;
        try {
            await axiosClient.delete(`/missions/admin/level-rewards/${id}/`);
            fetchData();
        } catch (error) {
            console.error("Error deleting reward:", error);
        }
    };

    return (
        <div className="admin-page-container">
            <Header title="管理" />
            <div className="admin-wrapper bg-[#f8fafc]">
                <div className="level-rewards-container">

                    {/* Header */}
                    <div className="level-rewards-header">
                        <div className="header-left-area">
                            <button onClick={() => navigate(-1)} className="back-btn-minimal">
                                <FiChevronLeft size={28} />
                            </button>
                            <div className="header-text">
                                <h1>レベルバッジ報酬</h1>
                                <p>特定のレベル到達時に付与されるバッジを管理</p>
                            </div>
                        </div>
                        <button
                            className="add-main-btn"
                            onClick={() => setIsFormVisible(!isFormVisible)}
                        >
                            <FiPlus size={24} strokeWidth={3} />
                        </button>
                    </div>

                    {/* New Reward Form (Toggled) */}
                    {isFormVisible && (
                        <div className="premium-form-card">
                            <h2 className="form-title">
                                <span><FiPlusCircle /></span> 新しい報酬設定
                            </h2>
                            <form onSubmit={handleAddReward}>
                                <div className="form-group-custom">
                                    <label>到達レベル</label>
                                    <input
                                        type="number"
                                        className="input-minimal-box"
                                        placeholder="例: 10"
                                        value={newReward.level}
                                        onChange={(e) => setNewReward({ ...newReward, level: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group-custom">
                                    <label>付与するバッジ</label>
                                    <select
                                        className="input-minimal-box"
                                        value={newReward.badge_id}
                                        onChange={(e) => setNewReward({ ...newReward, badge_id: e.target.value })}
                                        required
                                    >
                                        <option value="">バッジを選択してください</option>
                                        {badges.map(badge => (
                                            <option key={badge.id} value={badge.id}>{badge.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="submit-btn-premium">設定を保存</button>
                            </form>
                        </div>
                    )}

                    {/* Reward Cards List */}
                    <div className="rewards-list-area">
                        {loading ? (
                            <div className="p-20 text-center text-gray-400 font-bold">読み込み中...</div>
                        ) : rewards.length === 0 ? (
                            <div className="empty-state-dashed">
                                <div className="empty-icon"><FiAward /></div>
                                <p>まだ報酬設定がありません</p>
                            </div>
                        ) : (
                            rewards.map(reward => (
                                <div key={reward.id} className="reward-item-card">
                                    <div className="level-info-pill">
                                        LV.{reward.level}
                                    </div>
                                    <div className="badge-reward-info">
                                        <h4>{reward.badge_name}</h4>
                                        <p>Badge ID: {reward.badge_id.substring(0, 8)}</p>
                                    </div>
                                    <button
                                        className="delete-btn-circle"
                                        onClick={() => handleDelete(reward.id)}
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default AdminLevelRewards;
