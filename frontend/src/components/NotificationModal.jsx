import React from 'react';
import { FileText, Settings, ExternalLink } from 'lucide-react';
import './HeaderFooter.css';

const NotificationModal = ({ show, onClose, notifications }) => {
  if (!show) return null;

  // 通知カードのサブコンポーネント
  const NotificationItem = ({ notification }) => {
    const isOfficeNews = notification.type === 'office_news';
    const isFormAnswer = notification.type === 'form_answer';

    if (isOfficeNews) {
      return (
        <div className="notification-card h-52">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{notification.title}</h3>
          <div className="relative w-full h-24 bg-gray-100 rounded-2xl overflow-hidden mb-2 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center p-4">
              {notification.icon}
              <p className="text-xl font-bold text-gray-600">{notification.title}</p>
            </div>
          </div>
          <span className="tag-yellow">{notification.tag}</span>
          <p className="text-sm font-semibold text-gray-700 truncate">
            {notification.subtitle}
          </p>
        </div>
      );
    } else if (isFormAnswer) {
      return (
        <div className="notification-card relative">
          <div className="flex items-center space-x-3 mb-3">
            {notification.icon}
            <div className="flex-grow">
              <p className="text-sm font-semibold text-gray-500">
                {notification.user_info}
              </p>
              <h3 className="text-xl font-extrabold text-gray-800">
                {notification.title}
              </h3>
            </div>
          </div>
          <span className="tag-blue">{notification.tag}</span>
          <p className="text-sm font-semibold text-gray-700">
            {notification.subtitle}
          </p>
        </div>
      );
    } else {
      return (
        <div className="notification-card">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            {notification.icon}
            <span className="ml-2">{notification.title}</span>
          </h3>
          <p className="text-sm text-gray-600 mt-1">{notification.subtitle}</p>
        </div>
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* モーダルヘッダー */}
        <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between shadow-sm z-10">
          <h2 className="text-2xl font-bold text-gray-800">お知らせ</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2">
            ✕
          </button>
        </div>

        {/* 通知リスト */}
        <div className="p-4 pt-0">
          {notifications.map((note, i) => (
            <NotificationItem key={i} notification={note} />
          ))}
          <div className="text-center text-gray-400 p-8">--- 過去の通知 ---</div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
