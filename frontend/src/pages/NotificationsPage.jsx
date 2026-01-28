import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, AtSign, Award, CircleDollarSign, ChevronLeft, Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { handleNotificationRedirection } from '../utils/notification-handler';
import Avatar from '../components/Avatar';
import './NotificationsPage.css';

import PullToRefresh from '../components/PullToRefresh';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        markAllAsRead();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/notifications/', {
                headers: { Authorization: `Token ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('通知の取得に失敗しました:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchNotifications();
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/notifications/read/', {}, {
                headers: { Authorization: `Token ${token}` }
            });
        } catch (err) {
            console.error('既読処理に失敗しました:', err);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // 親要素のクリックイベント（遷移）を防止
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/notifications/${id}/delete/`, {
                headers: { Authorization: `Token ${token}` }
            });
            // 状態を更新して一覧から削除
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {
            console.error('通知の削除に失敗しました:', err);
            alert('通知の削除に失敗しました');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'LIKE': return <Heart className="notif-icon like" size={20} fill="currentColor" />;
            case 'COMMENT': return <MessageCircle className="notif-icon comment" size={20} />;
            case 'REPLY': return <MessageCircle className="notif-icon reply" size={20} />;
            case 'MENTION': return <AtSign className="notif-icon mention" size={20} />;
            case 'BADGE': return <Award className="notif-icon badge" size={20} />;
            case 'POINT': return <CircleDollarSign className="notif-icon point" size={20} />;
            default: return <Bell size={20} />;
        }
    };

    const handleNotifClick = (notif) => {
        handleNotificationRedirection(notif, navigate);
    };

    if (loading) return <div className="loading">読み込み中...</div>;

    return (
        <div className="notifications-container">
            <header className="notif-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ChevronLeft size={24} />
                </button>
                <h1>通知</h1>
            </header>

            <PullToRefresh onRefresh={handleRefresh} className="flex-1 overflow-hidden">
                <div className="notif-list pb-24">
                    {notifications.length === 0 ? (
                        <div className="empty-notif" style={{ padding: '40px' }}>通知はありません。</div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
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
                                    <p className="notif-message">{notif.message}</p>
                                    <span className="notif-time">{new Date(notif.created_at).toLocaleString()}</span>
                                </div>
                                <button
                                    className="notif-delete-btn"
                                    onClick={(e) => handleDelete(e, notif.id)}
                                    title="削除"
                                >
                                    <Check size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </PullToRefresh>
        </div>
    );
};

export default NotificationsPage;
