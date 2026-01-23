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
        height: isIos
          ? 'calc(20px + env(safe-area-inset-bottom, 0px))'
          : 'auto',
        minHeight: isIos ? '0' : '68px'
      }}
    >
      {navItems.map(({ name, icon: Icon, tab }) => (
        <button
          key={tab}
          onClick={() => handleNavClick(tab)}
          className={`nav-button ${activeTab === tab ? 'active' : ''}`}
          style={{ padding: isIos ? '0' : 'inherit' }}
        >
          <Icon
            className="nav-icon"
            style={isIos ? { fontSize: '14px', marginBottom: '0' } : {}}
          />
          {!isIos && <span>{name}</span>}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
