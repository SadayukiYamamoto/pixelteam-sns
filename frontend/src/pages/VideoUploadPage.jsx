import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase"; // ✅ firebase.js から storage をインポート
import axios from "axios";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import { v4 as uuidv4 } from 'uuid'; // ID生成用

const VideoUploadPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("video-upload");

    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    // ファイル選択ハンドラ
    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleThumbChange = (e) => {
        if (e.target.files[0]) {
            setThumbFile(e.target.files[0]);
        }
    };

    // アップロード処理
    const handleUpload = async () => {
        if (!file || !title) return alert("タイトルとファイルを選択してください");

        setUploading(true);

        try {
            const videoId = uuidv4();

            // 1. サムネイルのアップロード (あれば)
            let thumbUrl = "";
            if (thumbFile) {
                const thumbRef = ref(storage, `thumbnails/${videoId}/${thumbFile.name}`);
                const thumbTask = await uploadBytesResumable(thumbRef, thumbFile);
                thumbUrl = await getDownloadURL(thumbTask.ref);
            }

            // 2. 動画のアップロード
            const storageRef = ref(storage, `videos/${videoId}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const progress = Math.round(
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    );
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload Error:", error);
                    alert("アップロードに失敗しました");
                    setUploading(false);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // 3. Django API にメタデータを送信
                    await saveVideoMetadata(videoId, title, downloadURL, thumbUrl);
                }
            );

        } catch (error) {
            console.error(error);
            alert("エラーが発生しました");
            setUploading(false);
        }
    };

    // Djangoへの保存
    const saveVideoMetadata = async (id, title, url, thumbUrl) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "/api/videos/create/",
                {
                    id: id,
                    title: title,
                    video_url: url,
                    duration: "0:00",
                    thumb: thumbUrl
                },
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );

            alert("動画をアップロードしました！");
            navigate("/videos");

        } catch (error) {
            console.error("Metadata Save Error:", error);
            alert("データの保存に失敗しました");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            <Header />
            <div className="max-w-3xl mx-auto p-6 pt-10">
                <h2 className="text-2xl font-bold mb-8 text-gray-800">動画アップロード</h2>

                <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border-none">

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">動画タイトル</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="タイトルを入力"
                            className="w-full bg-gray-50/50 border-none rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-green-400/20 transition outline-none font-bold text-gray-700 placeholder-gray-400 shadow-inner"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">動画ファイル</label>
                        <div className="bg-gray-50/50 border-none rounded-xl p-6 text-center hover:bg-gray-100 transition relative shadow-inner">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-gray-500 font-bold">
                                {file ? file.name : "動画ファイルを選択 (クリックまたはドラッグ)"}
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 mb-2">サムネイル (任意)</label>
                        <div className="bg-gray-50/50 border-none rounded-xl p-6 text-center hover:bg-gray-100 transition relative shadow-inner">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="text-gray-500 font-bold">
                                {thumbFile ? thumbFile.name : "サムネイル画像を選択"}
                            </div>
                        </div>
                    </div>

                    {uploading && (
                        <div className="mb-6">
                            <p className="text-sm font-bold text-gray-600 mb-2">アップロード中: {uploadProgress}%</p>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className={`w-full py-4 text-white font-bold rounded-full shadow-lg transition transform hover:-translate-y-0.5 border-none outline-none focus:ring-0 text-lg ${uploading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 hover:shadow-xl"
                            }`}
                    >
                        {uploading ? "送信中..." : "アップロード"}
                    </button>

                </div>
            </div>

            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
};

export default VideoUploadPage;
