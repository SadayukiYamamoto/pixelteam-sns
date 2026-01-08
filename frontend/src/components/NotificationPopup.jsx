import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Heart, MessageCircle, AtSign, Award, CircleDollarSign, Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import './NoticePopup.css'; // Reuse popup styles
import '../pages/NotificationsPage.css'; // Reuse notification item styles

const NotificationPopup = ({ onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        markAllAsRead();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axiosClient.get('notifications/');
            setNotifications(res.data);
        } catch (err) {
            console.error('通知の取得に失敗しました:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axiosClient.post('notifications/read/', {});
        } catch (err) {
            console.error('既読処理に失敗しました:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE': return <Heart className="notif-icon like" size={20} fill="currentColor" />;
            case 'COMMENT': return <MessageCircle className="notif-icon comment" size={20} />;
            case 'MENTION': return <AtSign className="notif-icon mention" size={20} />;
            case 'BADGE': return <Award className="notif-icon badge" size={20} />;
            case 'POINT': return <CircleDollarSign className="notif-icon point" size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const handleNotifClick = (notif) => {
        if (notif.post_id) {
            const query = notif.notification_type === 'COMMENT' ? '?openComments=true' : '';
            navigate(`/posts/${notif.post_id}${query}`);
            onClose();
        }
    };

    return (
        <div className="notice-popup-bg" onClick={onClose}>
            <div className="notice-popup-large" onClick={(e) => e.stopPropagation()}>
                {/* === Header === */}
                <div className="notice-popup-header">
                    <h3 className="text-lg font-bold">通知</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* === List === */}
                <div className="flex flex-col gap-2">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">読み込み中...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">通知はありません</div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`notif-item ${!notif.is_read ? 'unread' : ''} rounded-lg`}
                                onClick={() => handleNotifClick(notif)}
                            >
                                <div className="notif-left">
                                    {getIcon(notif.notification_type)}
                                </div>
                                <div className="notif-right">
                                    <div className="notif-sender">
                                        {notif.sender ? (
                                            <>
                                                <Avatar
                                                    src={notif.sender.profile_image}
                                                    name={notif.sender.display_name}
                                                    size="w-6 h-6"
                                                    className="sender-avatar"
                                                />
                                                <span className="sender-name">{notif.sender.display_name}</span>
                                            </>
                                        ) : (
                                            <span className="sender-name">システム</span>
                                        )}
                                    </div>
                                    <p className="notif-message text-sm text-gray-600">{notif.message}</p>
                                    <span className="notif-time text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationPopup;
