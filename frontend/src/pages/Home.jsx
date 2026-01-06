import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import './Home.css';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import MainContent from '../components/MainContent';
import LoginPopupManager from '../components/LoginPopupManager';
import MissionBottomSheet from '../components/MissionBottomSheet';
import { initializePushNotifications } from '../utils/push-notifications';
import FloatingWriteButton from '../components/FloatingWriteButton';
import { ClipboardList } from 'lucide-react';
import { logInteraction } from '../utils/analytics';


const Home = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [hasUnclaimed, setHasUnclaimed] = useState(false);
  const navigate = useNavigate();

  const checkMissionStatus = async () => {
    try {
      const res = await axiosClient.get('missions/');
      if (res.data && Array.isArray(res.data)) {
        const canClaim = res.data.some(m => m.is_completed && !m.is_claimed);
        setHasUnclaimed(canClaim);
      }
    } catch (err) {
      console.error("Home mission check error:", err);
    }
  };

  useEffect(() => {
    checkMissionStatus();
    initializePushNotifications().catch(err => {
      console.error("Push notification initialization error:", err);
    });
  }, []);

  const handleMissionClick = () => {
    console.log("Mission button clicked! Setting isOpen to true.");
    setIsMissionOpen(true);
    logInteraction('mission', 'mission_popup', 'ミッションポップアップ');
  };

  const handleMissionClose = () => {
    setIsMissionOpen(false);
    checkMissionStatus();
  };

  return (
    <>
      <div className="home-container">
        <div className="home-wrapper">
          <Header />

          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 120px)', backgroundColor: '#f9fafb', paddingBottom: '100px' }}>
            <MainContent setActiveTab={setActiveTab} />
          </div>

        </div>
      </div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] h-0 pointer-events-none z-[60]"
        style={{ bottom: '0px' }}
      >
        <button
          onClick={handleMissionClick}
          className={`absolute bottom-[88px] right-[18px] pointer-events-auto w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110 active:scale-95 border-none ${hasUnclaimed ? 'bg-[#10b981] text-white' : 'bg-white text-[#10b981]'
            }`}
        >
          <ClipboardList
            size={28}
            className={hasUnclaimed ? "animate-bounce-short" : ""}
          />
          {hasUnclaimed && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out infinite;
        }
      `}</style>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <LoginPopupManager />
      <MissionBottomSheet isOpen={isMissionOpen} onClose={handleMissionClose} />
    </>
  );
};

export default Home;
