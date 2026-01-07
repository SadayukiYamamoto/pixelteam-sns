import React, { useState, useEffect } from "react";
import axios from "axios";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "../firebase";
import "./UserAdminPage.css";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

const UserAdminPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [badges, setBadges] = useState([]);

    // Edit Form State
    const [formData, setFormData] = useState({
        display_name: "",
        points: 0,
        team: "",
        profile_image: "",
        badge_ids: [],
        is_secretary: false,
        shop_name: "",
    });
    const [uploading, setUploading] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchUsers();
        fetchBadges();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/api/admin/users/", {
                headers: { Authorization: `Token ${token}` },
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const fetchBadges = async () => {
        try {
            const res = await axios.get("/api/admin/badges/", {
                headers: { Authorization: `Token ${token}` },
            });
            setBadges(res.data);
        } catch (err) {
            console.error("Failed to fetch badges", err);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({
            display_name: user.display_name,
            points: user.points,
            team: user.team,
            profile_image: user.profile_image,
            badge_ids: user.badges ? user.badges.map((b) => b.id) : [],
            is_secretary: user.is_secretary || false,
            shop_name: user.shop_name || "",
        });
        setEditing(true);
    };

    const handleBadgeToggle = (badgeId) => {
        setFormData((prev) => {
            const newBadgeIds = prev.badge_ids.includes(badgeId)
                ? prev.badge_ids.filter((id) => id !== badgeId)
                : [...prev.badge_ids, badgeId];
            return { ...prev, badge_ids: newBadgeIds };
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const storage = getStorage(app);
        const storageRef = ref(storage, `profileImages/${selectedUser.user_id}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        setFormData((prev) => ({ ...prev, profile_image: url }));
        setUploading(false);
    };

    const handleSave = async () => {
        try {
            await axios.patch(
                `/api/admin/users/${selectedUser.user_id}/`,
                formData,
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );
            alert("ユーザー情報を更新しました");
            setEditing(false);
            fetchUsers();
        } catch (err) {
            console.error("Update failed", err);
            alert("更新に失敗しました");
        }
    };

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header />
                <div className="admin-content">
                    <h2>ユーザー管理</h2>

                    {!editing ? (
                        <div className="user-list">
                            {users.map((user) => (
                                <div key={user.user_id} className="user-list-item">
                                    <div className="user-info">
                                        <img src={user.profile_image || "/default-avatar.png"} alt="" className="user-icon-sm" />
                                        <div>
                                            <p className="user-name">
                                                {user.display_name} (@{user.user_id})
                                                {user.is_secretary && <span className="secretary-badge">事務局</span>}
                                            </p>
                                            <p className="user-meta">
                                                Team: {user.team} | Pts: {user.points}
                                                {user.shop_name && <> | {user.shop_name}</>}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleEditClick(user)} className="edit-btn">編集</button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="edit-form">
                            <button onClick={() => setEditing(false)} className="back-btn">← 戻る</button>
                            <h3>ユーザー編集: {selectedUser.user_id}</h3>

                            <div className="form-group">
                                <label>表示名</label>
                                <input
                                    value={formData.display_name}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>ポイント</label>
                                <input
                                    type="number"
                                    value={formData.points}
                                    onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>チーム</label>
                                <select
                                    value={formData.team}
                                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                                >
                                    <option value="">未設定</option>
                                    <option value="shop">Pixel-Shop</option>
                                    <option value="event">Pixel-Event</option>
                                    <option value="training">Pixel-Training</option>
                                </select>
                            </div>

                            {formData.team === "shop" && (
                                <div className="form-group">
                                    <label>店舗</label>
                                    <select
                                        value={formData.shop_name}
                                        onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                                    >
                                        <option value="">未設定</option>
                                        <option value="ヨドバシカメラ マルチメディアAkiba">ヨドバシカメラ マルチメディアAkiba</option>
                                        <option value="ヨドバシカメラ マルチメディア横浜">ヨドバシカメラ マルチメディア横浜</option>
                                        <option value="ヨドバシカメラ マルチメディア梅田">ヨドバシカメラ マルチメディア梅田</option>
                                        <option value="ヨドバシカメラ マルチメディア京都">ヨドバシカメラ マルチメディア京都</option>
                                        <option value="ヨドバシカメラ マルチメディア博多">ヨドバシカメラ マルチメディア博多</option>
                                        <option value="ヨドバシカメラ マルチメディア仙台">ヨドバシカメラ マルチメディア仙台</option>
                                        <option value="ヨドバシカメラ新宿西口本店">ヨドバシカメラ新宿西口本店</option>
                                        <option value="ヨドバシカメラ マルチメディア吉祥寺">ヨドバシカメラ マルチメディア吉祥寺</option>
                                        <option value="ヨドバシカメラ マルチメディア川崎ルフロン">ヨドバシカメラ マルチメディア川崎ルフロン</option>
                                        <option value="ヨドバシカメラ マルチメディア札幌">ヨドバシカメラ マルチメディア札幌</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group-checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_secretary}
                                        onChange={(e) => setFormData({ ...formData, is_secretary: e.target.checked })}
                                    />
                                    <span style={{ marginLeft: "8px" }}>事務局として設定する</span>
                                </label>
                            </div>

                            <div className="form-group">
                                <label>プロフィール画像</label>
                                <input type="file" onChange={handleImageUpload} />
                                {uploading ? <p>アップロード中...</p> : (
                                    formData.profile_image && <img src={formData.profile_image} className="preview-img" alt="preview" />
                                )}
                            </div>

                            <div className="form-group">
                                <label>バッジ管理</label>
                                <div className="badge-select-list">
                                    {badges.map((badge) => (
                                        <div
                                            key={badge.id}
                                            className={`badge-select-item ${formData.badge_ids.includes(badge.id) ? "selected" : ""}`}
                                            onClick={() => handleBadgeToggle(badge.id)}
                                        >
                                            <img src={badge.image_url} alt="" />
                                            <span>{badge.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button onClick={handleSave} className="save-btn-primary">保存する</button>
                        </div>
                    )}
                </div>
                <Navigation activeTab="mypage" />
            </div>
        </div>
    );
};

export default UserAdminPage;
