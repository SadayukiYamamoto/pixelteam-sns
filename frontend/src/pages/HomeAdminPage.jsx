import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, Plus, ExternalLink, Play, CheckCircle, Circle, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app, auth } from "../firebase";
import { signInAnonymously } from "firebase/auth";
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import './HomeAdminPage.css';

const HomeAdminPage = () => {
    const [officeNews, setOfficeNews] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 事務局だよりの入力用
    const [newNews, setNewNews] = useState({ title: '', external_url: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // 変更があったかどうかを管理（UI表示用）
    const [hasChanges, setHasChanges] = useState(false);
    const [pendingDeletions, setPendingDeletions] = useState([]);

    const token = localStorage.getItem('token');
    const API_BASE = '/api';
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [newsRes, videoRes] = await Promise.all([
                axios.get(`${API_BASE}/office_news/`, { headers: { Authorization: `Token ${token}` } }),
                axios.get(`${API_BASE}/videos/`, { headers: { Authorization: `Token ${token}` } })
            ]);
            setOfficeNews(newsRes.data);
            setVideos(videoRes.data);
            setHasChanges(false);
            setPendingDeletions([]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddNewsDraft = (e) => {
        e.preventDefault();
        // ローカルIDを一時的に付与
        const draftItem = {
            id: `draft-${Date.now()}`,
            title: newNews.title,
            external_url: newNews.external_url,
            thumbnail_file: imageFile,
            thumbnail_preview: imagePreview,
            isDraft: true
        };
        setOfficeNews([draftItem, ...officeNews]);
        setNewNews({ title: '', external_url: '' });
        setImageFile(null);
        setImagePreview(null);
        setHasChanges(true);
    };

    const handleDeleteNewsDraft = (id) => {
        if (String(id).startsWith('draft-')) {
            setOfficeNews(officeNews.filter(n => n.id !== id));
        } else {
            setPendingDeletions([...pendingDeletions, id]);
            setOfficeNews(officeNews.filter(n => n.id !== id));
        }
        setHasChanges(true);
    };

    const toggleShortDraft = (videoId) => {
        setVideos(videos.map(v =>
            v.id === videoId ? { ...v, is_short: !v.is_short, isModified: true } : v
        ));
        setHasChanges(true);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            // 1. 削除処理
            for (const id of pendingDeletions) {
                await axios.delete(`${API_BASE}/office_news/${id}/`, {
                    headers: { Authorization: `Token ${token}` }
                });
            }

            // 2. 新規作成処理
            const drafts = officeNews.filter(n => n.isDraft);
            for (const n of drafts) {
                let finalThumbUrl = n.thumbnail_preview || "";

                if (n.thumbnail_file) {
                    // Firebase Storage にアップロード
                    if (!auth.currentUser) {
                        await signInAnonymously(auth);
                    }
                    const storage = getStorage(app);
                    const fileRef = ref(storage, `office_news/${Date.now()}_${n.thumbnail_file.name}`);
                    await uploadBytes(fileRef, n.thumbnail_file);
                    finalThumbUrl = await getDownloadURL(fileRef);
                }

                await axios.post(`${API_BASE}/office_news/`, {
                    title: n.title,
                    external_url: n.external_url,
                    thumbnail: finalThumbUrl
                }, {
                    headers: {
                        Authorization: `Token ${token}`
                    }
                });
            }

            // 3. 動画ステータス更新
            const modifiedVideos = videos.filter(v => v.isModified);
            for (const v of modifiedVideos) {
                await axios.post(`${API_BASE}/admin/videos/${v.id}/toggle_short/`, {}, {
                    headers: { Authorization: `Token ${token}` }
                });
            }

            alert('変更を保存しました！');
            await fetchData();
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('保存中にエラーが発生しました。');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="admin-loading">読み込み中...</div>;

    return (
        <div className="home-container">
            <div className="admin-wrapper">
                <Header />
                <div className="max-w-7xl mx-auto p-4 md:p-10">
                    <header className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">ホーム管理</h1>
                        <button
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${hasChanges ? 'bg-[#84cc16] text-white shadow-lg shadow-lime-200/50 hover:shadow-xl' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            onClick={handleSaveAll}
                            disabled={!hasChanges || saving}
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            {saving ? '保存中...' : 'すべての変更を保存'}
                        </button>
                    </header>

                    <section className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <span className="p-2 bg-lime-100 text-[#84cc16] rounded-lg">
                                <Plus size={20} />
                            </span>
                            事務局だよりの管理
                        </h2>
                        <form className="news-form" onSubmit={handleAddNewsDraft}>
                            <div className="form-inputs">
                                <input
                                    type="text"
                                    placeholder="タイトル"
                                    value={newNews.title}
                                    onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                                    required
                                />
                                <input
                                    type="url"
                                    placeholder="遷移先URL"
                                    value={newNews.external_url}
                                    onChange={(e) => setNewNews({ ...newNews, external_url: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="image-upload-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                />
                                <div
                                    className="image-dropzone"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="upload-preview" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <ImageIcon size={32} />
                                            <span>サムネイルを選択</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button type="submit" className="add-btn bg-[#84cc16] hover:bg-[#a3e635] text-white shadow-lg shadow-lime-200/50">
                                <Plus size={20} /> 追加
                            </button>
                        </form>

                        <div className="news-list">
                            {officeNews.map((news) => (
                                <div key={news.id} className={`news-card ${news.isDraft ? 'draft' : ''}`}>
                                    {(news.thumbnail || news.thumbnail_preview) && (
                                        <img src={news.thumbnail || news.thumbnail_preview} alt="" className="news-thumb" />
                                    )}
                                    {!news.thumbnail && !news.thumbnail_preview && (
                                        <div className="news-thumb-placeholder"><ImageIcon size={20} /></div>
                                    )}
                                    <div className="news-info min-w-0">
                                        <h3 className="truncate font-bold text-gray-800">{news.title} {news.isDraft && <span className="draft-badge bg-[#84cc16]">新規</span>}</h3>
                                        <a href={news.external_url} target="_blank" rel="noopener noreferrer" className="text-[#84cc16] break-all block text-xs hover:underline mt-1">
                                            <ExternalLink size={12} className="inline mr-1" /> {news.external_url}
                                        </a>
                                    </div>
                                    <button className="delete-btn text-red-400 hover:text-red-500" onClick={() => handleDeleteNewsDraft(news.id)}>
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Play size={20} />
                            </span>
                            ショート動画の選択
                        </h2>
                        <p className="text-gray-500 text-sm mb-6 ml-12">ホームに表示するショート動画を選択してください。</p>
                        <div className="video-scroll-list">
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    className={`video-card ${video.is_short ? 'selected ring-2 ring-[#84cc16]' : ''} ${video.isModified ? 'modified' : ''}`}
                                    onClick={() => toggleShortDraft(video.id)}
                                >
                                    <div className="video-thumb-wrapper">
                                        <img src={video.thumb} alt={video.title} />
                                        {video.is_short && <div className="video-overlay"><CheckCircle color="white" fill="#84cc16" /></div>}
                                        {!video.is_short && <div className="video-overlay"><Circle color="white" /></div>}
                                    </div>
                                    <div className="video-info p-3">
                                        <p className="video-title text-sm font-bold text-gray-700 line-clamp-2">{video.title}</p>
                                        <p className="video-author text-xs text-gray-400 mt-1">{video.user}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            <Navigation activeTab="mypage" />
        </div>
    );
};

export default HomeAdminPage;
