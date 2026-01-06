import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "";

/**
 * ユーザーのインタラクション（タップ・クリック）を記録する
 * @param {string} category - post, video, knowhow, task
 * @param {string} itemId - 対象のID
 * @param {string} itemTitle - 対象のタイトル
 */
export const logInteraction = async (category, itemId, itemTitle) => {
    try {
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Token ${token}` } } : {};
        await axios.post(`${API_URL}/api/log/interaction/`, {
            category,
            item_id: String(itemId),
            item_title: itemTitle
        }, config);
    } catch (error) {
        console.error("Failed to log interaction:", error);
    }
};
