from missions.models import Mission

def seed_missions():
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

if __name__ == "__main__":
    import os
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pixelshop_backend.settings')
    django.setup()
    seed_missions()
    print("Missions seeded successfully!")
