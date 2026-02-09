import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MessageSquare, PlayCircle, BookOpen, Briefcase, ClipboardList } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Capacitor } from '@capacitor/core';
import MissionBottomSheet from './MissionBottomSheet';
import './NavigationBar.css';

const API_URL = import.meta.env.VITE_API_URL || "";

const Navigation = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const isIos = Capacitor.getPlatform() === 'ios';
  const isAndroid = Capacitor.getPlatform() === 'android';

  const triggerMission = async (actionType) => {
    try {
      await axiosClient.post('missions/trigger/', { action_type: actionType });
    } catch (err) {
      console.error("Mission trigger error:", err);
    }
  };

  const handleNavClick = (tab) => {
    // ✅ setActiveTab が存在すれば実行（MyPageなどではundefinedなので安全）
    if (typeof setActiveTab === "function") {
      setActiveTab(tab);
    }

    // ✅ ミッショントリガー
    if (tab === 'post') triggerMission('post_click');
    if (tab === 'tasks') triggerMission('task_click');

    // ✅ ページ遷移
    if (tab === 'home') navigate('/home');
    if (tab === 'post') navigate('/posts');
    if (tab === 'videos') navigate('/videos');
    if (tab === 'knowledge') navigate('/treasure');
    if (tab === 'tasks') navigate('/tasks');
    if (tab === 'mypage') navigate('/mypage');
  };

  const navItems = [
    { name: 'ホーム', icon: Home, tab: 'home' },
    { name: '投稿', icon: MessageSquare, tab: 'post' },
    { name: '動画', icon: PlayCircle, tab: 'videos' },
    { name: 'ノウハウ', icon: BookOpen, tab: 'knowledge' },
    { name: '業務', icon: Briefcase, tab: 'tasks' },
  ];

  return (
    <nav
      className="navbar"
      style={{
        height: 'calc(var(--footer-height) + var(--footer-safe-area-bottom))',
        paddingTop: isAndroid ? '0px' : '6px',
        borderTopWidth: isAndroid ? '0px' : undefined,
        paddingBottom: 'var(--footer-safe-area-bottom)'
      }}
    >
      {navItems.map(({ name, icon: Icon, tab }) => (
        <button
          key={tab}
          onClick={() => handleNavClick(tab)}
          className={`nav-button ${activeTab === tab ? 'active' : ''}`}
        >
          <Icon
            className="nav-icon"
          />
          <span>{name}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
