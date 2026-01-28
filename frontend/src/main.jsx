import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Posts from './pages/Posts';
import './index.css';
import Login from './pages/Login';
import Signup from './pages/Signup'; // ← 追加
import MyPage from './pages/MyPage';
import ProfileEdit from "./components/ProfileEdit";
import PostPage from "./components/PostPage";
import PixTubeHome from "./pages/PixTubeHome"; // ← 上のimportに追加
import VideoPlayer from "./components/VideoPlayer";
import VideoTestPage from "./components/VideoTestPage";
import TestCreatePage from "./pages/TestCreatePage";
import TreasureCategoryList from './pages/TreasureCategoryList';
import TreasurePostDetail from './pages/TreasurePostDetail';
import TreasurePostListPage from './pages/TreasurePostListPage';
import TreasurePostForm from "./pages/TreasurePostForm";
import TreasurePixelPage from './pages/TreasurePixelPage';
import TreasurePixelCategoryPage from './pages/TreasurePixelCategoryPage';
import TaskPage from "./pages/TaskPage";
import IndividualAchievements from "./components/tasks/Individual-achievements";
import IndividualShops from "./components/tasks/IndividualShops";
import NumberVisitors from "./components/tasks/NumberVisitors";       // ←修正
import SiftManagement from "./components/tasks/SiftManagement";       // ←修正
import SwingManagement from "./components/tasks/SwingManagement";
import NoticeListPage from "./pages/NoticeListPage.jsx";
import PastSecretariatNewsPage from "./pages/PastSecretariatNewsPage";
import NoticeDetailPage from "./pages/NoticeDetailPage"; // ← 追加 // ← 追加 // ← 追加
import NoticeAdminEditor from "./admin/NoticeAdminEditor"; // ← 追加
import MissionsPage from "./components/MissionsPage";
import WatchMatrix from "./admin/WatchMatrix";
import VideoUploadPage from "./pages/VideoUploadPage";
import VideoAdminPage from "./pages/VideoAdminPage";
import NoticeAdminPage from "./pages/NoticeAdminPage";
import UserAdminPage from "./admin/UserAdminPage";
import BadgeAdminPage from "./admin/BadgeAdminPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationsPage from "./pages/NotificationsPage";
import HomeAdminPage from "./pages/HomeAdminPage";
import PostAdminPage from "./pages/PostAdminPage";
import PostManagementPage from "./pages/PostManagementPage"; // ← 追加
import UserAnalyticsPage from "./pages/UserAnalyticsPage"; // ← 追加
import ShopManagementPage from "./pages/ShopManagementPage"; // ← 追加
import PointManagementPage from "./pages/PointManagementPage"; // Added
import PostDetail from "./pages/PostDetail"; // ← 追加
import TaskManagementPage from "./admin/TaskManagementPage";
import TestManagementPage from "./admin/TestManagementPage"; // ← 追加
import VideoWatchAnalysisPage from "./admin/VideoWatchAnalysisPage"; // ← 追加
import AdminInteractionAnalysisPage from "./admin/AdminInteractionAnalysisPage"; // ← 追加
import LoginPopupAdminPage from "./admin/LoginPopupAdminPage"; // ← 追加
import AdminExpManagement from "./pages/admin/AdminExpManagement";
import AdminLevelRewards from "./pages/admin/AdminLevelRewards";
import VideoFeedbackAdminPage from "./admin/VideoFeedbackAdminPage"; // ← 追加
import TreasureAdminPage from "./admin/TreasureAdminPage"; // ← 追加
import ProtectedRoute from "./components/ProtectedRoute";
import BackButtonHandler from "./components/BackButtonHandler";





import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAgreement from "./pages/TermsAgreement";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <BackButtonHandler />
    <Routes>
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-agreement" element={<TermsAgreement />} />

      {/* 全ページ共通レイアウト */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
      <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
      <Route path="/mypage/:userId" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
      <Route path="/profile-edit/:userId" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
      <Route path="/post" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
      <Route path="/post/:id" element={<ProtectedRoute><PostPage /></ProtectedRoute>} />
      <Route path="/posts/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} /> {/* ← 詳細ページ追加 */}
      <Route path="/missions" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />


      {/* treasure */}


      <Route path="/videos" element={<ProtectedRoute><PixTubeHome /></ProtectedRoute>} />
      <Route path="/video/upload" element={<ProtectedRoute><VideoUploadPage /></ProtectedRoute>} />
      <Route path="/admin/videos" element={<ProtectedRoute><VideoAdminPage /></ProtectedRoute>} />
      <Route path="/admin/posts/manage" element={<ProtectedRoute><PostManagementPage /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/admin/analytics/users" element={<ProtectedRoute><UserAnalyticsPage /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/admin/analytics/shops" element={<ProtectedRoute><ShopManagementPage /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/admin/analytics/videos/watch-logs" element={<ProtectedRoute><VideoWatchAnalysisPage /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/admin/analytics/interactions" element={<ProtectedRoute><AdminInteractionAnalysisPage /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/admin/points" element={<ProtectedRoute><PointManagementPage /></ProtectedRoute>} /> {/* ← Added */}
      <Route path="/admin/notices" element={<ProtectedRoute><NoticeAdminPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><UserAdminPage /></ProtectedRoute>} />
      <Route path="/admin/badges" element={<ProtectedRoute><BadgeAdminPage /></ProtectedRoute>} />
      <Route path="/admin/notice/new" element={<ProtectedRoute><NoticeAdminEditor /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/admin/notice/:id" element={<ProtectedRoute><NoticeAdminEditor /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/notice/:id" element={<ProtectedRoute><NoticeDetailPage /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/video/:id" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
      <Route path="/videos/:videoId/test" element={<ProtectedRoute><VideoTestPage /></ProtectedRoute>} />

      <Route path="/treasure" element={<ProtectedRoute><TreasurePixelPage /></ProtectedRoute>} />
      <Route path="/treasure-pixel" element={<ProtectedRoute><TreasurePixelPage /></ProtectedRoute>} />
      <Route path="/treasure-categories" element={<ProtectedRoute><TreasurePixelCategoryPage /></ProtectedRoute>} />
      <Route path="/treasure/:category" element={<ProtectedRoute><TreasureCategoryList /></ProtectedRoute>} />
      <Route path="/treasure/:category/:postId" element={<ProtectedRoute><TreasurePostDetail /></ProtectedRoute>} />
      <Route path="/treasure/post/:postId" element={<ProtectedRoute><TreasurePostDetail /></ProtectedRoute>} />
      <Route path="/treasure-list" element={<ProtectedRoute><TreasurePostListPage /></ProtectedRoute>} />
      <Route path="/treasure/new" element={<ProtectedRoute><TreasurePostForm /></ProtectedRoute>} />
      <Route path="/treasure/edit/:id" element={<ProtectedRoute><TreasurePostForm /></ProtectedRoute>} />

      {/* tasks */}
      <Route path="/tasks" element={<ProtectedRoute><TaskPage /></ProtectedRoute>} />
      <Route path="/tests/create" element={<ProtectedRoute><TestCreatePage /></ProtectedRoute>} />
      <Route path="/components/tasks/Individual-achievements" element={<ProtectedRoute><IndividualAchievements /></ProtectedRoute>} />
      <Route path="/components/tasks/Individual-shops" element={<ProtectedRoute><IndividualShops /></ProtectedRoute>} />
      <Route path="/components/tasks/number-visitors" element={<ProtectedRoute><NumberVisitors /></ProtectedRoute>} />
      <Route path="/components/tasks/sift-management" element={<ProtectedRoute><SiftManagement /></ProtectedRoute>} />
      <Route path="/components/tasks/swing-management" element={<ProtectedRoute><SwingManagement /></ProtectedRoute>} />

      {/* おしらせ */}
      <Route path="/notice" element={<ProtectedRoute><NoticeListPage /></ProtectedRoute>} />
      <Route path="/notices" element={<ProtectedRoute><NoticeListPage /></ProtectedRoute>} />
      <Route path="/notice/:id" element={<ProtectedRoute><NoticeDetailPage /></ProtectedRoute>} />
      <Route path="/past-secretariat-news" element={<ProtectedRoute><PastSecretariatNewsPage /></ProtectedRoute>} />
      <Route path="/admin/notices/new" element={<ProtectedRoute><NoticeAdminEditor /></ProtectedRoute>} />
      <Route path="/admin/notices/edit/:id" element={<ProtectedRoute><NoticeAdminEditor /></ProtectedRoute>} />

      {/* 管理画面 */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/login-popup" element={<ProtectedRoute><LoginPopupAdminPage /></ProtectedRoute>} />
      <Route path="/admin/home" element={<ProtectedRoute><HomeAdminPage /></ProtectedRoute>} />
      <Route path="/admin/posts" element={<ProtectedRoute><PostAdminPage /></ProtectedRoute>} />
      <Route path="/admin/tasks" element={<ProtectedRoute><TaskManagementPage /></ProtectedRoute>} />
      <Route path="/admin/tests" element={<ProtectedRoute><TestManagementPage /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/admin/videos/feedback" element={<ProtectedRoute><VideoFeedbackAdminPage /></ProtectedRoute>} /> {/* ← 追加 */}
      <Route path="/tests/edit/:videoId" element={<ProtectedRoute><TestCreatePage /></ProtectedRoute>} /> {/* ← 編集用パラメータ付き */}
      <Route path="/admin/exp" element={<ProtectedRoute><AdminExpManagement /></ProtectedRoute>} />
      <Route path="/admin/level-rewards" element={<ProtectedRoute><AdminLevelRewards /></ProtectedRoute>} />
      <Route path="/admin/treasures" element={<ProtectedRoute><TreasureAdminPage /></ProtectedRoute>} />
      <Route path="/analytics/matrix" element={<ProtectedRoute><WatchMatrix /></ProtectedRoute>} />



      {/* ← ログインだけヘッダー無し */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> {/* ← アカウント作成 */}

    </Routes>
  </BrowserRouter>

);
