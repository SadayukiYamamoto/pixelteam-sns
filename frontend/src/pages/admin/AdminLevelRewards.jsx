import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Navigation from '../../components/Navigation';
import { Plus, Trash2, ChevronLeft, Award } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "";

const AdminLevelRewards = () => {
    const [rewards, setRewards] = useState([]);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLevel, setNewLevel] = useState('');
    const [newBadgeId, setNewBadgeId] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        try {
            const [rewardsRes, badgesRes] = await Promise.all([
                axios.get(`${API_URL}/api/missions/admin/level-rewards/`, {
                    headers: { Authorization: `Token ${token}` },
                }),
                axios.get(`${API_URL}/api/admin/badges/`, {
                    headers: { Authorization: `Token ${token}` },
                })
            ]);
            setRewards(rewardsRes.data);
            setBadges(badgesRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAddReward = async () => {
        if (!newLevel || !newBadgeId) return;
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${API_URL}/api/missions/admin/level-rewards/`,
                { level: parseInt(newLevel), badge: parseInt(newBadgeId) },
                { headers: { Authorization: `Token ${token}` } }
            );
            setNewLevel('');
            setNewBadgeId('');
            setShowAddForm(false);
            fetchData();
            alert("報酬を追加しました");
        } catch (err) {
            console.error(err);
            alert("追加に失敗しました。このレベルの報酬は既に存在する可能性があります。");
        }
    };

    const handleDeleteReward = async (id) => {
        if (!window.confirm("この報酬を削除しますか？")) return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${API_URL}/api/missions/admin/level-rewards/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("削除に失敗しました");
        }
    };

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header title="レベルバッジ報酬管理" />
                <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="p-2 hover:bg-white rounded-full transition-colors border-none bg-transparent"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-slate-800">レベルバッジ報酬</h1>
                                <p className="text-slate-500 text-sm">特定のレベル到達時に付与されるバッジを管理</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-pink-500 text-white p-3 rounded-full border-none shadow-lg hover:bg-pink-600 transition-colors"
                        >
                            <Plus size={24} />
                        </button>
                    </div>

                    {showAddForm && (
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-pink-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-pink-500" />
                                新しい報酬設定
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">到達レベル</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        placeholder="例: 10"
                                        value={newLevel}
                                        onChange={(e) => setNewLevel(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">付与するバッジ</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        value={newBadgeId}
                                        onChange={(e) => setNewBadgeId(e.target.value)}
                                    >
                                        <option value="">バッジを選択してください</option>
                                        {badges.map(badge => (
                                            <option key={badge.id} value={badge.id}>{badge.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleAddReward}
                                    className="w-full bg-pink-500 text-white py-3 rounded-xl border-none font-black shadow-md hover:bg-pink-600 transition-colors mt-2"
                                >
                                    設定を保存
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {rewards.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                                    <Award size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-bold">まだ報酬設定がありません</p>
                                </div>
                            ) : (
                                rewards.map((reward) => (
                                    <div key={reward.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.01]">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center font-black text-pink-500 text-xl border border-pink-100">
                                                {reward.level}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Level Reach Reward</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-50 border border-slate-100">
                                                        <img src={reward.badge_data?.image_url} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <p className="font-black text-slate-800 text-lg">{reward.badge_data?.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteReward(reward.id)}
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <Navigation activeTab="mypage" />
            </div>
        </div>
    );
};

export default AdminLevelRewards;
