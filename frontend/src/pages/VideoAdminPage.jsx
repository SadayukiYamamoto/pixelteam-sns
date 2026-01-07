import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FiEdit3, FiTrash2, FiStar, FiPlusCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../admin/AdminCommon.css";

const CATEGORIES = [
    "Pixel 基礎知識",
    "Pixel 応用知識",
    "接客初級編",
    "接客中級編",
    "接客上級編",
    "ポートフォリオ基礎知識",
    "ポーチフォリオ応用知識",
    "コミュニケーション初級技術",
    "コミュニケーション中級技術",
    "コミュニケーション上級技術"
];

const VideoAdminPage = () => {
    const [videos, setVideos] = useState([]);
    const [editingVideo, setEditingVideo] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await axios.get("/api/videos/");
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setVideos(sorted);
        } catch (error) {
            console.error("動画取得エラー", error);
        }
    };

    const handleEditClick = (video) => {
        setEditingVideo({ ...video, category: video.category || "" });
        setThumbFile(null);
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

            if (thumbFile) {
                const storageRef = ref(storage, `thumbnails/${editingVideo.id}/${thumbFile.name}`);
                const uploadTask = await uploadBytesResumable(storageRef, thumbFile);
                thumbUrl = await getDownloadURL(uploadTask.ref);
            }

            const token = localStorage.getItem("token");
            await axios.put(
                `/api/videos/${editingVideo.id}/update/`,
                { ...editingVideo, thumb: thumbUrl },
                { headers: { Authorization: `Token ${token}` } }
            );

            alert("更新しました！");
            setEditingVideo(null);
            setThumbFile(null);
            fetchVideos();
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
            fetchVideos();
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
            fetchVideos();
        } catch (error) {
            console.error("削除エラー", error);
            alert("削除に失敗しました");
        }
    };

    return (
        <div className="admin-page-container">
            <Header />
            <div className="admin-wrapper">
                <div className="admin-page-content">
                    <header className="admin-page-header">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1>動画管理</h1>
                                <p>投稿済みの動画の編集、削除、注目設定を行います。</p>
                            </div>
                            <button
                                onClick={() => navigate("/video/upload")}
                                className="bg-accent hover:bg-lime-500 text-white font-black py-4 px-8 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-2 border-none uppercase tracking-widest text-xs"
                            >
                                <FiPlusCircle size={20} />
                                新規動画アップロード
                            </button>
                        </div>
                    </header>

                    <div className="video-admin-card-list">
                        {videos.map((video) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="video-admin-card"
                            >
                                <div className="video-card-left">
                                    <div className="video-card-thumb">
                                        <img src={video.thumb} alt="" />
                                    </div>
                                    <div className="video-card-info">
                                        <h2 className="video-card-title">{video.title}</h2>
                                        <p className="video-card-category">Cat: {video.category || "未設定"}</p>
                                    </div>
                                </div>

                                <div className="video-card-actions">
                                    <button
                                        onClick={() => handleToggleFeatured(video)}
                                        className={`action-btn-star ${video.is_featured ? 'is-featured' : ''}`}
                                    >
                                        <FiStar size={16} fill={video.is_featured ? "currentColor" : "none"} />
                                        <span>{video.is_featured ? "注目中" : "注目にする"}</span>
                                    </button>

                                    <button
                                        onClick={() => handleEditClick(video)}
                                        className="action-btn-edit"
                                    >
                                        <span>編集</span>
                                    </button>

                                    <button
                                        onClick={() => handleDelete(video.id)}
                                        className="action-btn-delete"
                                    >
                                        <span>削除</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {videos.length === 0 && (
                            <div className="p-24 text-center text-gray-300 font-black uppercase tracking-widest">
                                No videos found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 編集モーダル */}
            <AnimatePresence>
                {editingVideo && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="edit-modal-card"
                        >
                            <h2 className="edit-modal-title">動画編集</h2>

                            <div className="modal-field">
                                <label>タイトル</label>
                                <input
                                    type="text"
                                    value={editingVideo.title}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                />
                            </div>

                            <div className="modal-field">
                                <label>カテゴリ</label>
                                <select
                                    value={editingVideo.category}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                                    className="modal-select"
                                >
                                    <option value="">カテゴリを選択してください</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-field">
                                <label>現在のサムネイル</label>
                                <div className="current-thumb-preview">
                                    <img src={editingVideo.thumb} alt="" />
                                </div>
                            </div>

                            <div className="modal-field">
                                <label>サムネイル変更 (選択すると上書き)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbChange}
                                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-slate-700 hover:file:bg-gray-200"
                                />
                            </div>

                            <div className="modal-footer">
                                <button
                                    onClick={() => setEditingVideo(null)}
                                    className="btn-modal-cancel"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={uploading}
                                    className="btn-modal-save"
                                >
                                    {uploading ? "保存中..." : "保存"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Navigation activeTab="mypage" />
        </div>
    );
};

export default VideoAdminPage;
