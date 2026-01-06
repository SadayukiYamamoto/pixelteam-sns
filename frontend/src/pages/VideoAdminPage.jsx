import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // 統合された firebase.js からインポート

const VideoAdminPage = () => {
    const [videos, setVideos] = useState([]);
    const [editingVideo, setEditingVideo] = useState(null);
    const [thumbFile, setThumbFile] = useState(null); // サムネイル用ファイル
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("admin");

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await axios.get("/api/videos/");
            // 降順ソート
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setVideos(sorted);
        } catch (error) {
            console.error("動画取得エラー", error);
        }
    };

    const handleEditClick = (video) => {
        setEditingVideo({ ...video, category: video.category || "" });
        setThumbFile(null); // ファイル選択リセット
    };

    const handleThumbChange = (e) => {
        if (e.target.files[0]) {
            setThumbFile(e.target.files[0]);
        }
    };

    const handleUpdate = async () => {
        setUploading(true);
        try {
            let thumbUrl = editingVideo.thumb;

            // 1. もし新しいサムネイルが選択されていればアップロード
            if (thumbFile) {
                const storageRef = ref(storage, `thumbnails/${editingVideo.id}/${thumbFile.name}`);
                const uploadTask = await uploadBytesResumable(storageRef, thumbFile);
                thumbUrl = await getDownloadURL(uploadTask.ref);
            }

            // 2. Django API バックエンド更新
            const token = localStorage.getItem("token");
            await axios.put(
                `/api/videos/${editingVideo.id}/update/`,
                { ...editingVideo, thumb: thumbUrl },
                { headers: { Authorization: `Token ${token}` } }
            );

            alert("更新しました！");
            setEditingVideo(null);
            setThumbFile(null);
            fetchVideos(); // リロード
        } catch (error) {
            console.error("更新エラー", error);
            alert("更新に失敗しました");
        } finally {
            setUploading(false);
        }
    };

    const handleToggleFeatured = async (video) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `/api/admin/videos/${video.id}/toggle_featured/`,
                {},
                { headers: { Authorization: `Token ${token}` } }
            );
            fetchVideos(); // リロードして反映
        } catch (error) {
            console.error("注目フラグ更新エラー", error);
            alert("更新に失敗しました。管理者権限が必要です。");
        }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm("この動画を削除しますか？\n（Firestoreと連携して完全に削除されます）")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`/api/videos/${videoId}/`, {
                headers: { Authorization: `Token ${token}` }
            });
            alert("動画を削除しました！");
            fetchVideos(); // リスト更新
        } catch (error) {
            console.error("削除エラー", error);
            alert("削除に失敗しました");
        }
    };

    return (
        <div className="home-container">
            <div className="home-wrapper">
                <Header />
                <div style={{ padding: "20px", paddingBottom: "100px", flex: 1, overflowY: "auto" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>動画管理画面</h2>

                    {/* 編集フォーム（モーダル風） */}
                    {editingVideo && (
                        <div style={{
                            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                            background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                        }}>
                            <div style={{ background: "white", padding: "24px", borderRadius: "12px", width: "90%", maxWidth: "500px" }}>
                                <h3 style={{ marginBottom: "16px", fontWeight: "bold" }}>動画編集</h3>

                                <label style={{ display: "block", marginBottom: "8px" }}>タイトル</label>
                                <input
                                    type="text"
                                    value={editingVideo.title}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                    style={{ width: "100%", padding: "8px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "4px" }}
                                />

                                <label style={{ display: "block", marginBottom: "8px" }}>カテゴリ (例: おすすめ, チュートリアル)</label>
                                <input
                                    type="text"
                                    value={editingVideo.category}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                                    style={{ width: "100%", padding: "8px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "4px" }}
                                />

                                <label style={{ display: "block", marginBottom: "8px" }}>現在のサムネイル</label>
                                {editingVideo.thumb ? (
                                    <img src={editingVideo.thumb} alt="thumb" style={{ width: "100%", maxHeight: "150px", objectFit: "cover", marginBottom: "12px", borderRadius: "4px" }} />
                                ) : (
                                    <p style={{ marginBottom: "12px", color: "#888" }}>画像なし</p>
                                )}

                                <label style={{ display: "block", marginBottom: "8px" }}>サムネイル変更 (選択すると上書き)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbChange}
                                    style={{ width: "100%", padding: "8px", marginBottom: "16px" }}
                                />

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                    <button
                                        onClick={() => setEditingVideo(null)}
                                        disabled={uploading}
                                        style={{ padding: "8px 16px", background: "#ccc", borderRadius: "4px", border: "none" }}
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={uploading}
                                        style={{ padding: "8px 16px", background: uploading ? "#999" : "#4f46e5", color: "white", borderRadius: "4px", border: "none" }}
                                    >
                                        {uploading ? "更新中..." : "保存"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 動画リスト */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {videos.map((video) => (
                            <div key={video.id} style={{ display: "flex", gap: "12px", background: "white", padding: "12px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                                <img src={video.thumb} alt="" style={{ width: "100px", height: "56px", objectFit: "cover", borderRadius: "4px", background: "#eee" }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>{video.title}</p>
                                    <p style={{ fontSize: "12px", color: "#666" }}>Cat: {video.category || "未設定"}</p>
                                </div>
                                <button
                                    onClick={() => handleToggleFeatured(video)}
                                    style={{
                                        padding: "8px 12px",
                                        background: video.is_featured ? "#facc15" : "#eee",
                                        color: video.is_featured ? "#000" : "#000",
                                        borderRadius: "4px",
                                        border: "none",
                                        alignSelf: "center",
                                        fontSize: "12px",
                                        marginRight: "8px"
                                    }}
                                >
                                    {video.is_featured ? "★ 注目中" : "☆ 注目にする"}
                                </button>
                                <button
                                    onClick={() => handleEditClick(video)}
                                    style={{ padding: "8px 12px", background: "#eee", borderRadius: "4px", border: "none", alignSelf: "center", fontSize: "12px" }}
                                >
                                    編集
                                </button>
                                <button
                                    onClick={() => handleDelete(video.id)}
                                    style={{ padding: "8px 12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "4px", border: "none", alignSelf: "center", fontSize: "12px", marginLeft: "4px" }}
                                >
                                    削除
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
                <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
    );
};

export default VideoAdminPage;
