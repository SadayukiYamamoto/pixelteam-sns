from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework import status
from users.models import User, Badge, Notification
from posts.models import Post
from .serializers import UserSerializer, PublicUserSerializer, NotificationSerializer, BadgeSerializer
from posts.serializers import PostSerializer
from rest_framework.permissions import IsAdminUser
import json

from posts.models import Post, VideoViewLog, UserTestResult, TreasurePost
from missions.utils import update_mission_progress
from django.utils import timezone
from datetime import timedelta

import firebase_admin
from firebase_admin import auth, credentials
import os

# Firebase Admin Init
try:
    if not firebase_admin._apps:
        # ベストプラクティス: 環境変数や専用パスから読み込む
        # ここでは開発用に backend/firebase-key.json を探す
        cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'firebase-key.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            print("Warning: firebase-key.json not found. Attempting default credentials.")
            # デプロイ環境などではデフォルト認証情報を使う
            firebase_admin.initialize_app()
except Exception as e:
    print(f"Firebase Init Error: {e}")

# === テンポラリ：ユーザー作成用 ===
@api_view(["GET"])
@permission_classes([AllowAny])
def temp_seed_user(request):
    user_id = "admin"
    password = "password123"
    try:
        if not User.objects.filter(user_id=user_id).exists():
            user = User.objects.create_user(
                user_id=user_id,
                email="admin@example.com",
                password=password,
                display_name="Administrator"
            )
            user.is_staff = True
            user.is_superuser = True
            user.save()
            return Response({"message": f"User {user_id} created successfully!"})
        else:
            return Response({"message": f"User {user_id} already exists."})
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# === Google ログイン ===
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def google_login_view(request):
    try:
        id_token = request.data.get('id_token')
        if not id_token:
             return Response({'error': 'No ID token provided'}, status=400)
        
        # 1. Firebaseトークン検証
        try:
            decoded_token = auth.verify_id_token(id_token)
            print(f"DEBUG: Token verified for UID: {decoded_token['uid']}")
        except Exception as ve:
            print(f"DEBUG: Token verification failed: {ve}")
            raise ve

        uid = decoded_token['uid']
        email = decoded_token.get('email')
        name = decoded_token.get('name') or email.split('@')[0]
        picture = decoded_token.get('picture')

        print(f"DEBUG: Processing user: {email} (UID: {uid})")

        # 2. ユーザー特定 (UID -> Email の順)
        user = None
        try:
             # Firebase UID で検索
             user = User.objects.get(user_id=uid)
        except User.DoesNotExist:
             pass

        if not user and email:
             try:
                 # Email で検索 (既存ユーザーとの紐付け)
                 user = User.objects.get(email=email)
                 # 注: 既存ユーザーの user_id は変更しない（"admin"などを維持するため）
             except User.DoesNotExist:
                 # 3. 新規作成
                 print(f"DEBUG: Creating new user for email: {email}")
                 user = User.objects.create(
                     user_id=uid,
                     email=email,
                     display_name=name,
                     profile_image=picture,
                     password="" 
                 )
                 user.set_unusable_password()
                 user.save()
                 print(f"DEBUG: User created successfully: {user.display_name}")

        # 4. トークン発行
        token, _ = Token.objects.get_or_create(user=user)

        # 5. ログイン回数加算
        user.login_count += 1
        user.save()

        # 6. ミッション進捗
        update_mission_progress(user, 'login')

        return Response({
            "message": "ログイン成功",
            "display_name": user.display_name,
            "email": user.email,
            "user_id": user.user_id,
            "token": token.key,
            "profile_image": user.profile_image,
            "team": user.team,
            "is_secretary": user.is_secretary,
        "is_admin": user.is_admin_or_secretary,
            "is_staff": user.is_staff,
            "status": "success"
        })

    except Exception as e:
        print(f"Google Login Error: {e}")
        return Response({'error': '認証に失敗しました', 'details': str(e)}, status=400)


# === ログイン ===
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    print(f"DEBUG: Login attempts for: {request.data.get('user_id')}")
    login_input = request.data.get("user_id")
    password = request.data.get("password")

    try:
        # メール or user_id 両対応
        if "@" in login_input:
            user = User.objects.get(email=login_input)
        else:
            user = User.objects.get(user_id=login_input)
    except User.DoesNotExist:
        print(f"DEBUG: User not found for: {login_input}")
        return Response({"error": "ユーザーが存在しません"}, status=401)

    if not user.check_password(password):
        print(f"DEBUG: Password mismatch for user: {user.user_id}")
        return Response({"error": "パスワードが違います"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)

    # ログイン回数加算
    user.login_count += 1
    user.save()

    # ミッション進捗
    update_mission_progress(user, 'login')

    return Response({
        "message": "ログイン成功",
        "display_name": user.display_name,
        "email": user.email,
        "user_id": user.user_id,
        "token": token.key,
        "profile_image": user.profile_image, 
        "team": user.team,
        "is_secretary": user.is_secretary,
        "is_admin": user.is_admin_or_secretary,
        "is_staff": user.is_staff,
        "status": "success"
    })


# === 新規登録 ===
@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def signup_view(request):
    data = json.loads(request.body)
    email = data.get("email")
    password = data.get("password")
    user_id = data.get("user_id")
    display_name = data.get("display_name", "ゲスト")

    if User.objects.filter(email=email).exists():
        return Response({"error": "このメールアドレスは既に使用されています"}, status=400)
    
    if User.objects.filter(user_id=user_id).exists():
        return Response({"error": "このユーザーIDは既に使用されています"}, status=400)

    try:
        user = User.objects.create_user(
            user_id=user_id,
            email=email,
            password=password,
            display_name=display_name
        )
        token, _ = Token.objects.get_or_create(user=user)

        # ログイン回数加算
        user.login_count = 1
        user.save()

        return Response({
            "message": "登録成功",
            "display_name": user.display_name,
            "email": user.email,
            "user_id": user.user_id,
            "token": token.key,
            "profile_image": user.profile_image,
            "team": user.team,
            "is_secretary": user.is_secretary,
        "is_admin": user.is_admin_or_secretary,
            "is_staff": user.is_staff,
            "status": "success"
        }, status=201)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# === マイページ ===
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mypage_view(request, user_id):
    print("=== MYPAGE API ===")
    print("リクエストユーザー:", request.user.user_id)
    print("URLの user_id:", user_id)

    # ✓ 自分以外のユーザー情報は権限エラー
    # ケース不一致 (admin vs Admin) を許容するために小文字化して比較
    if request.user.user_id.lower() != user_id.lower():
        return Response({"detail": "権限がありません。"}, status=403)

    user = request.user

    # --- 投稿取得 ---
    posts = Post.objects.filter(user_uid=user.user_id).order_by("-created_at")
    post_data = PostSerializer(posts, many=True).data

    # --- バッジ取得 ---
    badges = user.badges.all()
    badge_data = BadgeSerializer(badges, many=True).data

    # --- レスポンスまとめて返す ---
    return Response({
        "user_id": user.user_id,
        "display_name": user.display_name,
        "email": user.email,
        "profile_image": user.profile_image,
        "team": user.team,
        "pixel_product": user.pixel_product,

        # 🔥 追加すべき情報
        "points": user.points,
        "level": user.level,
        "exp": user.exp,
        "expMax": user.expMax,
        "shop_name": user.shop_name,
        "introduction": user.introduction, # 🔥 追加

        "badges": badge_data,
        "posts": post_data,
        "is_secretary": user.is_secretary,
        "is_admin": user.is_admin_or_secretary,
        "is_staff": user.is_staff,
    })


# === プロフィール更新 ===
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    display_name = request.data.get("display_name")
    profile_image = request.data.get("profile_image")
    team = request.data.get("team")
    shop_name = request.data.get("shop_name")
    introduction = request.data.get("introduction")

    if display_name:
        user.display_name = display_name
    if profile_image:
        user.profile_image = profile_image
    if team:
        user.team = team
    if shop_name is not None:
        user.shop_name = shop_name
    if introduction is not None:
        user.introduction = introduction

    user.save()
    return Response({
        "message": "Profile updated successfully",
        "display_name": user.display_name,
        "profile_image": user.profile_image,
        "team": user.team,
        "shop_name": user.shop_name,
        "introduction": user.introduction,
    }, status=status.HTTP_200_OK)


from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User

@api_view(["GET"])
def get_user_badges(request, user_id):
    user = User.objects.get(user_id=user_id)
    badges = user.badges.all()
    serializer = BadgeSerializer(badges, many=True)
    return Response(serializer.data)


# === 管理者用: 全ユーザー取得 ===
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    # 簡易的な管理者チェック (is_staff or 特定ID)
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    users = User.objects.all().order_by("-date_joined")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


# === 管理者用: ユーザー詳細 & 編集 ===
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    try:
        target_user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return Response({"detail": "ユーザーが見つかりません"}, status=404)

    if request.method == 'GET':
        serializer = UserSerializer(target_user)
        # バッジ情報も含める
        data = serializer.data
        data['badges'] = BadgeSerializer(target_user.badges.all(), many=True).data
        return Response(data)

    if request.method == 'PATCH':
        # Admin can update points, display_name, team, profile_image, badges
        data = request.data
        old_points = target_user.points
        points_updated = False
        
        if 'points' in data:
            target_user.points = int(data['points'])
            if target_user.points != old_points:
                points_updated = True
        
        if 'exp' in data:
            target_user.exp = int(data['exp'])
        
        if 'display_name' in data:
            target_user.display_name = data['display_name']
        if 'team' in data:
            target_user.team = data['team']
        if 'profile_image' in data:
            target_user.profile_image = data['profile_image']
        if 'shop_name' in data:
            target_user.shop_name = data['shop_name']
        if 'is_secretary' in data:
            target_user.is_secretary = bool(data['is_secretary'])
            
        # バッジの更新 (IDリストを受け取ってセットする)
        if 'badge_ids' in data:
            # badge_ids = [1, 3, 5]
            badge_ids = data['badge_ids']
            badges = Badge.objects.filter(id__in=badge_ids)
            target_user.badges.set(badges)

        target_user.save()

        # --- 通知の作成 ---
        if points_updated:
            diff = target_user.points - old_points
            diff_str = f"+{diff}" if diff > 0 else f"{diff}"
            Notification.objects.create(
                recipient=target_user,
                notification_type='POINT',
                message=f"ポイントが変動しました ({diff_str})。現在のポイント: {target_user.points}"
            )

        return Response(UserSerializer(target_user).data)


# === 管理者用: バッジ一覧 & 作成 ===
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def badge_list_create(request):
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    if request.method == 'GET':
        badges = Badge.objects.all()
        serializer = BadgeSerializer(badges, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = BadgeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# === 管理者用: バッジ付与 (簡易版API) ===
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_badge(request):
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    user_id = request.data.get('user_id')
    badge_id = request.data.get('badge_id')

    try:
        target_user = User.objects.get(user_id=user_id)
        badge = Badge.objects.get(id=badge_id)
        target_user.badges.add(badge)
        target_user.save()

        # --- 通知の作成 ---
        Notification.objects.create(
            recipient=target_user,
            notification_type='BADGE',
            badge_name=badge.name,
            message=f"新しいバッジ「{badge.name}」を獲得しました！"
        )

        return Response({"message": f"バッジ「{badge.name}」を {target_user.display_name} に付与しました"})
    except User.DoesNotExist:
        return Response({"detail": "ユーザーが見つかりません"}, status=404)
    except Badge.DoesNotExist:
        return Response({"detail": "バッジが見つかりません"}, status=404)


# === 一般ユーザー用: ユーザー検索 (メンション用) ===
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """
    メンション候補などのためにユーザーを検索/一覧取得する
    ?q=keyword で display_name または user_id を部分一致検索
    """
    query = request.GET.get('q', '')
    users = User.objects.all().order_by("-date_joined")

    if query:
        from django.db.models import Q
        users = users.filter(
            Q(display_name__icontains=query) | Q(user_id__icontains=query)
        )

    # 全件は多すぎる場合があるので limit を設ける
    users = users[:50]

    data = []
    for u in users:
        data.append({
            "user_id": u.user_id,
            "display_name": u.display_name,
            "profile_image": u.profile_image,
        })
    
    return Response(data)


# === 公開プロフィール (他ユーザー閲覧用) ===
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def public_profile_view(request, user_id):
    try:
        user = User.objects.get(user_id__iexact=user_id)
    except User.DoesNotExist:
        return Response({"detail": "ユーザーが見つかりません"}, status=404)

    # 自分自身を見ている場合は制限なしの mypage_view にリダイレクト的に扱うか、
    # ここで自分も見れるようにしておく。
    # 基本的に機密情報 (email) を除いた情報を返す。

    # --- 投稿取得 ---
    posts = Post.objects.filter(user_uid=user.user_id).order_by("-created_at")
    post_data = PostSerializer(posts, many=True).data

    # --- バッジ取得 ---
    badges = user.badges.all()
    badge_data = BadgeSerializer(badges, many=True).data

    # --- レスポンス ---
    return Response({
        "user_id": user.user_id,
        "display_name": user.display_name,
        "profile_image": user.profile_image,
        "team": user.team,
        "pixel_product": user.pixel_product,
        "introduction": user.introduction, # 🔥 追加
        "points": user.points,
        "level": user.level,
        "exp": user.exp,
        "expMax": user.expMax,
        "badges": badge_data,
        "posts": post_data,
    })


# === 通知一覧 ===
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    # 1ヶ月以前の未読通知を削除
    one_month_ago = timezone.now() - timedelta(days=30)
    Notification.objects.filter(
        recipient=request.user, 
        created_at__lt=one_month_ago,
        is_read=False
    ).delete()

    # 1ヶ月以内の通知のみ取得
    notifications = Notification.objects.filter(
        recipient=request.user,
        created_at__gte=one_month_ago
    ).order_by('-created_at')[:50]
    
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


# === 通知を削除 ===
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, recipient=request.user)
        notification.delete()
        return Response({"message": "Notification deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)


# === 通知を既読にする ===
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    # すべて既読にする
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({"message": "All notifications marked as read"})


# === 未読通知数 ===
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notification_count(request):
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return Response({"unread_count": count})
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_user_analytics(request):
    """
    管理者用：ユーザー別統計（投稿数、視聴時間、テスト数、ノウハウ投稿数）
    """
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    users = User.objects.all().order_by('-date_joined')
    data = []

    for u in users:
        # 1. 投稿数 (Post)
        post_count = Post.objects.filter(user_uid=u.user_id).count()

        # 2. 動画視聴 (VideoViewLog)
        logs = VideoViewLog.objects.filter(user=u)
        video_views = logs.count()
        total_watch_time = sum(log.watch_time for log in logs)

        # 3. テスト受講 (UserTestResult)
        test_results = UserTestResult.objects.filter(user=u)
        tests_taken = test_results.count()
        tests_passed = test_results.filter(is_passed=True).count()

        # 4. ノウハウ投稿 (TreasurePost)
        know_how_count = TreasurePost.objects.filter(user_uid=u.user_id).count()

        data.append({
            "user_id": u.user_id,
            "display_name": u.display_name,
            "shop_name": u.shop_name,
            "post_count": post_count,
            "video_views": video_views,
            "watch_time": total_watch_time,
            "tests_taken": tests_taken,
            "tests_passed": tests_passed,
            "know_how_count": know_how_count,
            "points": u.points,
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_shop_analytics(request):
    """
    管理者用：店舗別・週報＆ノウハウ提出状況 (8週分)
    """
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    from datetime import datetime, timedelta
    from django.utils import timezone

    shops = User.objects.values_list('shop_name', flat=True).distinct()
    shops = [s for s in shops if s] # None/Empty除外

    # 過去8週間（月曜始まり）
    weeks = []
    today = timezone.now().date()
    # 直近の月曜日
    start_of_week = today - timedelta(days=today.weekday())
    
    for i in range(8):
        current_start = start_of_week - timedelta(weeks=i)
        current_end = current_start + timedelta(days=6)
        weeks.append((current_start, current_end))

    data = []

    for shop in shops:
        shop_users = User.objects.filter(shop_name=shop)
        shop_user_ids = shop_users.values_list('user_id', flat=True)
        
        shop_data = {
            "shop_name": shop,
            "weeks": []
        }

        for start_date, end_date in weeks:
            # datetime型に変換してフィルタリング（Timezone aware）
            start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
            end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

            # 1. 個人報告 (Post)
            personal_reports = Post.objects.filter(
                user_uid__in=shop_user_ids,
                category='個人報告',
                created_at__range=(start_dt, end_dt)
            )
            report_data = []
            for p in personal_reports:
                report_data.append({
                    "id": str(p.id),
                    "user_name": p.user_name or p.user_uid, # user_nameが保存されていれば使う
                    "created_at": p.created_at
                })

            # 2. ノウハウ提出 (TreasurePost)
            know_hows = TreasurePost.objects.filter(
                user_uid__in=shop_user_ids,
                created_at__range=(start_dt, end_dt)
            )
            know_how_data = []
            for k in know_hows:
                # user_uidから名前を引く必要がある（TreasurePostにuser_nameがない場合）
                # 今回は軽量化のため user_uid を返すか、一時的に辞書で解決
                u_name = "Unknown"
                user_obj = shop_users.filter(user_id=k.user_uid).first()
                if user_obj:
                    u_name = user_obj.display_name
                
                know_how_data.append({
                    "id": str(k.id),
                    "user_name": u_name,
                    "title": k.title
                })

            shop_data["weeks"].append({
                "start_date": start_date,
                "end_date": end_date,
                "label": f"{start_date.month}/{start_date.day} 〜 {end_date.month}/{end_date.day}",
                "personal_reports": report_data,
                "know_hows": know_how_data,
                "know_how_submitted": len(know_hows) > 0 # ノウハウ提出済みか
            })

        data.append(shop_data)

    return Response(data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_update_points(request):
    """
    管理者用：ポイント直接更新 API
    {
        "user_id": "xxx",
        "points": 5000 (new total)
    }
    """
    # 簡易権限チェック
    if not request.user.is_admin_or_secretary:
         return Response({"detail": "権限がありません"}, status=403)

    target_user_id = request.data.get("user_id")
    new_points = request.data.get("points")

    if not target_user_id or new_points is None:
        return Response({"detail": "user_id and points are required"}, status=400)

    try:
        user = User.objects.get(user_id=target_user_id)
        old_points = user.points
        user.points = int(new_points)
        user.save()

        # --- 通知の作成 ---
        if user.points != old_points:
            diff = user.points - old_points
            diff_str = f"+{diff}" if diff > 0 else f"{diff}"
            Notification.objects.create(
                recipient=user,
                notification_type='POINT',
                message=f"ポイントが変動しました ({diff_str})。現在のポイント: {user.points}"
            )

        return Response({"detail": "Points updated", "new_points": user.points})
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)
    except ValueError:
        return Response({"detail": "Invalid points value"}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_update_exp(request):
    """
    管理者用：ユーザーのEXPを直接更新する
    """
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    target_user_id = request.data.get("user_id")
    new_exp = request.data.get("exp")

    if not target_user_id or new_exp is None:
        return Response({"detail": "user_id and exp are required"}, status=400)

    try:
        user = User.objects.get(user_id=target_user_id)
        user.exp = int(new_exp)
        user.save() # User.save() will recalculate Level

        return Response({"detail": "EXP updated", "new_exp": user.exp, "new_level": user.level})
    except User.DoesNotExist:
        return Response({"detail": "User not found"}, status=404)
    except ValueError:
        return Response({"detail": "Invalid exp value"}, status=400)


# === ログインポップアップ設定 (Admin) ===
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_login_popup_setting(request):
    from posts.models import Notice, LoginPopupSetting
    from posts.serializers import NoticeSerializer

    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    if request.method == 'GET':
        setting = LoginPopupSetting.objects.first()
        notices = Notice.objects.all().order_by('-created_at')
        
        return Response({
            "current_setting": {
                "notice_id": str(setting.notice.id) if setting else None,
                "is_active": setting.is_active if setting else False,
            },
            "notices": NoticeSerializer(notices, many=True).data
        })

    if request.method == 'POST':
        notice_id = request.data.get('notice_id')
        is_active = request.data.get('is_active', True)

        try:
            notice = Notice.objects.get(id=notice_id)
            setting, created = LoginPopupSetting.objects.get_or_create(
                id=LoginPopupSetting.objects.first().id if LoginPopupSetting.objects.exists() else None,
                defaults={'notice': notice}
            )
            setting.notice = notice
            setting.is_active = is_active
            setting.save()

            return Response({"message": "Popup setting updated"})
        except Notice.DoesNotExist:
            return Response({"error": "Notice not found"}, status=404)


# === ログインポップアップ取得 (User) ===
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_login_popup(request):
    from posts.models import LoginPopupSetting
    from posts.serializers import NoticeSerializer

    user = request.user

    if request.method == 'GET':
        # 条件: 2回目以降のログイン 且つ 有効な設定があること
        if user.login_count < 2:
            return Response({"show": False, "reason": "first_login"})

        setting = LoginPopupSetting.objects.filter(is_active=True).first()
        if not setting:
            return Response({"show": False, "reason": "no_active_popup"})

        # すでに見たポップアップかチェック
        if user.last_seen_popup_id == setting.id:
            return Response({"show": False, "reason": "already_seen"})

        return Response({
            "show": True,
            "popup_id": str(setting.id),
            "notice": NoticeSerializer(setting.notice).data
        })

    if request.method == 'POST':
        # 既読にする
        popup_id = request.data.get('popup_id')
        if popup_id:
            user.last_seen_popup_id = popup_id
            user.save()
            return Response({"message": "Popup marked as seen"})
        return Response({"error": "popup_id is required"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user_profile(request):
    user = request.user
    return Response({
        "user_id": user.user_id,
        "display_name": user.display_name,
        "email": user.email,
        "profile_image": user.profile_image,
        "is_secretary": user.is_secretary,
        "is_admin": user.is_admin_or_secretary,
        "is_staff": user.is_staff,
        "team": user.team,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_shop_list(request):
    """
    全店舗名リスト取得（管理者専用）
    """
    if not request.user.is_admin_or_secretary:
        return Response({"error": "権限がありません"}, status=403)
        
    shops = User.objects.exclude(shop_name__in=['', None]).values_list('shop_name', flat=True).distinct()
    return Response(list(shops))
