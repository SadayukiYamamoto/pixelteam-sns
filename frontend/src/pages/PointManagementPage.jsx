import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "./PointManagementPage.css";

export default function PointManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [inputs, setInputs] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("admin/analytics/users/");
            setUsers(res.data);

            const initialInputs = {};
            res.data.forEach(u => {
                initialInputs[u.user_id] = u.points || 0;
            });
            setInputs(prev => ({ ...initialInputs, ...prev }));

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (userId, value) => {
        setInputs(prev => ({
            ...prev,
            [userId]: value
        }));
    };

    const handleSavePoints = async (user) => {
        const newPoints = parseInt(inputs[user.user_id]);
        if (isNaN(newPoints)) return;

        const originalUsers = [...users];
        setUsers(users.map(u => {
            if (u.user_id === user.user_id) {
                return { ...u, points: newPoints };
            }
            return u;
        }));

        try {
            await axiosClient.post("admin/points/update/", {
                user_id: user.user_id,
                points: newPoints
            });
        } catch (err) {
            console.error(err);
            alert("更新に失敗しました");
            setUsers(originalUsers);
        }
    };

    const filteredUsers = users.filter(u => {
        const s = search.toLowerCase();
        return (
            (u.display_name && u.display_name.toLowerCase().includes(s)) ||
            (u.shop_name && u.shop_name.toLowerCase().includes(s)) ||
            (u.user_id && u.user_id.toLowerCase().includes(s))
        );
    });

    return (
        <div className="point-mgmt-container">
            <Header />
            <div className="point-mgmt-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="point-mgmt-header">
                        <div className="point-mgmt-title-row">
                            <div className="title-with-icon">
                                <div className="title-icon-box">
                                    <FaCoins size={24} />
                                </div>
                                <div className="title-text-group">
                                    <h1>ポイント管理</h1>
                                </div>
                            </div>
                            <button
                                onClick={fetchUsers}
                                className="refresh-action-btn"
                            >
                                <FiRefreshCw className={loading ? "animate-spin" : ""} /> 更新
                            </button>
                        </div>
                    </header>

                    {/* 検索セクション */}
                    <div className="point-search-container">
                        <div className="point-search-box">
                            <FiSearch className="search-input-icon" size={20} />
                            <input
                                className="point-premium-search"
                                placeholder="ユーザー名、店舗名、IDで検索..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ユーザーリスト */}
                    <div className="point-list-card">
                        <div className="table-overflow-container">
                            <table className="point-table">
                                <thead>
                                    <tr>
                                        <th className="w-[320px]">ユーザー</th>
                                        <th className="w-[280px]">店舗</th>
                                        <th>現在のポイント</th>
                                        <th className="text-right w-[280px]">編集・保存</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.user_id}>
                                            <td>
                                                <div className="user-info-box">
                                                    <span className="user-display-name">{u.display_name || "名無し"}</span>
                                                    <span className="user-uid-text">
                                                        {u.user_id.length > 12 ? `${u.user_id.substring(0, 12)}...` : u.user_id}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {u.shop_name && (
                                                    <span className="shop-badge-sm">
                                                        {u.shop_name}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className={`points-display-cell ${u.points > 0 ? 'has-points' : 'no-points'}`}>
                                                    {u.points !== undefined ? u.points.toLocaleString() : "0"}
                                                    <span className="pt-label">PT</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="point-edit-controls">
                                                    <input
                                                        type="number"
                                                        value={inputs[u.user_id]}
                                                        onChange={(e) => handleInputChange(u.user_id, e.target.value)}
                                                        className="point-input-pill"
                                                        placeholder="0"
                                                    />
                                                    <button
                                                        onClick={() => handleSavePoints(u)}
                                                        className="point-save-btn"
                                                    >
                                                        保存
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="4" className="py-32 text-center text-gray-300 font-bold uppercase tracking-widest">
                                                No users matching search
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
}
