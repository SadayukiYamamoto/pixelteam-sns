from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('seed-admin/', views.temp_seed_user, name='seed_admin'),
    path('login/google/', views.google_login_view, name='google_login'), 
    path('signup/', views.signup_view, name='signup'), # ← 追加 # ← 追加
    path('mypage/<str:user_id>/', views.mypage_view, name='mypage'),
    path("profile/me/", views.get_current_user_profile, name="current_user_profile"),
    path('profile/<str:user_id>/', views.public_profile_view, name='public_profile'),
    path('update_profile/', views.update_profile, name='update_profile'),
    path("badges/<str:user_id>/", views.get_user_badges),
    path('admin/analytics/users/', views.admin_user_analytics),
    path('admin/analytics/shops/', views.admin_shop_analytics),
    path('admin/points/update/', views.admin_update_points),
    path("search/", views.search_users, name="search_users"),
    
    # Admin API
    path('admin/users/', views.get_all_users, name='admin_users_list'),
    path('admin/users/update_exp/', views.admin_update_exp),
    path('admin/users/<str:user_id>/', views.admin_user_detail, name='admin_user_detail'),
    path('admin/badges/', views.badge_list_create, name='admin_badges_list'),
    path('admin/badges/assign/', views.assign_badge, name='admin_assign_badge'),
    path('admin/login-popup/', views.admin_login_popup_setting, name='admin_login_popup_setting'),
    path('admin/shops/list/', views.get_shop_list, name='admin_shop_list'),

    # User Login Popup
    path('user/login-popup/', views.user_login_popup, name='user_login_popup'),

    # Notifications
    path('notifications/', views.notification_list, name='notification_list'),
    path('notifications/read/', views.mark_notifications_read, name='mark_notifications_read'),
    path('notifications/<int:pk>/delete/', views.delete_notification, name='delete_notification'),
    path('notifications/unread_count/', views.unread_notification_count, name='unread_notification_count'),
]