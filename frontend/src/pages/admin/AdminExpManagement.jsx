import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header";
import Navigation from "../../components/Navigation";
import "../../admin/AdminCommon.css";
import { FiSearch, FiSave, FiChevronLeft, FiEdit3, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./AdminExpManagement.css";

const AdminExpManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingExp, setEditingExp] = useState({}); // { user_id: exp_value }
    const [editingUserId, setEditingUserId] = useState(null); // Which user is currently showing input

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/admin/analytics/users/", {
                headers: { Authorization: `Token ${token}` }
            });
            setUsers(res.data);

            // Initialize local exp state
            const expMap = {};
            res.data.forEach(u => {
                expMap[u.user_id] = u.exp || 0;
            });
            setEditingExp(expMap);
        } catch (error) {
            console.error("Error fetching users for EXP management:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExpChange = (userId, value) => {
        setEditingExp(prev => ({
            ...prev,
            [userId]: parseInt(value) || 0
        }));
    };

    const handleSave = async (user) => {
        const newExp = editingExp[user.user_id];
        try {
            const token = localStorage.getItem("token");
            await axios.post("/api/admin/users/update_exp/", {
                user_id: user.user_id,
                exp: newExp
            }, {
                headers: { Authorization: `Token ${token}` }
            });
            alert(`${user.display_name} のEXPを更新しました`);
            setEditingUserId(null); // Close edit mode
            fetchUsers(); // Refresh
        } catch (error) {
            console.error("Error updating EXP:", error);
            alert("更新に失敗しました");
        }
    };

    const filteredUsers = users.filter(u =>
        u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.user_id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page-container">
            <Header title="管理" />
            <div className="admin-wrapper bg-[#f8fafc]">
                <div className="exp-admin-container">

                    {/* Header with Back Button */}
                    <div className="exp-admin-header">
                        <button onClick={() => navigate(-1)} className="back-btn-minimal">
                            <FiChevronLeft size={28} />
                        </button>
                        <div className="exp-admin-header-text">
                            <h1>EXP・レベル管理</h1>
                            <p>ユーザーの経験値を直接編集できます</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="exp-search-section mb-8">
                        <div className="relative flex items-center">
                            <FiSearch className="absolute left-6 text-gray-400" size={20} />
                            <input
                                className="w-full pl-16 pr-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-accent/10 transition-all outline-none font-bold text-gray-700 shadow-sm placeholder-gray-400 text-base"
                                placeholder="ユーザーを検索..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* User Cards List */}
                    <div className="user-exp-list">
                        {loading ? (
                            <div className="p-20 text-center text-gray-400 font-bold">読み込み中...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-20 text-center text-gray-300 font-black tracking-widest uppercase">検索結果なし</div>
                        ) : (
                            filteredUsers.map(user => (
                                <div key={user.user_id} className="user-exp-card">
                                    <div className="user-info-area">
                                        <div className="user-avatar-wrapper">
                                            <img
                                                src={user.profile_image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.display_name || "User") + "&background=random"}
                                                alt={user.display_name}
                                                onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=User&background=ddd" }}
                                            />
                                        </div>
                                        <div className="user-details">
                                            <h3>{user.display_name}</h3>
                                            <div className="user-stats-minimal">
                                                <span className="level-badge-mini">LV.{user.level || 0}</span>
                                                <span className="total-exp-label">Total: {user.exp?.toLocaleString() || 0} EXP</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="action-area-right">
                                        {editingUserId === user.user_id ? (
                                            <div className="exp-input-wrapper">
                                                <input
                                                    type="number"
                                                    className="minimal-exp-input"
                                                    value={editingExp[user.user_id]}
                                                    onChange={(e) => handleExpChange(user.user_id, e.target.value)}
                                                    autoFocus
                                                />
                                                <button
                                                    className="save-action-btn"
                                                    onClick={() => handleSave(user)}
                                                >
                                                    <FiSave size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="edit-btn-minimal"
                                                onClick={() => setEditingUserId(user.user_id)}
                                            >
                                                編集
                                            </button>
                                        )}
                                    </div>
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

export default AdminExpManagement;
