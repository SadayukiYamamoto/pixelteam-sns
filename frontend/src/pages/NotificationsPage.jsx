import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, AtSign, Award, CircleDollarSign, ChevronLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

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
            navigate(`/post/${notif.post_id}`);
        }
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

            <div className="notif-list">
                {notifications.length === 0 ? (
                    <div className="empty-notif">通知はありません。</div>
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
                                            <img src={notif.sender.profile_image || '/default-avatar.png'} alt="" className="sender-avatar" />
                                            <span className="sender-name">{notif.sender.display_name}</span>
                                        </>
                                    ) : (
                                        <span className="sender-name">システム</span>
                                    )}
                                </div>
                                <p className="notif-message">{notif.message}</p>
                                <span className="notif-time">{new Date(notif.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
