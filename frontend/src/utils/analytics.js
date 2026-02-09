import axiosClient from '../api/axiosClient';

/**
 * ユーザーのインタラクション（タップ・クリック）を記録する
 * @param {string} category - post, video, knowhow, task
 * @param {string} itemId - 対象のID
 * @param {string} itemTitle - 対象のタイトル
 */
export const logInteraction = async (category, itemId, itemTitle) => {
    try {
        await axiosClient.post(`/log/interaction/`, {
            category,
            item_id: String(itemId),
            item_title: itemTitle
        });

    } catch (error) {
        console.error("Failed to log interaction:", error);

    }

};
