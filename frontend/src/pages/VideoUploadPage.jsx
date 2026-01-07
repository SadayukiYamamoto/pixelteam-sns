import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import axios from "axios";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { v4 as uuidv4 } from 'uuid';
import { FiUploadCloud, FiCheck } from 'react-icons/fi';
import "./VideoUploadPage.css";

const VideoUploadPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) setFile(e.target.files[0]);
    };

    const handleThumbChange = (e) => {
        if (e.target.files[0]) setThumbFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file || !title) return alert("タイトルとファイルを選択してください");
        setUploading(true);
        try {
            const videoId = uuidv4();
            let thumbUrl = "";
            if (thumbFile) {
                const thumbRef = ref(storage, `thumbnails/${videoId}/${thumbFile.name}`);
                const thumbTask = await uploadBytesResumable(thumbRef, thumbFile);
                thumbUrl = await getDownloadURL(thumbTask.ref);
            }

            const storageRef = ref(storage, `videos/${videoId}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload Error:", error);
                    alert("アップロードに失敗しました");
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await saveVideoMetadata(videoId, title, downloadURL, thumbUrl);
                }
            );
        } catch (error) {
            console.error(error);
            alert("エラーが発生しました");
            setUploading(false);
        }
    };

    const saveVideoMetadata = async (id, title, url, thumbUrl) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "/api/videos/create/",
                { id, title, video_url: url, duration: "0:00", thumb: thumbUrl },
                { headers: { Authorization: `Token ${token}` } }
            );
            alert("動画をアップロードしました！");
            navigate("/admin/videos");
        } catch (error) {
            console.error("Metadata Save Error:", error);
            alert("データの保存に失敗しました");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="video-upload-container">
            <Header />
            <div className="video-upload-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="video-upload-header">
                        <h1>動画アップロード</h1>
                    </header>

                    <div className="upload-card">
                        <div className="upload-form">
                            {/* タイトル */}
                            <div className="input-group">
                                <label>動画タイトル</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="タイトルを入力"
                                    className="premium-text-input"
                                />
                            </div>

                            {/* 動画ファイル */}
                            <div className="input-group">
                                <label>動画ファイル</label>
                                <div className="file-drop-zone">
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                    />
                                    <span className="file-drop-label">
                                        {file ? (
                                            <span className="flex items-center gap-2 text-green-600">
                                                <FiCheck /> {file.name}
                                            </span>
                                        ) : "動画ファイルを選択 (クリックまたはドラッグ)"}
                                    </span>
                                </div>
                            </div>

                            {/* サムネイル */}
                            <div className="input-group">
                                <label>サムネイル (任意)</label>
                                <div className="file-drop-zone thumb-drop-zone">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbChange}
                                    />
                                    <span className="file-drop-label">
                                        {thumbFile ? (
                                            <span className="flex items-center gap-2 text-green-600">
                                                <FiCheck /> {thumbFile.name}
                                            </span>
                                        ) : "サムネイル画像を選択"}
                                    </span>
                                </div>
                            </div>

                            {/* 進捗表示 */}
                            {uploading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="progress-container"
                                >
                                    <div className="progress-header">
                                        <span className="progress-label">アップロード中...</span>
                                        <span className="progress-value">{uploadProgress}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </motion.div>
                            )}

                            {/* アップロードボタン */}
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="upload-btn-large"
                            >
                                {uploading ? "アップロード中..." : "アップロード"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default VideoUploadPage;
