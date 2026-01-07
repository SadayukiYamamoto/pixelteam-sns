import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";
import "./BadgeAdminPage.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

const BadgeAdminPage = () => {
    const [badges, setBadges] = useState([]);
    const [users, setUsers] = useState([]);
    const [newBadge, setNewBadge] = useState({ name: "", description: "", image_url: "" });
    const [selectedFileName, setSelectedFileName] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

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

        setSelectedFileName(file.name);
        setUploading(true);
        try {
            const storage = getStorage(app);
            // Unique name for badge image
            const storageRef = ref(storage, `badges/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setNewBadge((prev) => ({ ...prev, image_url: url }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("アップロードに失敗しました");
        } finally {
            setUploading(false);
        }
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
            setNewBadge({ name: "", description: "", image_url: "" });
            setSelectedFileName("");
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
        <div className="badge-admin-container">
            <Header />
            <div className="admin-wrapper">
                <div className="badge-admin-content">
                    <h2>バッジ管理</h2>

                    <div className="admin-card-stack">
                        {/* 新規作成 */}
                        <div className="premium-card">
                            <h3>新規バッジ作成</h3>
                            <div className="form-group">
                                <label>バッジ名</label>
                                <input
                                    value={newBadge.name}
                                    onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                                    placeholder="例: MVP"
                                />
                            </div>
                            <div className="form-group">
                                <label>説明 (任意)</label>
                                <input
                                    value={newBadge.description}
                                    onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                                    placeholder="例: 月間MVP受賞者"
                                />
                            </div>
                            <div className="form-group">
                                <label>バッジ画像</label>
                                <div className="custom-file-wrapper">
                                    <label className="custom-file-label" onClick={() => fileInputRef.current?.click()}>
                                        ファイルを選択
                                    </label>
                                    <span className="file-name-display">
                                        {selectedFileName || "選択されていません"}
                                    </span>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        style={{ display: "none" }}
                                    />
                                </div>
                                {uploading && <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-2 px-1">Uploading...</p>}
                                {newBadge.image_url && (
                                    <div className="mt-6 flex justify-center p-6 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                                        <img src={newBadge.image_url} className="w-24 h-24 object-contain drop-shadow-xl" alt="preview" />
                                    </div>
                                )}
                            </div>
                            <button onClick={handleCreateBadge} className="btn-premium btn-create">作成</button>
                        </div>

                        {/* 付与 */}
                        <div className="premium-card">
                            <h3>バッジ付与</h3>
                            <div className="form-group">
                                <label>バッジ選択</label>
                                <select
                                    value={selectedBadgeId}
                                    onChange={(e) => setSelectedBadgeId(e.target.value)}
                                >
                                    <option value="">選択してください</option>
                                    {badges.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>ユーザー選択</label>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                >
                                    <option value="">選択してください</option>
                                    {users.map(u => (
                                        <option key={u.user_id} value={u.user_id}>{u.display_name} (@{u.user_id})</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={handleAssignBadge} className="btn-premium btn-assign">付与する</button>
                        </div>
                    </div>

                    {/* 一覧 */}
                    <div className="badge-list-section">
                        <h3>登録済みバッジ一覧</h3>
                        <div className="badge-list-grid">
                            {badges.map(b => (
                                <div key={b.id} className="badge-item-card">
                                    <img src={b.image_url} alt={b.name} />
                                    <p>{b.name}</p>
                                </div>
                            ))}
                            {badges.length === 0 && (
                                <div className="col-span-full py-20 text-center text-gray-300 font-black uppercase tracking-widest">
                                    No badges registered
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default BadgeAdminPage;
