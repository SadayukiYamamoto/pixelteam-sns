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
import TreasurePostForm from "./pages/TreasurePostForm";
import TreasurePixelPage from './pages/TreasurePixelPage';
import TreasurePixelCategoryPage from './pages/TreasurePixelCategoryPage';
import TaskPage from "./pages/TaskPage";
import IndividualAchievements from "./components/tasks/Individual-achievements";
import IndividualShops from "./components/tasks/IndividualShops";
import NumberVisitors from "./components/tasks/NumberVisitors";       // ←修正
import SiftManagement from "./components/tasks/SiftManagement";       // ←修正
import SwingManagement from "./components/tasks/SwingManagement";
import NoticePage from "./components/NoticePage.jsx";
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





ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>

      {/* 全ページ共通レイアウト */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/posts" element={<Posts />} />
      <Route path="/search" element={<Posts />} />
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/mypage/:userId" element={<MyPage />} />
      <Route path="/profile-edit/:userId" element={<ProfileEdit />} />
      <Route path="/post" element={<PostPage />} />
      <Route path="/post/:id" element={<PostPage />} />
      <Route path="/posts/:id" element={<PostDetail />} /> {/* ← 詳細ページ追加 */}
      <Route path="/missions" element={<MissionsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />


      {/* treasure */}


      <Route path="/videos" element={<PixTubeHome />} />
      <Route path="/video/upload" element={<VideoUploadPage />} />
      <Route path="/admin/videos" element={<VideoAdminPage />} />
      <Route path="/admin/videos" element={<VideoAdminPage />} />
      <Route path="/admin/posts/manage" element={<PostManagementPage />} /> {/* ← 追加 */}
      <Route path="/admin/analytics/users" element={<UserAnalyticsPage />} /> {/* ← 追加 */}
      <Route path="/admin/analytics/shops" element={<ShopManagementPage />} /> {/* ← 追加 */}
      <Route path="/admin/analytics/videos/watch-logs" element={<VideoWatchAnalysisPage />} /> {/* ← 追加 */}
      <Route path="/admin/analytics/interactions" element={<AdminInteractionAnalysisPage />} /> {/* ← 追加 */}
      <Route path="/admin/points" element={<PointManagementPage />} /> {/* ← Added */}
      <Route path="/admin/notices" element={<NoticeAdminPage />} />
      <Route path="/admin/users" element={<UserAdminPage />} />
      <Route path="/admin/badges" element={<BadgeAdminPage />} />
      <Route path="/admin/notice/new" element={<NoticeAdminEditor />} /> {/* ← 追加 */}
      <Route path="/admin/notice/:id" element={<NoticeAdminEditor />} /> {/* ← 追加 */}
      <Route path="/notice/:id" element={<NoticeDetailPage />} /> {/* ← 追加 */}
      <Route path="/video/:id" element={<VideoPlayer />} />
      <Route path="/videos/:videoId/test" element={<VideoTestPage />} />

      <Route path="/treasure" element={<TreasurePixelPage />} />
      <Route path="/treasure-pixel" element={<TreasurePixelPage />} />
      <Route path="/treasure-categories" element={<TreasurePixelCategoryPage />} />
      <Route path="/treasure/:category" element={<TreasureCategoryList />} />
      <Route path="/treasure/:category/:postId" element={<TreasurePostDetail />} />
      <Route path="/treasure/new" element={<TreasurePostForm />} />
      <Route path="/treasure/edit/:id" element={<TreasurePostForm />} />

      {/* tasks */}
      <Route path="/tasks" element={<TaskPage />} />
      <Route path="/tests/create" element={<TestCreatePage />} />
      <Route path="/components/tasks/Individual-achievements" element={<IndividualAchievements />} />
      <Route path="/components/tasks/Individual-shops" element={<IndividualShops />} />
      <Route path="/components/tasks/number-visitors" element={<NumberVisitors />} />
      <Route path="/components/tasks/sift-management" element={<SiftManagement />} />
      <Route path="/components/tasks/swing-management" element={<SwingManagement />} />

      {/* おしらせ */}
      <Route path="/notice" element={<NoticePage />} />
      <Route path="/notice/:id" element={<NoticeDetailPage />} />
      <Route path="/admin/notices/new" element={<NoticeAdminEditor />} />
      <Route path="/admin/notices/edit/:id" element={<NoticeAdminEditor />} />

      {/* 管理画面 */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/login-popup" element={<LoginPopupAdminPage />} />
      <Route path="/admin/home" element={<HomeAdminPage />} />
      <Route path="/admin/home" element={<HomeAdminPage />} />
      <Route path="/admin/posts" element={<PostAdminPage />} />
      <Route path="/admin/tasks" element={<TaskManagementPage />} />
      <Route path="/admin/tests" element={<TestManagementPage />} /> {/* ← 追加 */}
      <Route path="/tests/edit/:videoId" element={<TestCreatePage />} /> {/* ← 編集用パラメータ付き */}
      <Route path="/admin/exp" element={<AdminExpManagement />} />
      <Route path="/admin/level-rewards" element={<AdminLevelRewards />} />
      <Route path="/analytics/matrix" element={<WatchMatrix />} />



      {/* ← ログインだけヘッダー無し */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} /> {/* ← アカウント作成 */}

    </Routes>
  </BrowserRouter>

);
