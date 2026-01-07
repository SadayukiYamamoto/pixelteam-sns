import React, { useEffect, useState } from "react";
import axios from "axios";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import "./TaskManagementPage.css";

const ICON_OPTIONS = [
    "Mail", "User", "Settings", "HelpCircle", "FileText", "Calendar", "MessageCircle",
    "ShoppingBag", "CreditCard", "Truck", "MapPin", "Phone", "Globe", "Award", "Gift",
    "Camera", "Video", "Music", "Mic", "Bell", "Search", "Star", "Heart", "ThumbsUp",
    "BarChart2", "TrendingUp", "Bell", "Activity", "CheckSquare", "Clock", "Info"
];

const COLOR_OPTIONS = [
    { label: "黒", value: "text-gray-800", hex: "#1e293b" },
    { label: "赤", value: "text-red-500", hex: "#ef4444" },
    { label: "青", value: "text-blue-500", hex: "#3b82f6" },
    { label: "緑", value: "text-emerald-500", hex: "#10b981" },
    { label: "黄", value: "text-yellow-500", hex: "#f59e0b" },
    { label: "紫", value: "text-purple-500", hex: "#a855f7" },
    { label: "ピンク", value: "text-pink-500", hex: "#ec4899" },
    { label: "シアン", value: "text-cyan-500", hex: "#06b6d4" },
];

const TaskManagementPage = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("pixel-shop");
    const [editingTask, setEditingTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        url: "",
        icon_name: "Mail",
        color: "text-gray-800",
        category: "pixel-shop",
        parent_category: "",
        order: 0,
    });

    const fetchTasks = async () => {
        try {
            const res = await axios.get("/api/task_buttons/");
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            url: task.url || "",
            icon_name: task.icon_name,
            color: task.color,
            category: task.category,
            parent_category: task.parent_category,
            order: task.order,
        });
        setIsModalOpen(true);
    };

    const handleCreateNew = () => {
        setEditingTask(null);
        setFormData({
            title: "",
            url: "",
            icon_name: "Mail",
            color: "text-gray-800",
            category: selectedCategory,
            parent_category: "",
            order: 0,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Token ${token}` };

        try {
            if (editingTask) {
                await axios.put(`/api/task_buttons/${editingTask.id}/`, formData, { headers });
            } else {
                await axios.post("/api/task_buttons/", formData, { headers });
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert("エラーが発生しました: " + (err.response?.data?.error || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("本当に削除しますか？")) return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`/api/task_buttons/${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert("削除失敗");
        }
    };

    const filteredTasks = tasks.filter((t) => t.category === selectedCategory);

    // 既存のセクション一覧を取得
    const existingSections = [...new Set(tasks.map(t => t.parent_category).filter(Boolean))];

    return (
        <div className="task-mgmt-container">
            <Header />
            <div className="task-mgmt-wrapper">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="task-mgmt-header-row">
                        <h1>業務ボタン管理</h1>
                        <div className="task-cat-tabs-container">
                            <button
                                className={`task-cat-tab ${selectedCategory === "pixel-shop" ? "active" : ""}`}
                                onClick={() => handleCategoryChange("pixel-shop")}
                            >
                                Pixel-Shop
                            </button>
                            <button
                                className={`task-cat-tab ${selectedCategory === "pixel-event" ? "active" : ""}`}
                                onClick={() => handleCategoryChange("pixel-event")}
                            >
                                Pixel-Event
                            </button>
                        </div>
                    </div>

                    <div className="task-action-bar">
                        <button
                            onClick={handleCreateNew}
                            className="btn-add-task"
                        >
                            <LucideIcons.PlusCircle size={20} />
                            新規ボタン追加
                        </button>
                    </div>

                    <div className="task-list-container">
                        <AnimatePresence mode="popLayout">
                            {filteredTasks.map((task) => {
                                const Icon = LucideIcons[task.icon_name] || LucideIcons.HelpCircle;
                                return (
                                    <motion.div
                                        layout
                                        key={task.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="task-item-card"
                                    >
                                        <div className="task-item-left">
                                            <div className="task-icon-container">
                                                {(() => {
                                                    const iconColor = COLOR_OPTIONS.find(opt => opt.value === task.color)?.hex || '#1e293b';
                                                    return <Icon size={24} style={{ color: iconColor }} />;
                                                })()}
                                            </div>
                                            <div className="task-info-content">
                                                <span className="task-title-text">{task.title}</span>
                                                <span className="task-url-text">{task.url || "リンク未設定"}</span>
                                            </div>
                                        </div>
                                        <div className="task-item-actions">
                                            <button
                                                onClick={() => handleEdit(task)}
                                                className="btn-task-action"
                                            >
                                                <LucideIcons.Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="btn-task-action delete"
                                            >
                                                <LucideIcons.Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {filteredTasks.length === 0 && (
                            <div className="p-32 text-center text-gray-300 font-bold uppercase tracking-widest bg-white rounded-[40px] border-none shadow-sm">
                                登録されているボタンはありません
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* モーダル */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="task-modal-card"
                        >
                            <header className="task-modal-header">
                                <h2>{editingTask ? "ボタンの編集" : "新しいボタン"}</h2>
                            </header>

                            <form onSubmit={handleSubmit} className="task-modal-form">
                                <div className="task-form-group">
                                    <label>タイトル</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ボタン名"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="task-form-group">
                                    <label>URL</label>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <div className="task-form-group flex-1">
                                        <label>アイコン</label>
                                        <div className="select-wrapper">
                                            <select
                                                value={formData.icon_name}
                                                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                            >
                                                {ICON_OPTIONS.map(icon => (
                                                    <option key={icon} value={icon}>{icon}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="task-form-group flex-1">
                                        <label>色</label>
                                        <div className="select-wrapper">
                                            <select
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            >
                                                {COLOR_OPTIONS.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="task-preview-box">
                                    {(() => {
                                        const PreviewIcon = LucideIcons[formData.icon_name] || LucideIcons.HelpCircle;
                                        const previewColor = COLOR_OPTIONS.find(o => o.value === formData.color)?.hex || "#1e293b";
                                        return <PreviewIcon size={48} style={{ color: previewColor }} />;
                                    })()}
                                </div>

                                <div className="task-form-group">
                                    <label>カテゴリ</label>
                                    <div className="select-wrapper">
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="pixel-shop">Pixel-Shop</option>
                                            <option value="pixel-event">Pixel-Event</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="task-form-group">
                                    <label>セクション / グループ</label>
                                    <div className="select-wrapper mb-3">
                                        <select
                                            value={formData.parent_category}
                                            onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
                                        >
                                            <option value="">選択してください</option>
                                            {existingSections.map(sec => (
                                                <option key={sec} value={sec}>{sec}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="セクション名を直接入力"
                                        value={formData.parent_category}
                                        onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
                                    />
                                </div>

                                <div className="task-form-group">
                                    <label>表示順</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="task-modal-actions">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn-modal-cancel"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-modal-save"
                                    >
                                        保存する
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Navigation activeTab="mypage" />
        </div>
    );
};

export default TaskManagementPage;


