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
                    <header className="home-admin-header">
                        <h1 className="home-admin-title">ホーム管理</h1>
                        <button
                            className={`save-all-btn ${hasChanges ? 'active' : ''}`}
                            onClick={handleSaveAll}
                            disabled={!hasChanges || saving}
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? '保存中...' : 'すべての変更を保存'}
                        </button>
                    </header>

                    <section className="admin-content-section">
                        <div className="section-header">
                            <div className="section-icon-bg news-accent">
                                <Plus size={20} />
                            </div>
                            <h2 className="section-title">事務局だよりの管理</h2>
                        </div>

                        <div className="form-card-container">
                            <form className="news-management-form" onSubmit={handleAddNewsDraft}>
                                <div className="form-fields">
                                    <div className="input-group">
                                        <label>タイトル</label>
                                        <input
                                            type="text"
                                            value={newNews.title}
                                            onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                                            placeholder="タイトルを入力"
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>遷移先URL</label>
                                        <input
                                            type="url"
                                            value={newNews.external_url}
                                            onChange={(e) => setNewNews({ ...newNews, external_url: e.target.value })}
                                            placeholder="https://..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="thumbnail-upload-section">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                    />
                                    <div
                                        className="thumbnail-picker-card"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="picker-preview" />
                                        ) : (
                                            <div className="picker-placeholder">
                                                <ImageIcon size={24} />
                                                <span>サムネイルを設定</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" className="add-draft-btn">
                                    <Plus size={20} /> 追加
                                </button>
                            </form>

                            <div className="current-news-list">
                                {officeNews.map((news) => (
                                    <div key={news.id} className={`news-item-row ${news.isDraft ? 'is-draft' : ''}`}>
                                        <div className="item-icon-logo">
                                            {news.thumbnail || news.thumbnail_preview ? (
                                                <img src={news.thumbnail || news.thumbnail_preview} alt="" />
                                            ) : (
                                                <div className="fallback-logo"><ImageIcon size={20} /></div>
                                            )}
                                        </div>
                                        <div className="item-details">
                                            <h3 className="item-title">
                                                {news.title}
                                                {news.isDraft && <span className="new-badge">新規</span>}
                                            </h3>
                                            <a href={news.external_url} target="_blank" rel="noopener noreferrer" className="item-url">
                                                <ExternalLink size={12} /> {news.external_url}
                                            </a>
                                        </div>
                                        <button className="item-remove-btn" onClick={() => handleDeleteNewsDraft(news.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="admin-content-section">
                        <div className="section-header">
                            <div className="section-icon-bg video-accent">
                                <Play size={20} fill="currentColor" />
                            </div>
                            <div className="section-header-text">
                                <h2 className="section-title">ショート動画の選択</h2>
                                <p className="section-subtitle">ホームに表示するショート動画を選択してください。</p>
                            </div>
                        </div>

                        <div className="video-grid-layout">
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    className={`video-selection-card ${video.is_short ? 'is-selected' : ''} ${video.isModified ? 'is-modified' : ''}`}
                                    onClick={() => toggleShortDraft(video.id)}
                                >
                                    <div className="video-preview-wrapper">
                                        <img src={video.thumb} alt={video.title} />
                                        <div className="selection-indicator">
                                            {video.is_short ? (
                                                <CheckCircle size={24} fill="#84cc16" color="white" />
                                            ) : (
                                                <Circle size={24} color="#CBD5E1" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="video-card-footer">
                                        <span className="v-author">事務局</span>
                                        <p className="v-title">{video.title}</p>
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
