import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { FiEdit3, FiTrash2, FiStar, FiPlusCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../admin/AdminCommon.css";

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

                    <div className="premium-card">
                        <div className="premium-table-container">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th className="w-48">サムネイル</th>
                                        <th>動画タイトル & カテゴリ</th>
                                        <th className="text-center w-32">注目設定</th>
                                        <th className="text-right w-48">操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {videos.map((video) => (
                                        <tr key={video.id}>
                                            <td>
                                                <div className="relative group overflow-hidden rounded-2xl shadow-sm bg-gray-100 aspect-video">
                                                    <img
                                                        src={video.thumb}
                                                        alt=""
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                    {video.is_featured && (
                                                        <div className="absolute top-2 left-2 bg-yellow-400 text-black p-1.5 rounded-lg shadow-md">
                                                            <FiStar size={12} fill="currentColor" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-black text-gray-800 text-base mb-1">{video.title}</div>
                                                <div className="inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md text-[10px] font-black uppercase tracking-widest border border-gray-100">
                                                    {video.category || "GENERAL"}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    onClick={() => handleToggleFeatured(video)}
                                                    className={`p-3 rounded-xl transition-all border-none active:scale-90 ${video.is_featured
                                                            ? "bg-yellow-50 text-yellow-600 shadow-inner"
                                                            : "bg-gray-50 text-gray-300 hover:text-gray-400"
                                                        }`}
                                                    title={video.is_featured ? "注目解除" : "注目に設定"}
                                                >
                                                    <FiStar size={20} fill={video.is_featured ? "currentColor" : "none"} />
                                                </button>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(video)}
                                                        className="p-3 text-gray-400 hover:text-accent bg-gray-50/50 hover:bg-white rounded-xl transition-all border-none shadow-sm hover:shadow-md"
                                                    >
                                                        <FiEdit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(video.id)}
                                                        className="p-3 text-gray-400 hover:text-red-500 bg-gray-50/50 hover:bg-white rounded-xl transition-all border-none shadow-sm hover:shadow-md"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {videos.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-24 text-center text-gray-300 font-black uppercase tracking-widest">
                                                No videos found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* 編集モーダル */}
            {editingVideo && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto transform transition-all border border-white/20">
                        <header className="mb-8 text-center">
                            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-widest">Edit Video</h3>
                            <p className="text-gray-400 text-sm font-bold mt-2">動画情報の更新</p>
                        </header>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">動画タイトル</label>
                                <input
                                    type="text"
                                    value={editingVideo.title}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all outline-none font-bold text-gray-700 shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest ml-1">カテゴリ</label>
                                <input
                                    type="text"
                                    value={editingVideo.category}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all outline-none font-bold text-gray-700 shadow-inner"
                                    placeholder="おすすめ, チュートリアル..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest ml-1">サムネイル</label>
                                <div className="space-y-4">
                                    <div className="aspect-video rounded-3xl overflow-hidden bg-gray-100 shadow-inner">
                                        <img src={editingVideo.thumb} alt="Current" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleThumbChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="w-full bg-gray-50 hover:bg-white border-2 border-dashed border-gray-100 p-6 rounded-2xl text-center transition-all group-hover:border-accent">
                                            <span className="text-sm font-bold text-gray-400 group-hover:text-accent transition-colors">
                                                {thumbFile ? thumbFile.name : "サムネイルを変更（クリックで選択）"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-8 border-t border-gray-50 mt-10">
                                <button
                                    onClick={() => setEditingVideo(null)}
                                    className="px-8 py-4 text-gray-400 font-black rounded-2xl transition-all border-none hover:bg-gray-50 uppercase tracking-widest text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={uploading}
                                    className="px-12 py-4 bg-accent hover:bg-lime-500 text-white font-black rounded-2xl shadow-xl shadow-lime-200/50 hover:shadow-2xl transition-all active:scale-95 border-none uppercase tracking-widest text-xs"
                                >
                                    {uploading ? "Uploading..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Navigation activeTab="mypage" />
        </div>
    );
};

export default VideoAdminPage;
