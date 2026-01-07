import os
import django

# Djangoの設定を読み込む
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pixelshop_backend.settings')
django.setup()

from posts.models import Post, Video, OfficeNews, TreasurePost
from users.models import User
import uuid

def seed():
    # ユーザーの取得（いなければ作成）
    admin_user, _ = User.objects.get_or_create(
        user_id='admin',
        defaults={
            'email': 'admin@example.com',
            'display_name': '事務局',
            'is_staff': True,
            'is_superuser': True,
            'is_secretary': True
        }
    )
    if not admin_user.has_usable_password():
        admin_user.set_password('password123')
        admin_user.save()

    # 1. Post (おすすめ)
    if Post.objects.count() == 0:
        Post.objects.create(
            user_name='事務局',
            title='GarageGatewayへようこそ！',
            content='今日から新しいSNSがスタートします。皆様の投稿をお待ちしております！',
            user_uid='admin',
            is_featured=True,
            category='雑談'
        )
        Post.objects.create(
            user_name='事務局',
            title='新機能のお知らせ',
            content='動画機能がパワーアップしました。ぜひお試しください。',
            user_uid='admin',
            is_featured=False,
            category='雑談'
        )
        print("Created sample posts.")

    # 2. OfficeNews
    if OfficeNews.objects.count() == 0:
        OfficeNews.objects.create(
            title='1月のイベントスケジュール',
            external_url='https://example.com/event1',
            thumbnail='https://picsum.photos/400/225?random=1'
        )
        OfficeNews.objects.create(
            title='【重要】サーバーメンテナンスのお知らせ',
            external_url='https://example.com/news2',
            thumbnail='https://picsum.photos/400/225?random=2'
        )
        print("Created sample news.")

    # 3. Video (Sample videos removed as requested)
    pass

    # 4. TreasurePost
    if TreasurePost.objects.count() == 0:
        TreasurePost.objects.create(
            title='効率的なスケジューリングのコツ',
            content='カレンダーを活用して、タスクの優先順位を決めましょう。',
            category='仕事術',
            user_uid='admin'
        )
        print("Created sample treasure posts.")

if __name__ == '__main__':
    seed()
    print("Seeding complete!")
