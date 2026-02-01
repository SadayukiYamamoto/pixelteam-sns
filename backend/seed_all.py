import os
import django

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pixelshop_backend.settings')
django.setup()

from missions.models import Mission
from posts.models import TaskButton

def seed_missions():
    print("Seeding Missions...")
    # Pixel Shop Missions
    shop_missions = [
        # Daily
        {'title': 'ログインをする', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'shop', 'action_type': 'login', 'target_count': 1, 'order': 1},
        {'title': '個人実績の確認をする', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'shop', 'action_type': 'task_button', 'action_detail': '個人実績', 'target_count': 1, 'order': 2},
        {'title': '店舗実績の確認をする', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'shop', 'action_type': 'task_button', 'action_detail': '店舗実績', 'target_count': 1, 'order': 3},
        {'title': 'いいねをする', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'shop', 'action_type': 'like', 'target_count': 1, 'order': 4},
        {'title': 'コメントをする', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'shop', 'action_type': 'comment', 'target_count': 1, 'order': 5},
        {'title': '投稿をする', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'shop', 'action_type': 'post', 'target_count': 1, 'order': 6},
        # Weekly
        {'title': 'ノウハウを投稿する', 'exp_reward': 30, 'mission_type': 'weekly', 'team': 'shop', 'action_type': 'treasure_post', 'target_count': 1, 'order': 7, 'is_shop_wide': True},
        {'title': '事務局だよりを確認する', 'exp_reward': 10, 'mission_type': 'weekly', 'team': 'shop', 'action_type': 'notice_view', 'target_count': 1, 'order': 8},
        {'title': '動画を視聴する', 'exp_reward': 10, 'mission_type': 'weekly', 'team': 'shop', 'action_type': 'video_watch', 'target_count': 1, 'order': 9},
        {'title': '動画のテストを受ける', 'exp_reward': 30, 'mission_type': 'weekly', 'team': 'shop', 'action_type': 'test_pass', 'target_count': 1, 'order': 10},
    ]

    # Pixel Event Missions
    event_missions = [
        # Daily
        {'title': 'ログインをする', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'event', 'action_type': 'login', 'target_count': 1, 'order': 1},
        {'title': '業務ボタンを押す', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'event', 'action_type': 'task_button', 'action_detail': '業務', 'target_count': 1, 'order': 2},
        {'title': '投稿ボタンを押す', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'event', 'action_type': 'task_button', 'action_detail': '投稿', 'target_count': 1, 'order': 3},
        {'title': '健康観察を押す', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'event', 'action_type': 'task_button', 'action_detail': '健康観察', 'target_count': 1, 'order': 4},
        {'title': '個人実績報告を押す', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'event', 'action_type': 'task_button', 'action_detail': '個人実績報告', 'target_count': 1, 'order': 5},
        {'title': '店舗実績報告を押す', 'exp_reward': 1, 'mission_type': 'daily', 'team': 'event', 'action_type': 'task_button', 'action_detail': '店舗実績報告', 'target_count': 1, 'order': 6},
        # Weekly
        {'title': 'Qast を押す', 'exp_reward': 10, 'mission_type': 'weekly', 'team': 'event', 'action_type': 'task_button', 'action_detail': 'Qast', 'target_count': 1, 'order': 7},
        {'title': '事務局だよりを確認する', 'exp_reward': 10, 'mission_type': 'weekly', 'team': 'event', 'action_type': 'notice_view', 'target_count': 1, 'order': 8},
        {'title': '動画を視聴する', 'exp_reward': 10, 'mission_type': 'weekly', 'team': 'event', 'action_type': 'video_watch', 'target_count': 1, 'order': 9},
        {'title': '動画のテストを受ける', 'exp_reward': 30, 'mission_type': 'weekly', 'team': 'event', 'action_type': 'test_pass', 'target_count': 1, 'order': 10},
    ]

    all_missions = shop_missions + event_missions
    for m_data in all_missions:
        Mission.objects.update_or_create(
            title=m_data['title'],
            team=m_data['team'],
            mission_type=m_data['mission_type'],
            defaults=m_data
        )
    print("Missions seeded successfully!")

def seed_tasks():
    print("Seeding TaskButtons...")
    tasks_data = [
        {"title": "健康観察", "icon_name": "UserCheck", "color": "text-pink-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLScHDtKTkgN7L8oz7iVd4deiOl_Fn6A-D613vyVMoERD1cMetQ/viewform", "category": "pixel-event", "parent_category": "申請・報告", "order": 0},
        {"title": "勤怠報告", "icon_name": "Clock", "color": "text-red-500", "url": "https://agent2309.e-densin.jp/mobile/login/", "category": "pixel-event", "parent_category": "申請・報告", "order": 1},
        {"title": "交通費申請", "icon_name": "DollarSign", "color": "text-green-500", "url": "https://drive.google.com/drive/folders/18iOXhFzPxdyxwaquhPQifL3uG0YhJzEK", "category": "pixel-event", "parent_category": "申請・報告", "order": 2},
        {"title": "シフト・宿泊・フライト・稼働写真", "icon_name": "Briefcase", "color": "text-indigo-500", "url": "https://docs.google.com/spreadsheets/d/1Fx25xjewo9wMHDALNHZmIiYEINR8nHEEsDtjnTeoxDM/edit#gid=1495149345", "category": "pixel-event", "parent_category": "申請・報告", "order": 3},
        {"title": "個人実績報告", "icon_name": "Activity", "color": "text-blue-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLScaeMGFzBv_UphQad8ThB3YFUbIKgl-MLSF4dwUX9I9evzUKw/viewform?usp=sf_link", "category": "pixel-event", "parent_category": "実績・確認", "order": 4},
        {"title": "店舗実績報告", "icon_name": "TrendingUp", "color": "text-purple-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLSea3P-72fFxMkLpSdG9lm9Kdh20pCENhESClyWTN3AG5O0w3g/viewform?usp=sf_link", "category": "pixel-event", "parent_category": "実績・確認", "order": 5},
        {"title": "実績進捗確認", "icon_name": "CheckSquare", "color": "text-teal-500", "url": "https://docs.google.com/spreadsheets/d/16nMMdZvXGzpo7MkKeqmuMZ0LBBIf8ZR-3UpYi1UZ2K0/edit?gid=1171265387#gid=1171265387", "category": "pixel-event", "parent_category": "実績・確認", "order": 6},
        {"title": "お知らせ", "icon_name": "Bell", "color": "text-yellow-500", "url": "/components/notices", "category": "pixel-event", "parent_category": "実績・確認", "order": 7},
        {"title": "事務局だより", "icon_name": "MessageSquare", "color": "text-lime-500", "url": "https://drive.google.com/drive/u/0/folders/1UZLCOUok0lKeMwyOw0SXKO4yTKpcvKcZ", "category": "pixel-event", "parent_category": "実績・確認", "order": 8},
        {"title": "マニュアル", "icon_name": "BookOpen", "color": "text-green-600", "url": "/components/tasks/manuals", "category": "pixel-event", "parent_category": "関連サイト", "order": 9},
        {"title": "Qast", "icon_name": "Globe", "color": "text-gray-600", "url": "https://agent0723.qast.jp/workspaces/1", "category": "pixel-event", "parent_category": "関連サイト", "order": 10},
        {"title": "GRT", "icon_name": "Globe", "color": "text-gray-600", "url": "https://googleretailtraining.exceedlms.com/student/catalog", "category": "pixel-event", "parent_category": "関連サイト", "order": 11},
        {"title": "Eli ポータルサイト", "icon_name": "Globe", "color": "text-gray-600", "url": "https://g-portal.eli-salestech.com/login", "category": "pixel-event", "parent_category": "関連サイト", "order": 12},
        {"title": "勤怠報告", "icon_name": "ClipboardList", "color": "text-red-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLScLsB7BxGpyGKGhk-o5q05Fft9_DKk_1ZcSWm5437wUU9Qm_w/viewform", "category": "pixel-shop", "parent_category": "申請・報告", "order": 1},
        {"title": "接客レポート", "icon_name": "MessageSquare", "color": "text-pink-500", "url": "https://docs.google.com/forms/d/e/1FAIpQLSc-khMem4gPwmHHj92u023EyUksXYAYMI4H2GkgE_sHUkbO0w/viewform?usp=header", "category": "pixel-shop", "parent_category": "申請・報告", "order": 2},
        {"title": "個人実績", "icon_name": "Activity", "color": "text-blue-600", "url": "/components/tasks/Individual-achievements", "category": "pixel-shop", "parent_category": "実績・管理", "order": 4},
        {"title": "店舗実績", "icon_name": "TrendingUp", "color": "text-purple-500", "url": "https://drive.google.com/drive/u/0/folders/1Qml4GNplF44Hi6bg5A8oVFdw4sBOphx4", "category": "pixel-shop", "parent_category": "実績・管理", "order": 5},
        {"title": "スイング管理表", "icon_name": "PieChart", "color": "text-indigo-500", "url": "/components/tasks/swing-management", "category": "pixel-shop", "parent_category": "実績・管理", "order": 6},
        {"title": "集客数カウント", "icon_name": "Users", "color": "text-yellow-600", "url": "/components/tasks/number-visitors", "category": "pixel-shop", "parent_category": "実績・管理", "order": 7},
        {"title": "お知らせ", "icon_name": "FileText", "color": "text-orange-500", "url": "/components/tasks/swing-management", "category": "pixel-shop", "parent_category": "お知らせ・情報", "order": 8},
        {"title": "事務局だより", "icon_name": "MessageSquare", "color": "text-green-500", "url": "https://drive.google.com/drive/u/0/folders/1UZLCOUok0lKeMwyOw0SXKO4yTKpcvKcZ", "category": "pixel-shop", "parent_category": "お知らせ・情報", "order": 9},
        {"title": "マニュアル", "icon_name": "FolderDot", "color": "text-black", "url": "https://drive.google.com/drive/u/0/folders/1il-rDfil4jwdl5bJ1s0RyY4100zHY9lj", "category": "pixel-shop", "parent_category": "シフト・ツール", "order": 10},
        {"title": "シフト", "icon_name": "Calendar", "color": "text-cyan-600", "url": "/components/tasks/sift-management", "category": "pixel-shop", "parent_category": "シフト・ツール", "order": 11},
        {"title": "端末・機能情報", "icon_name": "BookOpen", "color": "text-teal-600", "url": "https://drive.google.com/drive/u/0/folders/1xGiZdZHnH-21nObjgZPogn9IppvK7ypk", "category": "pixel-shop", "parent_category": "シフト・ツール", "order": 12}
    ]

    for t_data in tasks_data:
        TaskButton.objects.update_or_create(
            title=t_data['title'],
            category=t_data['category'],
            defaults=t_data
        )
    print("TaskButtons seeded successfully!")

if __name__ == "__main__":
    seed_missions()
    seed_tasks()
    print("All data seeded successfully!")
