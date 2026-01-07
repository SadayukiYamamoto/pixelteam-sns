import React, { useState, useEffect } from 'react';
import { Mail, Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import './HeaderFooter.css';

import NoticePopup from "./NoticePopup";
import NotificationPopup from "./NotificationPopup";
// AccountSwitcher removed

const Header = ({ onProfileClick }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [noticeUnreadCount, setNoticeUnreadCount] = useState(0);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);


  useEffect(() => {
    fetchUnreadCount();
    fetchNoticeUnreadCount();
    // 30秒おきに更新
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNoticeUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosClient.get(`notifications/unread_count/`);
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error('未読数の取得に失敗しました:', err);
    }
  };

  const fetchNoticeUnreadCount = async () => {
    try {
      const res = await axiosClient.get(`notices/`);

      const notices = res.data;
      if (notices.length === 0) {
        setNoticeUnreadCount(0);
        return;
      }

      const lastSeenNoticeId = localStorage.getItem('lastSeenNoticeId');
      if (!lastSeenNoticeId) {
        setNoticeUnreadCount(notices.length);
      } else {
        // IDがUUIDなので単純比較は難しいが、最新のIDが一致しなければ未読ありとするか、
        // もしくはリストの中でlastSeenNoticeIdより前にあるものの数を数える
        const lastSeenIndex = notices.findIndex(n => n.id === lastSeenNoticeId);
        if (lastSeenIndex === -1) {
          setNoticeUnreadCount(notices.length);
        } else {
          setNoticeUnreadCount(lastSeenIndex);
        }
      }
    } catch (err) {
      console.error('お知らせ未読数の取得に失敗しました:', err);
    }
  };

  const handleProfileClick = () => {
    navigate('/mypage');
  };

  const handleNoticeClick = async () => {
    setIsNoticeOpen(true);
    // 開いたときに最新のIDを既読として保存
    try {
      const res = await axiosClient.get(`notices/`);
      const data = res.data;
      if (data.length > 0) {
        localStorage.setItem('lastSeenNoticeId', data[0].id);
        setNoticeUnreadCount(0);
      }
    } catch (err) {
      console.error("Notice read update error:", err);
    }
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(true);
  };

  return (
    <>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[72px] flex justify-between items-center bg-white shadow-sm z-[1001] px-8 border-b border-gray-100">

        <div className="flex items-center flex-shrink-0 ml-6">
          <h1
            className="text-2xl font-black text-[#15803d] leading-none tracking-tight"
            style={{ marginLeft: '20px' }}
          >
            GarageGateway
          </h1>
        </div>

        {/* 右側アイコン */}
        <div className="flex items-center space-x-3 mr-10">
          <button
            onClick={handleNoticeClick}
            className="header-icon relative"
            aria-label="おしらせ"
          >
            <Mail size={20} className={`${noticeUnreadCount > 0 ? 'text-[#00c68a]' : 'text-gray-400'}`} />
            {noticeUnreadCount > 0 && (
              <span className="icon-badge">
                {noticeUnreadCount > 9 ? '9+' : noticeUnreadCount}
              </span>
            )}
          </button>

          <button
            onClick={handleNotificationClick}
            className="header-icon relative"
            aria-label="通知"
          >
            <Bell size={20} className={`${unreadCount > 0 ? 'text-[#00c68a]' : 'text-gray-400'}`} />
            {unreadCount > 0 && (
              <span className="icon-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={handleProfileClick}
            className="header-icon"
            style={{ marginRight: '20px' }}
            aria-label="マイページ"
          >
            <User size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* お知らせポップアップ（グローバル） */}
      {isNoticeOpen && (
        <NoticePopup onClose={() => setIsNoticeOpen(false)} />
      )}

      {/* 通知ポップアップ（グローバル） */}
      {isNotificationOpen && (
        <NotificationPopup onClose={() => {
          setIsNotificationOpen(false);
          setUnreadCount(0); // 閉じるときに未読バッジをクリア（任意）
        }} />
      )}

      {/* アカウント切り替えポップアップ（削除） */}
    </>
  );
};

export default Header;
