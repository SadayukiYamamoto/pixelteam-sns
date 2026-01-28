import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.pagination import PageNumberPagination
from .models import Post, Comment, Video, VideoViewLog, UserInteractionLog, TreasurePost, Notice, VideoTest, Question, Choice, UserTestResult, UserTestAnswer, Survey, SurveyQuestion, SurveyChoice, SurveyResponse, SurveyAnswer, Hashtag, OfficeNews, TaskButton
from users.models import User, Notification
from .serializers import PostSerializer, CommentSerializer, VideoSerializer, TreasurePostSerializer, NoticeSerializer, SurveySerializer, OfficeNewsSerializer, TaskButtonSerializer
from django.shortcuts import get_object_or_404
import firebase_admin
from firebase_admin import firestore
from missions.utils import update_mission_progress

@api_view(['GET'])
@permission_classes([AllowAny])
def search_hashtags(request):
    """
    Search hashtags by query string.
    Url: /api/hashtags/search/?query=<str>
    """
    query = request.GET.get('query', '')
    if len(query) < 1:
        return Response([])
    
    hashtags = Hashtag.objects.filter(name__icontains=query)[:10]
    data = [{"id": h.name, "label": h.name} for h in hashtags]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def posts_with_user(request):
    try:
        offset = int(request.GET.get('offset', 0))
        limit = int(request.GET.get('limit', 5))
        tag_param = request.GET.get('tag')
        category_param = request.GET.get('category')
        
        user = request.user
        posts = Post.objects.all()

        # カテゴリフィルタ
        if category_param:
            posts = posts.filter(category=category_param)
        
        # 事務局（is_secretary）でない場合は制限（雑談・カテゴリなしを許可）
        if not user.is_secretary:
            from django.db.models import Q
            posts = posts.filter(Q(category='雑談') | Q(category='') | Q(category__isnull=True))
        
        # タグフィルタ
        if tag_param:
            posts = posts.filter(hashtags__name=tag_param)
            
        posts_qb = posts.order_by('-created_at')[offset:offset + limit]

        # ✅ 修正ポイント：PostSerializerを使う
        serializer = PostSerializer(posts_qb, many=True, context={'request': request})

        total_count = posts.count()

        has_next = total_count > offset + limit
        # ✅ ここを追加（ログインユーザーの「いいね状態」を付与）
        posts_data = serializer.data
        for post_data in posts_data:
            post_id = post_data["id"]
            post_obj = Post.objects.get(id=post_id)
            post_data["liked"] = user in post_obj.likes.all()  # ← これが「赤いハート維持」の要！

        return Response({"results": posts_data, "has_next": has_next})

    except Exception as e:
        print("❌ error:", e)
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_likes_list(request, pk):
    post = get_object_or_404(Post, pk=pk)

    try:
        likes = post.likes.all()
        data = []

        for user in likes:
            data.append({
                "id": user.id,
                "display_name": getattr(user, "display_name", None),
                "profile_image": getattr(user, "profile_image", None),
            })

        return Response(data, status=status.HTTP_200_OK)

    except Exception as e:
        print("いいね一覧エラー:", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def comments_view(request, pk):
    post = get_object_or_404(Post, pk=pk)

    if request.method == 'GET':
        comments = post.comments.order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        content = request.data.get('content') or ""
        image_url = request.data.get('image_url')
        parent_id = request.data.get('parent')
        user_name = request.user.display_name or request.user.user_id or "匿名"  # ✅ フォールバックを追加

        parent_comment = None
        if parent_id:
            try:
                parent_comment = Comment.objects.get(id=parent_id)
            except (Comment.DoesNotExist, ValueError, TypeError):
                parent_comment = None

        # Commentモデルに合わせて user_name, user_uid で登録
        comment = Comment.objects.create(
            post=post,
            parent=parent_comment,
            user_name=user_name,
            user_uid=str(request.user.user_id),
            content=content,
            image_url=image_url
        )

        # --- 通知の作成 ---
        user = request.user
        
        # 0. 返信対象のコメント投稿者への通知（自分以外）
        if parent_comment and str(parent_comment.user_uid) != str(user.user_id):
            parent_author = User.objects.filter(user_id=parent_comment.user_uid).first()
            if parent_author:
                Notification.objects.create(
                    recipient=parent_author,
                    sender=user,
                    notification_type='REPLY',
                    post_id=str(post.id),
                    comment_id=comment.id,
                    message=f"{user.display_name}さんがあなたのコメントに返信しました。"
                )

        # 1. 投稿者への通知（自分以外 かつ まだ通知してない場合）
        post_author_uid = post.user_uid
        is_post_author_same_as_parent = parent_comment and str(parent_comment.user_uid) == str(post_author_uid)
        
        if post_author_uid and str(post_author_uid) != str(user.user_id) and not is_post_author_same_as_parent:
            author = User.objects.filter(user_id=post_author_uid).first()
            if author:
                Notification.objects.create(
                    recipient=author,
                    sender=user,
                    notification_type='COMMENT',
                    post_id=str(post.id),
                    comment_id=comment.id,
                    message=f"{user.display_name}さんがあなたの投稿にコメントしました。"
                )

        # 2. メンション通知
        import re
        # TipTap format: data-id="user_id"
        mention_ids_tiptap = re.findall(r'data-id="([^"]+)"', content)
        # Legend format: @[id] or @id
        mention_matches_raw = re.findall(r"@(?:\[([^\]]+)\]|([a-zA-Z0-9_\.]+))", content)
        mention_ids_legacy = [m[0] or m[1] for m in mention_matches_raw]
        
        # Merge and unique
        mention_matches = list(set(mention_ids_tiptap + mention_ids_legacy))

        # Check for @ALL
        is_all_mentioned = any(m.upper() == "ALL" for m in mention_matches)
        
        if is_all_mentioned:
            # 全員に通知
            other_users = User.objects.filter(is_active=True).exclude(user_id=user.user_id)
            for target_user in other_users:
                Notification.objects.create(
                    recipient=target_user,
                    sender=user,
                    notification_type='MENTION',
                    post_id=str(post.id),
                    comment_id=comment.id,
                    message=f"{user.display_name}さんがコメントで全員をメンションしました。"
                )
        else:
            for mentioned_user_id in mention_matches:
                # メンションされた相手が自分でない場合
                if str(mentioned_user_id) != str(user.user_id):
                    target_user = User.objects.filter(user_id=mentioned_user_id).first()
                    if target_user:
                        Notification.objects.create(
                            recipient=target_user,
                            sender=user,
                            notification_type='MENTION',
                            post_id=str(post.id),
                            comment_id=comment.id,
                            message=f"{user.display_name}さんがコメントであなたをメンションしました。"
                        )

        serializer = CommentSerializer(comment)

        # ミッション進捗
        update_mission_progress(user, 'comment')

        return Response(serializer.data, status=201)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    """
    投稿に対して「いいね」をトグル（追加/削除）するAPI
    """
    post = get_object_or_404(Post, pk=pk)
    user = request.user

    # PostモデルにManyToManyField(likes)がある前提
    if not hasattr(post, 'likes'):
        return Response({"error": "Postモデルにlikesフィールドが存在しません"}, status=status.HTTP_400_BAD_REQUEST)

    if user in post.likes.all():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
        liked = True

        # --- 通知の作成 ---
        # 投稿者に「いいね」の通知を送る（自分以外）
        post_author_uid = post.user_uid
        if post_author_uid and str(post_author_uid) != str(user.user_id):
            author = User.objects.filter(user_id=post_author_uid).first()
            if author:
                Notification.objects.create(
                    recipient=author,
                    sender=user,
                    notification_type='LIKE',
                    post_id=str(post.id),
                    message=f"{user.display_name}さんがあなたの投稿にいいねしました。"
                )

    if liked:
        # ミッション進捗
        update_mission_progress(user, 'like')

    return Response({
        "liked": liked,
        "likes_count": post.likes.count()
    }, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_post(request, pk):
    try:
        post = Post.objects.get(pk=pk)
        if str(post.user_uid) != str(request.user.user_id):
            return Response({'error': '編集権限がありません'}, status=status.HTTP_403_FORBIDDEN)

        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Post.DoesNotExist:
        return Response({'error': '投稿が見つかりません'}, status=status.HTTP_404_NOT_FOUND)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_post(request, pk):
    try:
        post = Post.objects.get(id=pk)
        # 投稿者または事務局だけが削除できるようにチェック
        if post.user_uid != request.user.user_id and not request.user.is_admin_or_secretary:
            return Response({"error": "この投稿を削除する権限がありません。"}, status=status.HTTP_403_FORBIDDEN)

        print(f"🗑 Deleting post: {pk} (user: {request.user.user_id})")
        post.delete()
        print(f"✅ Successfully deleted post: {pk}")
        return Response({"message": "投稿を削除しました。"}, status=status.HTTP_200_OK)
    except Post.DoesNotExist:
        return Response({"error": "投稿が見つかりませんでした。"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"❌ Error deleting post {pk}: {e}")
        import traceback
        traceback.print_exc()
        return Response({"error": f"削除時にエラーが発生しました: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def post_detail(request, pk):
    try:
        post = Post.objects.get(pk=pk)
    except Post.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)

    if request.method == 'GET':
        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = PostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        post.delete()
        return Response(status=204)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def posts_list_create(request):
    if request.method == "GET":
        posts = Post.objects.order_by("-created_at")

        # タグ検索 ?tag=xxx
        tag_param = request.GET.get('tag')
        if tag_param:
            posts = posts.filter(hashtags__name=tag_param)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == "POST":
        data = request.data.copy()
        data["user_uid"] = str(request.user.user_id)  # ✅ ここで強制付与(文字列化)
        serializer = PostSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save()

            # --- メンション & ハッシュタグ処理 ---
            import re
            content = post.content
            # 1. メンション抽出
            # TipTap format: data-id="user_id"
            mention_ids_tiptap = re.findall(r'data-id="([^"]+)"', content)
            
            # HTMLタグを除去してから抽出（legacy/plaintext 用）
            clean_content = re.sub(r'<[^>]+>', ' ', content)
            mention_matches_raw = re.findall(r"@(?:\[([^\]]+)\]|([a-zA-Z0-9_\.]+))", clean_content)
            mention_ids_legacy = [m[0] or m[1] for m in mention_matches_raw]

            mention_matches = list(set(mention_ids_tiptap + mention_ids_legacy))

            # Check for @ALL
            is_all_mentioned = any(m.upper() == "ALL" for m in mention_matches)

            if is_all_mentioned:
                # 全員に通知
                other_users = User.objects.filter(is_active=True).exclude(user_id=request.user.user_id)
                for target_user in other_users:
                    Notification.objects.create(
                        recipient=target_user,
                        sender=request.user,
                        notification_type='MENTION',
                        post_id=str(post.id),
                        message=f"{request.user.display_name}さんが投稿で全員をメンションしました。"
                    )
            else:
                for user_id in mention_matches:
                    target_user = User.objects.filter(user_id=user_id).first()
                    if target_user:
                        post.mentions.add(target_user)
                        
                        # --- 通知 ---
                        if str(target_user.user_id) != str(request.user.user_id):
                            Notification.objects.create(
                                recipient=target_user,
                                sender=request.user,
                                notification_type='MENTION',
                                post_id=str(post.id),
                                message=f"{request.user.display_name}さんが投稿であなたをメンションしました。"
                            )

            # 2. ハッシュタグ抽出: #tag
            hashtag_matches = re.findall(r"#([^\s#]+)", clean_content)
            for tag_name in hashtag_matches:
                # 既存があれば取得、なければ作成
                hashtag, created = Hashtag.objects.get_or_create(name=tag_name)
                post.hashtags.add(hashtag)
            
            post.save()
            # -----------------------------------

            # ミッション進捗
            update_mission_progress(request.user, 'post')

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


FIREBASE_PROJECT_ID = "pixelshopsns"  # ← あなたのFirebaseプロジェクトID
FIREBASE_API_KEY = "AIzaSyAv2HflOcrCpoA_yS_9ZMCzAqHxEHMinGM"  # ← Firebaseの設定ページから取得

@api_view(['GET'])
@permission_classes([AllowAny])
def video_list(request):
    """Firestore + Django のマージ版一覧を返す"""
    FIREBASE_PROJECT_ID = "pixelshopsns"
    firestore_url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/pixtubePosts"

    # 1. Django から動画取得
    django_videos = Video.objects.all()
    django_map = {v.id: v for v in django_videos}

    # 2. Firestore から動画取得 (安全版)
    firestore_videos = []
    try:
        resp = requests.get(firestore_url)
        if resp.status_code == 200:
            docs = resp.json().get("documents", [])
            for doc in docs:
                fields = doc.get("fields", {})
                vid = doc.get("name", "").split("/")[-1]
                
                def get_str(f): return fields.get(f, {}).get("stringValue", "")
                def get_int(f):
                    try: return int(fields.get(f, {}).get("integerValue", "0"))
                    except: return 0

                firestore_videos.append({
                    "id": vid,
                    "title": get_str("title"),
                    "user": get_str("author") or "事務局",
                    "views": get_int("views"),
                    "duration": get_str("duration") or "0:00",
                    "thumb": get_str("thumbnail"),
                    "video_url": get_str("src"),
                    "userAvatar": get_str("userAvatar"),
                    "created_at": get_str("createdAt"),
                    "is_featured": False,
                    "is_short": False
                })
    except Exception as e:
        print("Firestore fetch error:", e)

    # 3. マージ処理
    # Firestore にあるものはベースにし、Django にデータがあれば上書き
    # Django にしかないもの（アップロード直後など）も末尾に追加
    final_videos_map = {}

    for fv in firestore_videos:
        vid = fv["id"]
        if vid in django_map:
            dv = django_map[vid]
            fv.update({
                "title": dv.title or fv["title"],
                "user": dv.user or fv["user"],
                "views": dv.views,
                "thumb": dv.thumb or fv["thumb"],
                "video_url": dv.video_url or fv["video_url"],
                "is_featured": dv.is_featured,
                "is_short": dv.is_short,
                "category": dv.category,
                "order": dv.order,
                "created_at": dv.created_at.isoformat() if dv.created_at else fv["created_at"]
            })
        final_videos_map[vid] = fv

    for vid, dv in django_map.items():
        if vid not in final_videos_map:
            final_videos_map[vid] = {
                "id": dv.id,
                "title": dv.title,
                "user": dv.user,
                "views": dv.views,
                "duration": dv.duration,
                "thumb": dv.thumb,
                "video_url": dv.video_url,
                "userAvatar": dv.userAvatar,
                "created_at": dv.created_at.isoformat() if dv.created_at else None,
                "is_featured": dv.is_featured,
                "is_short": dv.is_short,
                "category": dv.category,
                "order": dv.order
            }

    # 4. ユーザー進捗の取得
    watched_ids = set()
    passed_ids = set()
    video_ids = list(final_videos_map.keys())
    has_test_ids = set(VideoTest.objects.filter(video_id__in=video_ids).values_list('video_id', flat=True))

    if request.user and request.user.is_authenticated:
        watched_ids = set(VideoViewLog.objects.filter(user=request.user, video_id__in=video_ids).values_list('video_id', flat=True))
        passed_ids = set(UserTestResult.objects.filter(user=request.user, video_id__in=video_ids, is_passed=True).values_list('video_id', flat=True))

    results = []
    for vid, vdata in final_videos_map.items():
        vdata.update({
            "is_watched": vid in watched_ids,
            "is_test_passed": vid in passed_ids,
            "has_test": vid in has_test_ids
        })
        results.append(vdata)

    # ソート (降順)
    results.sort(key=lambda x: x.get("created_at") or "", reverse=True)

    return Response(results)

@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])
def video_detail(request, video_id):
    # IDをクリーンアップ
    video_id = video_id.strip('/')
    
    if request.method == 'DELETE':
        # 認証 & 管理者チェック
        if not request.user.is_authenticated:
            return Response({"detail": "認証が必要です"}, status=401)
        
        # AnonymousUser対策のため getattr で安全に取得
        is_admin = getattr(request.user, 'is_admin_or_secretary', False)
        if not is_admin:
             return Response({"detail": "権限がありません"}, status=403)

        print(f"DEBUG: DELETE video request for id: {video_id}", flush=True)
        
        try:
             # 1. Firestoreから削除 (オプショナル)
             try:
                 if firebase_admin._apps:
                     db = firestore.client()
                     db.collection('pixtubePosts').document(video_id).delete()
                     print(f"DEBUG: Firestore document {video_id} deleted (if existed)", flush=True)
             except Exception as fe:
                 print("Firestore delete warning:", fe, flush=True)
             
             # 2. Django DBから削除
             deleted_count, _ = Video.objects.filter(id=video_id).delete()
             print(f"DEBUG: Django DB Video deleted. Count: {deleted_count}", flush=True)

             return Response({"message": "Video deleted"}, status=status.HTTP_200_OK)
        except Exception as e:
             print("Video delete error:", e)
             import traceback
             traceback.print_exc()
             return Response({"error": str(e)}, status=500)

    # --- GET ---
    print(f"DEBUG: GET video_detail for id: {video_id}")
    
    # 1. Django DB で検索
    video_obj = Video.objects.filter(id=video_id).first()
    if video_obj:
        print(f"DEBUG: Found video in Django DB: {video_obj.title}")
    
    # 2. Firestore からの取得を試みる (情報の補完または同期のため)
    firestore_data = None
    try:
        url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/pixtubePosts/{video_id}"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            firestore_data = resp.json().get("fields", {})
            print(f"DEBUG: Found video in Firestore: {video_id}")
        else:
            print(f"DEBUG: Video not found in Firestore (status: {resp.status_code})")
    except Exception as e:
        print("Firestore fetch error in video_detail:", e)

    # Django にもなく Firestore にもない場合は 404
    if not video_obj and not firestore_data:
        print(f"DEBUG: Video {video_id} not found anywhere (404)")
        return Response({'error': 'Video not found'}, status=404)

    # 3. 同期/作成処理 (FirestoreにあってDjangoにない、または情報の更新)
    if firestore_data:
        def get_v(f): return firestore_data.get(f, {}).get("stringValue", "")
        
        video_obj, created = Video.objects.update_or_create(
            id=video_id,
            defaults={
                "title": get_v("title") or (video_obj.title if video_obj else ""),
                "user": get_v("author") or (video_obj.user if video_obj else ""),
                "duration": get_v("duration") or (video_obj.duration if video_obj else ""),
                "thumb": get_v("thumbnail") or (video_obj.thumb if video_obj else ""),
                "video_url": get_v("src") or (video_obj.video_url if video_obj else ""),
                "userAvatar": get_v("userAvatar") or (video_obj.userAvatar if video_obj else ""),
            }
        )

    # 4. レスポンスの構築
    view_count = video_obj.views if video_obj else 0
    total_watch_time = video_obj.watch_time if video_obj else 0
    
    created_at_val = ""
    if firestore_data and "createdAt" in firestore_data:
        created_at_val = firestore_data.get("createdAt", {}).get("timestampValue", "")
    elif video_obj and video_obj.created_at:
        created_at_val = video_obj.created_at.isoformat()

    video = {
        "id": video_id,
        "title": video_obj.title if video_obj else "",
        "user": video_obj.user if video_obj else "",
        "duration": video_obj.duration if video_obj else "",
        "thumb": video_obj.thumb if video_obj else "",
        "video_url": video_obj.video_url if video_obj else "",
        "created_at": created_at_val,
        "views": view_count,
        "watch_time": total_watch_time,
        "is_featured": video_obj.is_featured if video_obj else False,
        "is_short": video_obj.is_short if video_obj else False,
    }

    return Response(video)


from .models import VideoViewLog

@api_view(["POST"])
@permission_classes([AllowAny])
def record_video_view(request):
    """Firestoreの動画IDを元に視聴ログを記録"""
    try:
        video_id = request.data.get("video_id")
        watch_time = int(request.data.get("watch_time", 0))

        if not video_id:
            return Response({"error": "video_id が指定されていません。"}, status=400)

        # Django Video オブジェクト取得を優先
        video_obj = Video.objects.filter(id=video_id).first()

        if not video_obj:
            # Firestoreで存在確認 (同期のため)
            FIREBASE_PROJECT_ID = "pixelshopsns"
            url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/pixtubePosts/{video_id}"
            response = requests.get(url)

            if response.status_code != 200:
                return Response({"error": "動画が見つかりません。"}, status=404)
            
            # 同期
            fields = response.json().get("fields", {})
            def get_v(f): return fields.get(f, {}).get("stringValue", "")
            video_obj = Video.objects.create(
                id=video_id,
                title=get_v("title"),
                user=get_v("author"),
                duration=get_v("duration"),
                thumb=get_v("thumbnail"),
                video_url=get_v("src"),
                userAvatar=get_v("userAvatar")
            )

        # 🔥 get_or_create (User単位で1つのログを作る場合)
        log, created = VideoViewLog.objects.get_or_create(
            video=video_obj,
            user=request.user if request.user.is_authenticated else None,
            defaults={
                "watch_time": 0,
            },
        )

        # 🔥 視聴時間を加算
        log.watch_time += watch_time
        log.save()

        # ミッション進捗
        update_mission_progress(request.user, 'video_watch')

        return Response({
            "message": "視聴データを記録しました。",
            "video_id": video_id,
            "total_watch_time": log.watch_time
        }, status=200)

    except Exception as e:
        print("❌ record_video_view error:", e)
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([AllowAny])
def treasure_list(request):
    """
    ノウハウ宝物庫用の投稿一覧API。
    categoryパラメータが指定された場合は絞り込みも可能。
    """
    try:
        category = request.GET.get("category", None)
        posts = Post.objects.all().order_by("-created_at")

        if category:
            posts = posts.filter(category=category)

        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=200)

    except Exception as e:
        print("❌ treasure_list error:", e)
        return Response({"error": str(e)}, status=500)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_treasure_as_read(request, pk):
    try:
        post = TreasurePost.objects.get(pk=pk)
        post.read_by.add(request.user)
        return Response({'message': 'Marked as read'}, status=200)
    except TreasurePost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=404)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def treasure_post_detail(request, pk):
    try:
        post = TreasurePost.objects.get(pk=pk)
    except TreasurePost.DoesNotExist:
        return Response({'error': 'TreasurePost not found'}, status=404)

    # --- GET（閲覧は誰でもOK） ---
    if request.method == 'GET':
        serializer = TreasurePostSerializer(post, context={'request': request})
        return Response(serializer.data)

    # --- PUT（編集） ---
    elif request.method == 'PUT':
        user_uid = request.data.get("user_uid") or request.query_params.get("user_uid")
        if not user_uid:
            return Response({'error': 'user_uid が必要です'}, status=400)
        if post.user_uid != user_uid:
            return Response({'error': '編集権限がありません'}, status=403)

        serializer = TreasurePostSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

# --- DELETE（削除） ---
    elif request.method == 'DELETE':
        try:
            # request.data がない場合に備えて .get を安全に呼ぶ
            user_uid = None
            if hasattr(request, "data") and isinstance(request.data, dict):
                user_uid = request.data.get("user_uid")
            if not user_uid:
                user_uid = request.query_params.get("user_uid")

            # 🔹 user_uid が存在しない場合（＝投稿時にnullだった場合）は全員削除可
            if not post.user_uid:
                post.delete()
                return Response({'message': '投稿を削除しました（全員削除可）'}, status=200)

            # 🔹 投稿者チェック
            if not user_uid:
                return Response({'error': 'user_uid が必要です'}, status=400)
            if post.user_uid != user_uid:
                return Response({'error': '削除権限がありません'}, status=403)

            post.delete()
            return Response({'message': '投稿を削除しました'}, status=200)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)






@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_treasure_like(request, pk):
    post = get_object_or_404(TreasurePost, pk=pk)
    user = request.user

    if user in post.likes.all():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
        liked = True

        # --- 通知の作成 ---
        # 投稿者に「いいね」の通知を送る（自分以外）
        post_author_uid = post.user_uid
        if post_author_uid and str(post_author_uid) != str(user.user_id):
            author = User.objects.filter(user_id=post_author_uid).first()
            if author:
                Notification.objects.create(
                    recipient=author,
                    sender=user,
                    notification_type='LIKE',
                    post_id=str(post.id),
                    is_treasure_post=True,
                    message=f"{user.display_name}さんがあなたのノウハウ投稿にいいねしました。"
                )

    if liked:
        # ミッション進捗
        update_mission_progress(user, 'like')

    return Response({
        "liked": liked,
        "likes_count": post.likes.count(),
    }, status=200)


class TreasurePostPagination(PageNumberPagination):
    page_size = 20  # 1回で取得する件数（必要なら10〜30でもOK）
    page_size_query_param = 'limit'
    max_page_size = 100

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def treasure_post_list(request):
    if request.method == 'GET':
        posts = TreasurePost.objects.all().order_by('-created_at')

        paginator = TreasurePostPagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = TreasurePostSerializer(paginated_posts, many=True, context={'request': request})

        # ✅ ページネーション対応のレスポンスを返す
        return paginator.get_paginated_response(serializer.data)

    elif request.method == 'POST':
        serializer = TreasurePostSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save()

            # --- メンション通知 ---
            import re
            content = post.content
            mention_ids_tiptap = re.findall(r'data-id="([^"]+)"', content)
            clean_content = re.sub(r'<[^>]+>', ' ', content)
            mention_matches_raw = re.findall(r"@(?:\[([^\]]+)\]|([a-zA-Z0-9_\.]+))", clean_content)
            mention_ids_legacy = [m[0] or m[1] for m in mention_matches_raw]
            mention_matches = list(set(mention_ids_tiptap + mention_ids_legacy))

            user = request.user
            is_all_mentioned = any(m.upper() == "ALL" for m in mention_matches)

            if is_all_mentioned:
                other_users = User.objects.filter(is_active=True).exclude(user_id=user.user_id)
                for target_user in other_users:
                    Notification.objects.create(
                        recipient=target_user,
                        sender=user,
                        notification_type='MENTION',
                        post_id=str(post.id),
                        is_treasure_post=True,
                        message=f"{user.display_name}さんがノウハウ投稿で全員をメンションしました。"
                    )
            else:
                for target_user_id in mention_matches:
                    if str(target_user_id) != str(user.user_id):
                        target_user = User.objects.filter(user_id=target_user_id).first()
                        if target_user:
                            Notification.objects.create(
                                recipient=target_user,
                                sender=user,
                                notification_type='MENTION',
                                post_id=str(post.id),
                                is_treasure_post=True,
                                message=f"{user.display_name}さんがノウハウ投稿であなたをメンションしました。"
                            )

            # --- ミッション進捗 ---
            update_mission_progress(request.user, 'treasure_post')

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def treasure_comments_view(request, pk):
    """
    TreasurePost に紐づくコメント一覧・投稿
    """
    from .models import TreasureComment  # モデルを読み込む
    post = get_object_or_404(TreasurePost, pk=pk)

    if request.method == 'GET':
        comments = post.comments.order_by('-created_at')
        data = []
        for c in comments:
            profile_image = None
            display_name = c.user_name or "匿名"
            if c.user_uid:
                user = User.objects.filter(user_id=c.user_uid).first()
                if user:
                    profile_image = user.profile_image
                    display_name = user.display_name or display_name
            
            data.append({
                "user_name": display_name,
                "display_name": display_name,
                "content": c.content,
                "image_url": c.image_url,
                "created_at": c.created_at,
                "profile_image": profile_image,
                "user_uid": c.user_uid,
            })
        return Response(data, status=200)

    elif request.method == 'POST':
        user = request.user if request.user.is_authenticated else None
        user_name = request.data.get("user_name", "匿名")
        content = request.data.get("content")
        image_url = request.data.get("image_url")
        if not content:
            return Response({"error": "content is required"}, status=400)

        comment = TreasureComment.objects.create(
            post=post, 
            user_name=user_name, 
            user_uid=str(user.user_id) if user else None,
            content=content,
            image_url=image_url
        )

        # --- 通知の作成 ---
        # 1. 投稿者への通知（自分以外）
        post_author_uid = post.user_uid
        if post_author_uid and user and str(post_author_uid) != str(user.user_id):
            author = User.objects.filter(user_id=post_author_uid).first()
            if author:
                Notification.objects.create(
                    recipient=author,
                    sender=user,
                    notification_type='COMMENT',
                    post_id=str(post.id),
                    comment_id=comment.id,
                    is_treasure_post=True,
                    message=f"{user.display_name or user_name}さんがあなたのノウハウ投稿にコメントしました。"
                )

        # 2. メンション通知
        import re
        mention_ids_tiptap = re.findall(r'data-id="([^"]+)"', content)
        mention_matches_raw = re.findall(r"@(?:\[([^\]]+)\]|([a-zA-Z0-9_\.]+))", content)
        mention_ids_legacy = [m[0] or m[1] for m in mention_matches_raw]
        mention_matches = list(set(mention_ids_tiptap + mention_ids_legacy))

        if user:
            is_all_mentioned = any(m.upper() == "ALL" for m in mention_matches)
            if is_all_mentioned:
                other_users = User.objects.filter(is_active=True).exclude(user_id=user.user_id)
                for target_user in other_users:
                    Notification.objects.create(
                        recipient=target_user,
                        sender=user,
                        notification_type='MENTION',
                        post_id=str(post.id),
                        comment_id=comment.id,
                        is_treasure_post=True,
                        message=f"{user.display_name or user_name}さんがコメントで全員をメンションしました。"
                    )
            else:
                for target_user_id in mention_matches:
                    if str(target_user_id) != str(user.user_id):
                        target_user = User.objects.filter(user_id=target_user_id).first()
                        if target_user:
                            Notification.objects.create(
                                recipient=target_user,
                                sender=user,
                                notification_type='MENTION',
                                post_id=str(post.id),
                                comment_id=comment.id,
                                is_treasure_post=True,
                                message=f"{user.display_name or user_name}さんがコメントであなたをメンションしました。"
                            )

        # ミッション進捗
        update_mission_progress(user, 'comment')

        return Response({"message": "コメントを追加しました"}, status=201)

# posts/views.py
from django.db.models import Count
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TreasurePost

@api_view(["GET"])
@permission_classes([AllowAny])
def treasure_category_counts(request):
    parent_category = request.GET.get("parent_category")

    posts = TreasurePost.objects.all()

    # 親カテゴリが指定されていれば絞る
    if parent_category:
        posts = posts.filter(parent_category=parent_category)

    data = (
        posts.values("category")
        .annotate(count=Count("id"))
        .order_by("category")
    )

    return Response({d["category"]: d["count"] for d in data})


from django.http import JsonResponse
from posts.models import TreasurePost

def treasure_titles_view(request):
    parent_category = request.GET.get("parent_category")  # ← 親カテゴリを取得

    posts = TreasurePost.objects.all()

    # parent_category が指定されていれば絞り込む
    if parent_category:
        posts = posts.filter(parent_category=parent_category)

    # 返すフィールドを絞る
    posts = posts.values(
        "id",
        "title",
        "category",
        "parent_category",   # ← 追加
        "created_at"
    ).order_by("-created_at")

    return JsonResponse(list(posts), safe=False)

# posts/views.py
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def notices_list_create(request):
    if request.method == "GET":
        # 一般的なお知らせ一覧では「ログインポップアップ専用」を除外する
        notices = Notice.objects.filter(is_login_popup=False).order_by("-created_at")
        return Response(NoticeSerializer(notices, many=True).data)

    elif request.method == "POST":
        if not request.user.is_authenticated:
            return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data.copy()
        data["admin_name"] = request.user.display_name  # 投稿者名
        serializer = NoticeSerializer(data=data)
        if serializer.is_valid():
            notice = serializer.save()

            # --- 全ユーザーに通知 ---
            all_users = User.objects.filter(is_active=True).exclude(user_id=request.user.user_id)
            for target_user in all_users:
                Notification.objects.create(
                    recipient=target_user,
                    sender=request.user,
                    notification_type='NEWS',
                    post_id=str(notice.id),
                    message=f"新しいお知らせがあります：{notice.title}"
                )

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([AllowAny])
def notice_detail(request, pk):
    try:
        notice = Notice.objects.get(pk=pk)
    except Notice.DoesNotExist:
        return Response({"error": "not found"}, status=404)

    if request.method == "GET":
        return Response(NoticeSerializer(notice).data)

    # 以降は認証が必要
    if not request.user.is_authenticated:
        return Response({"error": "認証が必要です"}, status=status.HTTP_401_UNAUTHORIZED)

    elif request.method == "PUT":
        serializer = NoticeSerializer(notice, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == "DELETE":
        notice.delete()
        return Response(status=204)

import requests
from bs4 import BeautifulSoup
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def fetch_ogp(request):
    import requests
    from bs4 import BeautifulSoup

    url = request.data.get("url")
    if not url:
        return Response({"error": "URLがありません"}, status=400)

    try:
        res = requests.get(url, timeout=5)
        soup = BeautifulSoup(res.text, "html.parser")

        # Google Drive は OGP を返さないため例外対応
        if "drive.google.com" in url:
            title = soup.title.string if soup.title else "Google Drive File"
            return Response({
                "title": title,
                "description": "Google Drive のファイルリンク",
                "image": "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png",
                "url": url,
            })

        # 通常の OGP
        def get_meta(property):
            tag = soup.find("meta", property=property)
            return tag["content"] if tag else ""

        og_title = get_meta("og:title") or (soup.title.string if soup.title else "")
        og_desc = get_meta("og:description")
        og_image = get_meta("og:image")

        return Response({
            "title": og_title,
            "description": og_desc,
            "image": og_image,
            "url": url,
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)

# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import VideoViewLog

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def video_view_logs(request):
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)
    logs = VideoViewLog.objects.all().order_by("-last_watched_at")

    # フィルタリング
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    user_id = request.GET.get('user_id')
    video_title = request.GET.get('video_title')

    if start_date:
        logs = logs.filter(last_watched_at__date__gte=start_date)
    if end_date:
        logs = logs.filter(last_watched_at__date__lte=end_date)
    if user_id:
        logs = logs.filter(user__user_id__icontains=user_id) # Userモデルのuser_id (char) で検索
    if video_title:
        logs = logs.filter(video__title__icontains=video_title)

    data = [
        {
            "id": log.id,
            "video_id": log.video.id,
            "video_title": log.video.title, # 追加
            "watch_time": log.watch_time,
            "user": log.user.display_name if log.user else "Anonymous",
            "last_watched_at": log.last_watched_at, # created_at -> last_watched_at に変更（モデル定義に合わせる）
        }
        for log in logs
    ]
    return Response(data, status=200)

from django.db.models import F

@api_view(["POST"])
@permission_classes([AllowAny])
def add_video_view(request):
    video_id = request.data.get("video_id")
    if not video_id:
        return Response({"error": "video_id is required"}, status=400)

    # Firestore の video_id を使って Video オブジェクトを更新
    # Videoオブジェクトが存在しない場合は作成する (Sync)
    try:
        # まずは更新を試みる
        updated = Video.objects.filter(id=video_id).update(views=F("views") + 1)
        
        # 更新されなかった場合（まだDBにない場合）、作成して views=1 にする
        if updated == 0:
            # ここではタイトルなどは空になるが、video_detail で補完される
            # あるいは video_detail を一度呼んでもらう前提にする
            Video.objects.create(id=video_id, views=1)
            
    except Exception as e:
        return Response({"error": str(e)}, status=500)

    return Response({"message": "view +1 完了"}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_featured_video(request, pk):
    """
    動画の「注目の動画」ステータスを切り替える (Admin Only)
    """
    if not request.user.is_admin_or_secretary:
       return Response({"error": "管理者権限が必要です"}, status=403)

    # Django Video オブジェクトを取得 (なければ作成)
    video, created = Video.objects.get_or_create(id=pk)

    # トグル
    video.is_featured = not video.is_featured
    
    # ※ もし「1つだけ」にするなら、他を全部Falseにする処理を入れる
    if video.is_featured:
        Video.objects.exclude(id=pk).update(is_featured=False)

    video.save()
    
    return Response({
        "video_id": video.id,
        "is_featured": video.is_featured
    })


# --- Task Button Management ---

@api_view(['GET', 'POST'])
@permission_classes([AllowAny]) # GET is public (User need to see), POST is Admin only
def task_button_list_create(request):
    if request.method == 'GET':
        tasks = TaskButton.objects.all().order_by('category', 'order')
        
        # チームフィルタ (event, shop) ?team=event
        team = request.GET.get('team')
        if team:
            if team == 'event':
                tasks = tasks.filter(category='pixel-event')
            elif team == 'shop':
                tasks = tasks.filter(category='pixel-shop')
            # training sees all, so no filter needed for training if logic is handled in frontend or here
            
        serializer = TaskButtonSerializer(tasks, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        if not request.user.is_admin_or_secretary:
            return Response({"error": "管理者権限が必要です"}, status=403)
        
        serializer = TaskButtonSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_button_detail(request, pk):
    try:
        task = TaskButton.objects.get(pk=pk)
    except TaskButton.DoesNotExist:
        return Response({'error': 'Task not found'}, status=404)

    # GET: Allow authenticated users? or just Admin? 
    # Usually detail view is for admin editing. The list view is for users.
    # Let's restrict to Admin for modification
    
    if request.method == 'GET':
        # Admin editing retrieval
        if not request.user.is_admin_or_secretary:
            return Response({"error": "管理者権限が必要です"}, status=403)
        serializer = TaskButtonSerializer(task)
        return Response(serializer.data)

    elif request.method == 'PUT':
        if not request.user.is_admin_or_secretary:
            return Response({"error": "管理者権限が必要です"}, status=403)
        
        serializer = TaskButtonSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        if not request.user.is_admin_or_secretary:
            return Response({"error": "管理者権限が必要です"}, status=403)
        
        task.delete()
        return Response(status=204)

from .models import Video, VideoViewLog


# ---------------------------
# ① 視聴ログ保存（ログイン必須）
# ---------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_view_log(request):
    user = request.user

    video_id = request.data.get('video_id')
    watch_time = int(request.data.get('watch_time', 0))

    # Video モデル存在チェック
    try:
        video = Video.objects.get(id=video_id)
    except Video.DoesNotExist:
        return Response({"error": "video not found"}, status=400)

    # 🔥 正しく FK を保存する
    VideoViewLog.objects.create(
        user=user,
        video=video,
        watch_time=watch_time
    )

    # 🔥 Video モデルの統計更新
    if watch_time == 0:
        video.views += 1

    video.watch_time = getattr(video, "watch_time", 0) + watch_time
    video.save()

    # 🔥 ミッション進捗更新
    update_mission_progress(user, 'video_watch')

    return Response({"message": "logged"}, status=200)


# ---------------------------
# 視聴マトリクス
# ---------------------------
# ---------------------------
# 視聴マトリクス
# ---------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def watch_matrix(request):
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)
    from users.models import User  # ← これも必要

    # 全ユーザー取得
    users = User.objects.all().order_by("display_name")

    # 全動画取得
    videos = Video.objects.all().order_by("title")

    # 視聴ログ取得
    # {(user_id, video_id): {watch_time: int, views: int}}
    from django.db.models import Sum, Count
    
    # values() でグルーピングして集計
    logs_agg = VideoViewLog.objects.values('user_id', 'video_id').annotate(
        total_time=Sum('watch_time'),
        view_count=Count('id')
    )

    matrix = {}
    for item in logs_agg:
        # user_id が None の場合は除外するなど適宜調整
        if not item['user_id']:
            continue
            
        key = f"{item['user_id']}_{item['video_id']}"
        matrix[key] = {
            "time": item['total_time'],
            "views": item['view_count']
        }

    return Response({
        "users": [
            {"id": u.id, "name": u.display_name}
            for u in users
        ],
        "videos": [
            {"id": v.id, "title": v.title}
            for v in videos
        ],
        "matrix": matrix,
    })

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import VideoTest
from .serializers import VideoTestSerializer


@api_view(["GET"])
@permission_classes([AllowAny])  
def video_test_detail(request, video_id):
    """
    動画IDに紐づくテスト内容を返す
    """
    try:
        test = VideoTest.objects.get(video_id=video_id)
    except VideoTest.DoesNotExist:
        return Response({"detail": "この動画にはテストがありません"}, status=404)

    serializer = VideoTestSerializer(test)
    return Response(serializer.data, status=200)

@api_view(["POST"])
def submit_test(request, video_id):
    """
    ユーザーが送信した回答を採点し、結果を保存する
    """
    user = request.user
    answers = request.data.get("answers", {})

    try:
        test = VideoTest.objects.get(video__id=video_id)
    except VideoTest.DoesNotExist:
        return Response({"detail": "テストがありません"}, status=404)

    score = 0
    max_score = test.questions.count()

    # 各問題を採点 & 詳細保存用リスト
    user_test_answers = []
    
    for question in test.questions.all():
        correct_choice = question.choices.filter(is_correct=True).first()
        user_choice_id = answers.get(str(question.id))

        # ユーザーが選んだ選択肢オブジェクトを取得（存在する場合）
        user_choice = None
        if user_choice_id:
            user_choice = Choice.objects.filter(id=user_choice_id).first()

        # 正解判定
        if correct_choice and str(correct_choice.id) == str(user_choice_id):
            score += 1

        # 詳細保存用リストに追加
        if user_choice:
            user_test_answers.append({
                "question": question,
                "choice": user_choice
            })

    # 合否判定（80%以上で合格）
    pass_threshold = max_score * 0.8
    is_passed = score >= pass_threshold

    # 結果を保存
    result = UserTestResult.objects.create(
        user=user,
        video_id=video_id,
        score=score,
        max_score=max_score,
        is_passed=is_passed  # ✅ 合否保存
    )

    if is_passed:
        # ミッション進捗
        update_mission_progress(user, 'test_pass')

    # 詳細回答を保存
    for ans in user_test_answers:
        UserTestAnswer.objects.create(
            result=result,
            question=ans["question"],
            choice=ans["choice"]
        )

    return Response({
        "score": score,
        "max_score": max_score,
        "is_passed": is_passed
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def create_test(request):
    print("DEBUG: create_test called", flush=True)
    data = request.data
    video_id = data.get("video_id", "").strip().strip('/')
    title = data.get("title", "")
    questions_data = data.get("questions", [])
    
    # DEBUG
    print(f"DEBUG: create_test - video_id={video_id}, title={title}", flush=True)
    print(f"DEBUG: create_test - questions_data={questions_data}", flush=True)
    print(f"DEBUG: create_test - survey_questions={data.get('survey_questions')}", flush=True)

    if not video_id:
        return Response({"error": "video_id が必要です"}, status=400)

    # --- 動画オブジェクトの取得/作成 ---
    video_obj = Video.objects.filter(id=video_id).first()

    if not video_obj:
        # DBにない場合は Firestore からの取得を試みる
        FIREBASE_PROJECT_ID = "pixelshopsns"
        url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/pixtubePosts/{video_id}"
        response = requests.get(url)

        if response.status_code == 200:
            fields = response.json().get("fields", {})
            # Firestore にあった場合は DB に作成
            video_obj = Video.objects.create(
                id=video_id,
                title=fields.get("title", {}).get("stringValue", ""),
                user=fields.get("author", {}).get("stringValue", ""),
                duration=fields.get("duration", {}).get("stringValue", ""),
                thumb=fields.get("thumbnail", {}).get("stringValue", ""),
                video_url=fields.get("src", {}).get("stringValue", ""),
                userAvatar=fields.get("userAvatar", {}).get("stringValue", ""),
            )
        else:
            # Firestore にもなかった場合
            print(f"DEBUG: create_test - Video not found anywhere: [{video_id}] (Firestore status: {response.status_code})", flush=True)
            # 全体の状況を確認するためのデバッグログ
            v_count = Video.objects.count()
            sample_ids = list(Video.objects.values_list('id', flat=True)[:5])
            print(f"DEBUG: Video count in DB: {v_count}, Sample IDs: {sample_ids}", flush=True)
            return Response({
                "error": f"指定された動画(ID: {video_id})が見つかりません。",
                "debug_info": {
                    "passed_id": video_id,
                    "db_count": v_count,
                    "sample_ids": sample_ids
                }
            }, status=400)
    else:
        # すでにDBにある場合は情報を更新（オプショナル：Firestore同期を一応試みるが失敗しても無視する）
        try:
            FIREBASE_PROJECT_ID = "pixelshopsns"
            url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/pixtubePosts/{video_id}"
            response = requests.get(url, timeout=3)
            if response.status_code == 200:
                fields = response.json().get("fields", {})
                video_obj.title = fields.get("title", {}).get("stringValue", video_obj.title)
                video_obj.user = fields.get("author", {}).get("stringValue", video_obj.user)
                video_obj.duration = fields.get("duration", {}).get("stringValue", video_obj.duration)
                video_obj.thumb = fields.get("thumbnail", {}).get("stringValue", video_obj.thumb)
                video_obj.video_url = fields.get("src", {}).get("stringValue", video_obj.video_url)
                video_obj.save()
        except:
            pass

    # 🔥 既存テスト削除
    VideoTest.objects.filter(video=video_obj).delete()

    # 🔥 新規作成（FK を正しく渡す）
    test = VideoTest.objects.create(
        video=video_obj,
        title=title,
    )

    # 🔥 Question → Choice 作成
    for q in questions_data:
        question = Question.objects.create(
            test=test,
            order=q.get("order", 1),
            text=q.get("text", ""),
            description=q.get("description", "")
        )

        for choice in q.get("choices", []):
            Choice.objects.create(
                question=question,
                text=choice.get("text", ""),
                is_correct=choice.get("is_correct", False)
            )

    # 🔥 Survey (アンケート) 作成
    survey_data = data.get("survey_questions", [])
    
    survey = Survey.objects.create(
        video_test=test,
        title=f"{title} のアンケート"
    )

    if survey_data:
        # 🟢 カスタムアンケート質問の作成
        for q in survey_data:
            sq = SurveyQuestion.objects.create(
                survey=survey,
                text=q.get("text", ""),
                description=q.get("description", ""),
                order=q.get("order", 1),
                question_type=q.get("type", "text") # text or choice
            )
            # 選択肢がある場合 (choiceタイプ)
            if q.get("type") == "choice":
                for choice_text in q.get("choices", []):
                    SurveyChoice.objects.create(question=sq, text=choice_text)

    else:
        # 🟡 デフォルト質問（ペイロードに詳細がない場合）
        # 1. 満足度（選択式）
        q1 = SurveyQuestion.objects.create(
            survey=survey, text="この動画の満足度を教えてください", order=1, question_type="choice"
        )
        for t in ["とても満足", "満足", "普通", "不満"]:
            SurveyChoice.objects.create(question=q1, text=t)

        # 2. 感想（記述式）
        SurveyQuestion.objects.create(
            survey=survey, text="感想やご意見があればご記入ください", order=2, question_type="text"
        )

    return Response({"message": "テストとアンケートを作成しました！"}, status=201)

# Survey を返す API

@api_view(["GET"])
@permission_classes([AllowAny])
def get_video_survey(request, video_id):
    try:
        video_test = VideoTest.objects.get(video__id=video_id)
        survey = video_test.survey
    except VideoTest.DoesNotExist:
        return Response({"error": "VideoTest not found"}, status=404)
    except Survey.DoesNotExist:
        return Response({"error": "Survey not found"}, status=404)

    serializer = SurveySerializer(survey)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([AllowAny])
def submit_survey(request, video_id):
    try:
        video_test = VideoTest.objects.get(video__id=video_id)
        survey = video_test.survey
    except VideoTest.DoesNotExist:
        return Response({"error": "VideoTest not found"}, status=404)
    except Survey.DoesNotExist:
        return Response({"error": "Survey not found"}, status=404)

    answers = request.data.get("answers", {})

    # 🔥 SurveyResponse (回答の親) を作成する
    user_id = request.user.user_id if request.user.is_authenticated else "guest"
    response_obj = SurveyResponse.objects.create(
        test=video_test,
        user_id=user_id
    )

    for q_id, ans in answers.items():

        try:
            question = SurveyQuestion.objects.get(id=q_id)
        except SurveyQuestion.DoesNotExist:
            continue

        # 選択式
        if question.question_type == "choice":
            SurveyAnswer.objects.create(
                response=response_obj,  # ✅ 親を指定
                question=question,
                choice_id=ans
            )

        # 記述式
        else:
            SurveyAnswer.objects.create(
                response=response_obj,  # ✅ 親を指定
                question=question,
                answer_text=ans
            )

    return Response({"message": "Survey submitted!"}, status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_video(request):
    """
    動画アップロード後のメタデータを保存するAPI
    FirestoreのIDはフロントエンド側で発行したものを利用する想定
    """
    try:
        user = request.user
        data = request.data
        
        # 必須項目チェック
        video_id = data.get("id")
        title = data.get("title")
        video_url = data.get("video_url")
        
        print(f"DEBUG: create_video request - id: {video_id}, title: {title}")
        
        if not video_id or not title or not video_url:
            return Response({"error": "id, title, video_url are required"}, status=400)
            
        # Video オブジェクト作成 (重複回避のため update_or_create を検討すべきだが、一度 create で様子見)
        video, created = Video.objects.update_or_create(
            id=video_id,
            defaults={
                "title": title,
                "user": user.display_name or "Anonymous",
                "userAvatar": user.profile_image or "",
                "video_url": video_url,
                "thumb": data.get("thumb", ""),
                "duration": data.get("duration", "0:00"),
                "views": 0,
                "watch_time": 0
            }
        )
        
        print(f"DEBUG: Video saved to Django DB. id: {video.id}")
        
        return Response({
            "message": "Video meta created", 
            "id": video.id,
            "title": video.title,
            "created": created
        }, status=201)
        
    except Exception as e:
        print("create_video error:", e)
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_video(request, video_id):
    """
    動画情報を更新するAPI
    - タイトル
    - サムネイル
    - カテゴリ（配置）
    - 表示順（order）
    """
    try:
        video = Video.objects.get(id=video_id)
        data = request.data
        
        video.title = data.get("title", video.title)
        video.thumb = data.get("thumb", video.thumb)
        video.category = data.get("category", video.category)
        video.order = data.get("order", video.order)
        
        video.save()
        
        return Response({
            "message": "Video updated", 
            "id": video.id,
            "title": video.title,
            "category": video.category
        }, status=200)

    except Video.DoesNotExist:
        return Response({"error": "Video not found"}, status=404)
    except Exception as e:
        print("update_video error:", e)
        return Response({"error": str(e)}, status=500)

# === ホーム管理用 API ===

@api_view(['GET'])
@permission_classes([AllowAny])
def get_home_content(request):
    """
    ホームページに表示するデータをまとめて返す
    1. 事務局だより (Notice カテゴリが "事務局")
    2. ショート動画 (Video is_short=True)
    3. おすすめ投稿 (Post is_featured=True)
    """
    # 事務局だより (OfficeNews モデルから全取得)
    news = OfficeNews.objects.all().order_by("-created_at")[:5]
    news_data = []
    for n in news:
        news_data.append({
            "id": n.id,
            "title": n.title,
            "thumbnail": n.thumbnail,
            "external_url": n.external_url,
            "created_at": n.created_at
        })

    # ショート動画
    shorts = Video.objects.filter(is_short=True).order_by("-created_at")[:10]
    shorts_data = VideoSerializer(shorts, many=True, context={'request': request}).data

    # おすすめ投稿
    featured_posts = Post.objects.filter(is_featured=True).order_by("-created_at")[:10]
    featured_posts_data = PostSerializer(featured_posts, many=True, context={'request': request}).data


    return Response({
        "news": news_data,
        "shorts": shorts_data,
        "featured_posts": featured_posts_data
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def office_news_list_create(request):
    """事務局だよりの一覧取得・新規作成"""
    if request.method == 'POST':
        if not request.user.is_admin_or_secretary:
            return Response({"detail": "権限がありません"}, status=403)

    if request.method == 'GET':
        news = OfficeNews.objects.all()
        serializer = OfficeNewsSerializer(news, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = OfficeNewsSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def office_news_detail(request, pk):
    """事務局だよりの詳細・更新・削除"""
    if request.method in ['PUT', 'DELETE']:
        if not request.user.is_admin_or_secretary:
            return Response({"detail": "権限がありません"}, status=403)

    news = get_object_or_404(OfficeNews, pk=pk)

    if request.method == 'GET':
        serializer = OfficeNewsSerializer(news, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = OfficeNewsSerializer(news, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    elif request.method == 'DELETE':
        news.delete()
        return Response(status=204)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_featured_post(request, pk):
    """管理者用: 投稿を「ピックアップ」にする"""
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)
        
    post = get_object_or_404(Post, pk=pk)
    post.is_featured = not post.is_featured
    post.save()
    return Response({"is_featured": post.is_featured})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_short_video(request, pk):
    """管理者用: 動画を「ショート」にする (Firestoreから同期)"""
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)
        
    video = Video.objects.filter(id=pk).first()
    
    if not video:
        # Firestoreから情報を取得して作成する
        FIREBASE_PROJECT_ID = "pixelshopsns"
        url = f"https://firestore.googleapis.com/v1/projects/{FIREBASE_PROJECT_ID}/databases/(default)/documents/pixtubePosts/{pk}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                doc = response.json()
                fields = doc.get("fields", {})
                
                def get_str(field):
                    return fields.get(field, {}).get("stringValue", "") or ""
                
                video = Video.objects.create(
                    id=pk,
                    title=get_str("title"),
                    user=get_str("author"),
                    thumb=get_str("thumbnail"),
                    video_url=get_str("src"),
                )
            else:
                return Response({"detail": "Firestoreに動画が見つかりません"}, status=404)
        except Exception as e:
            return Response({"error": f"Firestore sync error: {str(e)}"}, status=500)

    video.is_short = not video.is_short
    video.save()
    return Response({"is_short": video.is_short})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_post_list(request):
    """
    管理者用：全投稿取得（フィルタリング対応）
    """
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    posts = Post.objects.all().order_by('-created_at')

    # フィルタリング
    user_id = request.GET.get('user_id')
    category = request.GET.get('category')
    keyword = request.GET.get('keyword')
    shop_name = request.GET.get('shop_name')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    if user_id:
        posts = posts.filter(user_uid__icontains=user_id)
    if category:
        posts = posts.filter(category=category)
    if keyword:
        from django.db.models import Q
        posts = posts.filter(Q(content__icontains=keyword) | Q(title__icontains=keyword))
    if shop_name:
        # user_uid は Post モデルにある文字列ID。
        # ユーザーモデルの shop_name で絞り込むには、user_uid (Post) == user_id (User) の関係を利用
        # ただし Post.user_uid は CharField なので、
        # User.objects.filter(shop_name__icontains=shop_name) でユーザーIDリストを取得し、そのIDリストに含まれる投稿を探す
        target_users = User.objects.filter(shop_name__icontains=shop_name).values_list('user_id', flat=True)
        posts = posts.filter(user_uid__in=target_users)

    # 日付フィルタ
    if start_date:
        posts = posts.filter(created_at__date__gte=start_date)
    if end_date:
        posts = posts.filter(created_at__date__lte=end_date)

    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_treasure_post_list(request):
    """
    管理者用：全ノウハウ投稿取得（フィルタリング対応）
    """
    if not request.user.is_admin_or_secretary:
        return Response({"error": "権限がありません"}, status=403)

    posts = TreasurePost.objects.all().order_by('-created_at')

    # フィルタ
    shop_name = request.GET.get('shop_name')
    keyword = request.GET.get('keyword')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')

    if shop_name:
        target_users = User.objects.filter(shop_name__icontains=shop_name).values_list('user_id', flat=True)
        posts = posts.filter(user_uid__in=target_users)
    
    if keyword:
        from django.db.models import Q
        posts = posts.filter(Q(content__icontains=keyword) | Q(title__icontains=keyword))

    if start_date:
        posts = posts.filter(created_at__date__gte=start_date)
    if end_date:
        posts = posts.filter(created_at__date__lte=end_date)

    serializer = TreasurePostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_video_list(request):
    """
    管理者用：全動画取得（テスト有無フラグ付き）
    """
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    # Djangoに保存されている動画のみ対象（基本的にはすべてVideoモデルにあるはず）
    videos = Video.objects.all().order_by('-created_at')
    
    data = []
    for v in videos:
        # テストが存在するか確認 (OneToOneField)
        has_test = hasattr(v, 'videotest')
        
        data.append({
            "id": v.id,
            "title": v.title,
            "thumb": v.thumb,
            "category": v.category,
            "has_test": has_test,
            "created_at": v.created_at
        })

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_video_feedback(request):
    """
    動画ごとのテスト結果とアンケート結果をまとめて返す。
    管理権限が必要。
    """
    if not request.user.is_admin_or_secretary:
        return Response({"error": "権限がありません"}, status=403)

    from django.db.models import Avg

    try:
        videos = Video.objects.all()
        result_data = []

        for video in videos:
            # --- テスト統計 ---
            test_results = UserTestResult.objects.filter(video_id=video.id)
            agg = test_results.aggregate(Avg('score'))
            avg_score = agg['score__avg'] if agg['score__avg'] is not None else 0

            # --- アンケート統計 ---
            try:
                video_test = getattr(video, 'videotest', None)
                if video_test:
                    survey = getattr(video_test, 'survey', None)
                    responses = SurveyResponse.objects.filter(test=video_test)
                else:
                    responses = SurveyResponse.objects.none()
            except:
                responses = SurveyResponse.objects.none()

            satisfaction_scores = []
            user_map = {} # user_id -> {test: ..., survey: ...}

            # 1. テスト結果をマッピング
            for tr in test_results.order_by('created_at'):
                try:
                    user_obj = tr.user
                    uid = user_obj.user_id
                    if uid not in user_map:
                        user_map[uid] = {"user": user_obj, "test": None, "survey": None, "test_obj": None}
                    
                    if user_map[uid]["test"] is None:
                        user_map[uid]["test"] = {
                            "score": tr.score,
                            "max_score": tr.max_score,
                            "is_passed": tr.is_passed,
                            "created_at": tr.created_at
                        }
                        user_map[uid]["test_obj"] = tr
                except:
                    continue

            # 2. アンケート結果をマッピング
            for resp in responses:
                try:
                    uid = resp.user_id
                    if not uid: continue
                    
                    if uid not in user_map:
                        user_obj = User.objects.filter(user_id=uid).first()
                        user_map[uid] = {"user": user_obj, "test": None, "survey": None, "test_obj": None}
                    
                    answers = []
                    satisfaction = None
                    for ans in SurveyAnswer.objects.filter(response=resp):
                        try:
                            ans_text = ans.choice.text if ans.choice else ans.answer_text
                            q_text = ans.question.text if (ans.question and hasattr(ans.question, 'text')) else "項目"
                            answers.append({
                                "question": q_text,
                                "answer": ans_text or ""
                            })
                            # 満足度の計算
                            if q_text and "満足度" in q_text and ans_text:
                                val = 0
                                if "とても満足" in ans_text: val = 4
                                elif "満足" in ans_text: val = 3
                                elif "普通" in ans_text: val = 2
                                elif "不満" in ans_text: val = 1
                                if val > 0:
                                    satisfaction_scores.append(val)
                                    satisfaction = val
                        except:
                            continue

                    user_map[uid]["survey"] = {
                        "satisfaction": satisfaction,
                        "answers": answers,
                        "created_at": resp.created_at
                    }
                except:
                    continue

            avg_sat = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0

            # データがある場合のみ追加
            if test_results.exists() or responses.exists():
                logs = []
                from django.utils import timezone
                now = timezone.now()

                for uid, data in user_map.items():
                    test_details = []
                    if data["test_obj"]:
                        try:
                            for ta in data["test_obj"].answers.all():
                                test_details.append({
                                    "question": ta.question.text if ta.question else "問題",
                                    "user_choice": ta.choice.text if ta.choice else "",
                                    "is_correct": ta.choice.is_correct if ta.choice else False
                                })
                        except:
                            pass

                    logs.append({
                        "user_id": uid,
                        "display_name": data["user"].display_name if (data["user"] and hasattr(data["user"], 'display_name')) else "匿名",
                        "test": data["test"],
                        "test_details": test_details,
                        "survey": data["survey"]
                    })
                
                # 安全な並べ替え
                def get_sort_key(log_item):
                    if log_item.get("test") and log_item["test"].get("created_at"):
                        return log_item["test"]["created_at"]
                    if log_item.get("survey") and log_item["survey"].get("created_at"):
                        return log_item["survey"]["created_at"]
                    return now

                logs.sort(key=get_sort_key, reverse=True)

                result_data.append({
                    "video_id": video.id,
                    "video_title": video.title,
                    "thumb": video.thumb,
                    "avg_score": round(float(avg_score), 1),
                    "avg_satisfaction": round(float(avg_sat), 1),
                    "total_tests": test_results.count(),
                    "total_surveys": responses.count(),
                    "logs": logs
                })

        return Response(result_data)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": "内部エラーが発生しました", "detail": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_featured_video(request, pk):
    """管理者用: 動画を「おすすめ」にする"""
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)
        
    video = get_object_or_404(Video, pk=pk)
    video.is_featured = not video.is_featured
    video.save()
    return Response({"is_featured": video.is_featured})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_interaction(request):
    """ユーザーのボタンタップ操作を記録する"""
    category = request.data.get('category')
    item_id = request.data.get('item_id')
    item_title = request.data.get('item_title')

    if not category:
        return Response({"error": "Category is required"}, status=400)

    UserInteractionLog.objects.create(
        user=request.user,
        category=category,
        item_id=item_id,
        item_title=item_title
    )

    # ミッション進捗 (TaskButton category)
    if category in ['pixel-shop', 'pixel-event', 'task']:
        update_mission_progress(request.user, 'task_button', action_detail=item_title)
    elif category in ['notice', 'news']:
        update_mission_progress(request.user, 'notice_view')

    return Response({"status": "ok"}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_interaction_logs(request):
    """管理者用: 操作ログ取得 (フィルタリング対応)"""
    # 管理者チェック
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    logs = UserInteractionLog.objects.select_related('user').all().order_by("-created_at")

    # フィルタ
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    user_id = request.GET.get('user_id')
    category = request.GET.get('category')
    team = request.GET.get('team')

    if start_date:
        logs = logs.filter(created_at__date__gte=start_date)
    if end_date:
        logs = logs.filter(created_at__date__lte=end_date)
    if user_id:
        logs = logs.filter(user__user_id__icontains=user_id)
    if category:
        logs = logs.filter(category=category)
    if team:
        logs = logs.filter(user__team=team)

    data = [
        {
            "id": log.id,
            "user_id": log.user.user_id,
            "display_name": log.user.display_name,
            "team": log.user.team,
            "category": log.category,
            "item_id": log.item_id,
            "item_title": log.item_title,
            "created_at": log.created_at
        }
        for log in logs
    ]

    return Response(data)

# 🟦 コメント編集・削除
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def comment_detail(request, pk):
    comment = get_object_or_404(Comment, pk=pk)
    
    # 自分のコメントか、もしくは管理者以外は操作不可
    if str(comment.user_uid) != str(request.user.user_id) and not request.user.is_admin_or_secretary:
        return Response({"error": "権限がありません"}, status=403)

    if request.method == 'PUT':
        if 'content' in request.data:
            comment.content = request.data.get('content')
        if 'image_url' in request.data:
            comment.image_url = request.data.get('image_url')
        comment.save()
        serializer = CommentSerializer(comment, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'DELETE':
        comment.delete()
        return Response(status=204)

# 🟦 お宝コメント編集・削除
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def treasure_comment_detail(request, pk):
    comment = get_object_or_404(TreasureComment, pk=pk)
    
    if str(comment.user_uid) != str(request.user.user_id) and not request.user.is_admin_or_secretary:
        return Response({"error": "権限がありません"}, status=403)

    if request.method == 'PUT':
        if 'content' in request.data:
            comment.content = request.data.get('content')
        if 'image_url' in request.data:
            comment.image_url = request.data.get('image_url')
        comment.save()
        serializer = TreasureCommentSerializer(comment, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'DELETE':
        comment.delete()
        return Response(status=204)
