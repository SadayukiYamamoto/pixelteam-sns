import React, { useState, useEffect } from "react";
import axios from "axios";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";
import "./UserAdminPage.css"; // Reuse CSS for consistency
import Header from "../components/Header";
import Navigation from "../components/Navigation";

const BadgeAdminPage = () => {
    const [badges, setBadges] = useState([]);
    const [users, setUsers] = useState([]);
    const [newBadge, setNewBadge] = useState({ name: "", description: "", image_url: "" });
    const [uploading, setUploading] = useState(false);

    // Assign settings
    const [selectedBadgeId, setSelectedBadgeId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchBadges();
        fetchUsers();
    }, []);

    const fetchBadges = async () => {
        try {
            const res = await axios.get("/api/admin/badges/", {
                headers: { Authorization: `Token ${token}` },
            });
            setBadges(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/api/admin/users/", {
                headers: { Authorization: `Token ${token}` },
            });
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const storage = getStorage(app);
        // Unique name for badge image
        const storageRef = ref(storage, `badges/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        setNewBadge((prev) => ({ ...prev, image_url: url }));
        setUploading(false);
    };

    const handleCreateBadge = async () => {
        if (!newBadge.name || !newBadge.image_url) {
            alert("名前と画像は必須です");
            return;
        }
        try {
            await axios.post("/api/admin/badges/", newBadge, {
                headers: { Authorization: `Token ${token}` },
            });
            // 先に状態をクリア・更新してからアラートを出す
            setNewBadge({ name: "", description: "", image_url: "" });
            await fetchBadges();
            alert("バッジを作成しました");
        } catch (err) {
            console.error(err);
            alert("作成に失敗しました");
        }
    };

    const handleAssignBadge = async () => {
        if (!selectedBadgeId || !selectedUserId) {
            alert("バッジとユーザーを選択してください");
            return;
        }
        try {
            await axios.post("/api/admin/badges/assign/", {
                user_id: selectedUserId,
                badge_id: selectedBadgeId
            }, {
                headers: { Authorization: `Token ${token}` },
            });
            alert("バッジを付与しました");
        } catch (err) {
            console.error(err);
            alert("付与に失敗しました");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            <Header />
            <div className="max-w-4xl mx-auto p-6 pt-10">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">バッジ管理</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 新規作成 */}
                    <div className="bg-white p-8 rounded-[32px] shadow-lg border-none">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 border-b border-gray-100 pb-2">新規バッジ作成</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">バッジ名</label>
                                <input
                                    value={newBadge.name}
                                    onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                                    placeholder="例: MVP"
                                    className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-green-400/30 transition outline-none shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">説明 (任意)</label>
                                <input
                                    value={newBadge.description}
                                    onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                                    placeholder="例: 月間MVP受賞者"
                                    className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-green-400/30 transition outline-none shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">バッジ画像</label>
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                />
                                {uploading && <p className="text-sm text-gray-500 mt-2">アップロード中...</p>}
                                {newBadge.image_url && (
                                    <div className="mt-4 flex justify-center p-4 bg-gray-50 rounded-xl">
                                        <img src={newBadge.image_url} className="w-20 h-20 object-contain" alt="preview" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleCreateBadge}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-full shadow-md transition transform hover:-translate-y-0.5 mt-4"
                            >
                                作成
                            </button>
                        </div>
                    </div>

                    {/* 付与 */}
                    <div className="bg-white p-8 rounded-[32px] shadow-lg border-none">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 border-b border-gray-100 pb-2">バッジ付与</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">バッジ選択</label>
                                <select
                                    value={selectedBadgeId}
                                    onChange={(e) => setSelectedBadgeId(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-green-400/30 transition outline-none appearance-none shadow-inner"
                                >
                                    <option value="">選択してください</option>
                                    {badges.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">ユーザー選択</label>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-green-400/30 transition outline-none appearance-none shadow-inner"
                                >
                                    <option value="">選択してください</option>
                                    {users.map(u => (
                                        <option key={u.user_id} value={u.user_id}>{u.display_name} (@{u.user_id})</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleAssignBadge}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-full shadow-md transition transform hover:-translate-y-0.5 mt-4"
                            >
                                付与する
                            </button>
                        </div>
                    </div>
                </div>

                {/* 一覧 */}
                <div className="mt-12">
                    <h3 className="text-xl font-bold mb-6 text-gray-800">登録済みバッジ一覧</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                        {badges.map(b => (
                            <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition">
                                <img src={b.image_url} alt={b.name} className="w-16 h-16 object-contain mb-3" />
                                <p className="font-bold text-sm text-gray-700 text-center">{b.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default BadgeAdminPage;
