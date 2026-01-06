import React, { useEffect, useState } from "react";
import axios from "axios";
import * as LucideIcons from "lucide-react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

// 利用可能なアイコンのリスト (必要に応じて追加)
const ICON_OPTIONS = [
    "Mail", "User", "Settings", "HelpCircle", "FileText", "Calendar", "MessageCircle",
    "ShoppingBag", "CreditCard", "Truck", "MapPin", "Phone", "Globe", "Award", "Gift",
    "Camera", "Video", "Music", "Mic", "Bell", "Search", "Star", "Heart", "ThumbsUp"
];

const COLOR_OPTIONS = [
    { label: "黒", value: "text-gray-800" },
    { label: "赤", value: "text-red-500" },
    { label: "青", value: "text-blue-500" },
    { label: "緑", value: "text-green-500" },
    { label: "黄", value: "text-yellow-500" },
    { label: "紫", value: "text-purple-500" },
    { label: "ピンク", value: "text-pink-500" },
];

const TaskManagementPage = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("pixel-shop");
    const [editingTask, setEditingTask] = useState(null); // null = 新規作成モード or 非表示? 編集用オブジェクト
    const [isModalOpen, setIsModalOpen] = useState(false);

    // フォーム用 state
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        icon_name: "Mail",
        color: "text-gray-800",
        category: "pixel-shop",
        parent_category: "", // 追加
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
            parent_category: task.parent_category, // 追加
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
            category: selectedCategory, // カレントカテゴリを初期値に
            parent_category: "", // 初期値
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
                // 更新
                await axios.put(
                    `/api/task_buttons/${editingTask.id}/`,
                    formData,
                    { headers }
                );
            } else {
                // 新規作成
                await axios.post(
                    "/api/task_buttons/",
                    formData,
                    { headers }
                );
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert("エラーが発生しました: " + err.response?.data?.error || err.message);
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

    // 表示フィルタ
    const filteredTasks = tasks.filter((t) => t.category === selectedCategory);

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <Header />
            <div className="max-w-4xl mx-auto p-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">業務ボタン管理</h2>

                {/* カテゴリ切り替えタブ */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white p-1.5 rounded-full shadow-md inline-flex border-none">
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 border-none outline-none focus:outline-none focus:ring-0 ${selectedCategory === "pixel-shop"
                                ? "bg-green-500 text-white shadow-lg"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                            onClick={() => handleCategoryChange("pixel-shop")}
                        >
                            Pixel-Shop
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 border-none outline-none focus:outline-none focus:ring-0 ${selectedCategory === "pixel-event"
                                ? "bg-green-500 text-white shadow-lg"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                            onClick={() => handleCategoryChange("pixel-event")}
                        >
                            Pixel-Event
                        </button>
                    </div>
                </div>

                {/* 新規追加ボタン */}
                <div className="mb-6 text-right">
                    <button
                        onClick={handleCreateNew}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2 ml-auto border-none outline-none focus:ring-0"
                    >
                        <LucideIcons.PlusCircle size={20} />
                        新規ボタン追加
                    </button>
                </div>

                {/* リスト表示 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTasks.map((task) => {
                        const Icon = LucideIcons[task.icon_name] || LucideIcons.HelpCircle;
                        return (
                            <div
                                key={task.id}
                                className="bg-white p-4 rounded-2xl shadow-md border-none flex items-center justify-between hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 bg-gray-50 rounded-xl ${task.color} shadow-inner`}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{task.title}</h3>
                                        <p className="text-xs text-gray-400 truncate w-48">{task.url}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(task)}
                                        className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all border-none focus:outline-none"
                                        title="編集"
                                    >
                                        <LucideIcons.Edit3 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(task.id)}
                                        className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border-none focus:outline-none"
                                        title="削除"
                                    >
                                        <LucideIcons.Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {filteredTasks.length === 0 && (
                        <div className="col-span-2 text-center py-20 text-gray-400 font-bold bg-white rounded-3xl border-none shadow-xl shadow-gray-200/50">
                            まだボタンが登録されていません
                        </div>
                    )}
                </div>
            </div>

            {/* モーダル */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto transform transition-all">
                        <h3 className="text-2xl font-black text-center text-gray-800 mb-8 pb-4 border-b border-gray-50">
                            {editingTask ? "ボタンを編集" : "新しいボタン"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">タイトル</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-gray-50/50 border-none rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-green-400/20 transition-all outline-none font-bold text-gray-700 placeholder-gray-300 shadow-inner"
                                    placeholder="ボタン名"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50/50 border-none rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-green-400/20 transition-all outline-none text-gray-700 placeholder-gray-300 shadow-inner"
                                    placeholder="https://..."
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-2">アイコン</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50/50 border-none rounded-xl p-3.5 appearance-none focus:bg-white focus:ring-2 focus:ring-green-400/20 transition-all shadow-inner outline-none text-gray-700"
                                            value={formData.icon_name}
                                            onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                        >
                                            {ICON_OPTIONS.map(icon => (
                                                <option key={icon} value={icon}>{icon}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                            <LucideIcons.ChevronDown size={16} />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                                        {(() => {
                                            const PreviewIcon = LucideIcons[formData.icon_name] || LucideIcons.HelpCircle;
                                            return <PreviewIcon size={32} className={formData.color} />;
                                        })()}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-2">色</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50/50 border-none rounded-xl p-3.5 appearance-none focus:bg-white focus:ring-2 focus:ring-green-400/20 transition-all shadow-inner outline-none text-gray-700"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        >
                                            {COLOR_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                            <LucideIcons.ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">カテゴリ</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 appearance-none focus:bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition outline-none text-gray-700"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="pixel-shop">Pixel-Shop</option>
                                        <option value="pixel-event">Pixel-Event</option>
                                    </select>
                                    <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                        <LucideIcons.ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">セクション / グループ</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <select
                                            className="w-full bg-gray-50/50 border-none rounded-xl p-3.5 appearance-none focus:bg-white focus:ring-2 focus:ring-green-400/20 transition-all shadow-inner outline-none text-gray-700"
                                            value={formData.parent_category || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "__NEW__") {
                                                    setFormData({ ...formData, parent_category: "" });
                                                } else {
                                                    setFormData({ ...formData, parent_category: val });
                                                }
                                            }}
                                        >
                                            <option value="" disabled>選択してください</option>
                                            <option value="申請・報告">申請・報告</option>
                                            <option value="実績・確認">実績・確認</option>
                                            <option value="実績・管理">実績・管理</option>
                                            <option value="お知らせ・情報">お知らせ・情報</option>
                                            <option value="シフト・ツール">シフト・ツール</option>
                                            <option value="関連サイト">関連サイト</option>
                                            <option value="その他">その他</option>
                                            <option value="__NEW__">+ 新しいセクションを入力</option>
                                        </select>
                                        <div className="absolute right-3 top-3.5 pointer-events-none text-gray-400">
                                            <LucideIcons.ChevronDown size={16} />
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        className="w-full bg-white border-none rounded-xl p-3.5 focus:ring-2 focus:ring-green-400/20 outline-none text-gray-700 placeholder-gray-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] font-bold transition-all"
                                        placeholder="セクション名を入力"
                                        value={formData.parent_category || ""}
                                        onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">表示順</label>
                                <input
                                    type="number"
                                    className="w-full bg-gray-50/50 border-none rounded-xl p-3.5 focus:bg-white focus:ring-2 focus:ring-green-400/20 transition-all shadow-inner outline-none text-gray-700"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 text-gray-500 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition border-none outline-none focus:ring-0"
                                >
                                    キャンセル
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 border-none outline-none focus:ring-0"
                                >
                                    保存する
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Navigation activeTab="admin" />
        </div>
    );
};

export default TaskManagementPage;
