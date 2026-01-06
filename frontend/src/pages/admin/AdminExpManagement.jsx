import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Navigation from '../../components/Navigation';
import { Save, User as UserIcon, TrendingUp, ChevronLeft } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "";

const AdminExpManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editedExp, setEditedExp] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${API_URL}/api/admin/users/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user.user_id);
        setEditedExp(user.exp);
    };

    const handleSave = async (userId) => {
        const token = localStorage.getItem("token");
        try {
            await axios.patch(`${API_URL}/api/admin/users/${userId}/`,
                { exp: parseInt(editedExp) },
                { headers: { Authorization: `Token ${token}` } }
            );
            setEditingUser(null);
            fetchUsers();
            alert("EXPを更新しました");
        } catch (err) {
            console.error(err);
            alert("更新に失敗しました");
        }
    };

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header title="EXP・レベル管理" />
                <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate('/admin')}
                            className="p-2 hover:bg-white rounded-full transition-colors border-none bg-transparent"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800">EXP・レベル管理</h1>
                            <p className="text-slate-500 text-sm">ユーザーの経験値を直接編集できます</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.user_id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100">
                                            <img src={user.profile_image || "/default-avatar.png"} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.display_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Lv.{user.level}</span>
                                                <span className="text-slate-400 text-xs">Total: {user.exp} EXP</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {editingUser === user.user_id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    value={editedExp}
                                                    onChange={(e) => setEditedExp(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleSave(user.user_id)}
                                                    className="bg-emerald-500 text-white p-2 rounded-xl border-none shadow-sm hover:bg-emerald-600 transition-colors"
                                                >
                                                    <Save size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl border-none text-sm font-bold hover:bg-slate-100 transition-colors"
                                            >
                                                編集
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <Navigation activeTab="mypage" />
            </div>
        </div>
    );
};

export default AdminExpManagement;
