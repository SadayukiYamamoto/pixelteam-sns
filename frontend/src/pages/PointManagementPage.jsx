import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { FiSearch, FiPlus, FiMinus, FiRefreshCw } from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

export default function PointManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Inline input state: { [userId]: number }
    const [inputs, setInputs] = useState({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("admin/analytics/users/");
            setUsers(res.data);

            // Initialize inputs with current points
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
            [userId]: value // Allow empty string for typing, parse later
        }));
    };

    const handleSavePoints = async (user) => {
        const newPoints = parseInt(inputs[user.user_id]);
        if (isNaN(newPoints)) return;

        // Optimistic update
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
            alert("更新しました");
        } catch (err) {
            console.error(err);
            alert("更新に失敗しました");
            setUsers(originalUsers); // Rollback
        }
    };

    // Filter
    const filteredUsers = users.filter(u => {
        const s = search.toLowerCase();
        return (
            (u.display_name && u.display_name.toLowerCase().includes(s)) ||
            (u.shop_name && u.shop_name.toLowerCase().includes(s)) ||
            (u.user_id && u.user_id.toLowerCase().includes(s))
        );
    });

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header />
                <div className="max-w-7xl mx-auto pt-10 px-4">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                <FaCoins size={24} />
                            </span>
                            ポイント管理
                        </h1>
                        <button
                            onClick={fetchUsers}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors bg-white px-3 py-2 rounded-lg border-none shadow-sm hover:shadow-md"
                        >
                            <FiRefreshCw className={loading ? "animate-spin" : ""} /> 更新
                        </button>
                    </div>

                    {/* Filter */}
                    <div className="bg-white p-5 rounded-2xl shadow-xl shadow-gray-200/50 mb-8 flex gap-4 items-center">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#84cc16] outline-none shadow-inner"
                                placeholder="ユーザー名、店舗名、IDで検索..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border-none overflow-hidden">
                        <table className="min-w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-100">
                                    <th className="p-5 w-1/4">ユーザー</th>
                                    <th className="p-5 w-1/6">店舗</th>
                                    <th className="p-5 w-1/6">現在のポイント</th>
                                    <th className="p-5 w-1/3 text-right">編集・保存</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredUsers.map(u => (
                                    <tr key={u.user_id} className="hover:bg-lime-50/10 transition-colors bg-white">
                                        <td className="p-5 font-bold text-gray-700">
                                            {u.display_name || "名無し"}
                                            <div className="text-xs text-gray-400 font-normal font-mono">{u.user_id.substring(0, 15)}...</div>
                                        </td>
                                        <td className="p-5 text-gray-600">
                                            {u.shop_name && (
                                                <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                                                    {u.shop_name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-5 font-bold text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-lg text-yellow-600">{u.points !== undefined ? u.points.toLocaleString() : "---"}</span>
                                                <span className="text-[10px] font-bold uppercase text-gray-400">pt</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <input
                                                    type="number"
                                                    value={inputs[u.user_id]}
                                                    onChange={(e) => handleInputChange(u.user_id, e.target.value)}
                                                    className="w-28 px-3 py-2 text-right font-bold bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#84cc16] outline-none shadow-inner"
                                                    placeholder="0"
                                                />
                                                <button
                                                    onClick={() => handleSavePoints(u)}
                                                    className="px-6 py-2 bg-[#84cc16] hover:bg-[#a3e635] text-white rounded-xl transition-all font-bold shadow-lg shadow-lime-200/50 hover:shadow-xl hover:shadow-lime-300/50 active:scale-95 border-none"
                                                >
                                                    保存
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-400">
                                            ユーザーが見つかりません
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
}
