import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaGamepad, FaEdit, FaPlus, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

export default function TestManagementPage() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/admin/videos/list/", {
                headers: { Authorization: `Token ${token}` },
            });
            setVideos(res.data);
        } catch (e) {
            console.error("Error fetching videos:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            <Header />
            <div className="max-w-7xl mx-auto p-6 pt-10">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <FaGamepad />
                        </span>
                        テスト管理
                    </h2>
                    <Link
                        to="/tests/create"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        <FaPlus /> 新規作成
                    </Link>
                </div>

                <div className="bg-white rounded-[32px] shadow-lg border-none overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4 w-1/4">サムネイル</th>
                                <th className="p-4 w-1/3">動画タイトル</th>
                                <th className="p-4 w-1/6 text-center">ステータス</th>
                                <th className="p-4 w-1/6 text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {videos.map((video) => (
                                <tr key={video.id} className="hover:bg-green-50/10 transition-colors">
                                    <td className="p-4">
                                        {video.thumb ? (
                                            <img
                                                src={video.thumb}
                                                alt={video.title}
                                                className="w-32 h-20 object-cover rounded-lg shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-gray-800 text-lg mb-1">{video.title}</div>
                                        <div className="text-xs text-gray-400 font-mono">ID: {video.id}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        {video.has_test ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                                <FaCheckCircle /> 作成済み
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                                                <FaTimesCircle /> 未作成
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => navigate(`/tests/edit/${video.id}`)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-colors font-bold shadow-sm"
                                        >
                                            <FaEdit className="text-green-500" />
                                            {video.has_test ? "編集" : "作成"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {videos.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-gray-400">
                                        動画が見つかりません
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
}
