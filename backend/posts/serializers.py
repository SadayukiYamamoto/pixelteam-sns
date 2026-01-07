from rest_framework import serializers
from users.models import User
from .models import Post, Comment, Video, TreasurePost, TreasureComment, Notice, VideoTest, Question, Choice, Survey, SurveyQuestion, SurveyChoice, OfficeNews, TaskButton




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'display_name', 'profile_image')


class PostSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()


    class Meta:
        model = Post
        fields = [
            'id',
            'title',
            'content',
            'category',
            'image',
            'image_url',
            'created_at',
            'user_uid',
            'display_name',
            'profile_image',
            'likes_count',
            'comments_count',
            'hashtags',
            'mentions',
            'is_featured',
            'liked',
        ]
    
    hashtags = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    mentions = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='user_id'
    )

    def get_display_name(self, obj):
        user = User.objects.filter(user_id=obj.user_uid).first()
        return user.display_name if user else "匿名"

    def get_profile_image(self, obj):
        user = User.objects.filter(user_id=obj.user_uid).first()
        return user.profile_image if user else None

    def get_image_url(self, obj):
        if obj.image_url:
            return obj.image_url

        if obj.image:
            if obj.image.startswith("http"):
                return obj.image
            return f"https://firebasestorage.googleapis.com/v0/b/pixelshopsns.firebasestorage.app/o/{obj.image}?alt=media"

        import re
        match = re.search(r'https://firebasestorage\.googleapis\.com/\S+', obj.content or "")
        if match:
            return match.group(0)

        return None

    def get_likes_count(self, obj):  # ✅ ← このメソッド名が大事！
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_liked(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False


class CommentSerializer(serializers.ModelSerializer):
    # user_uid から User モデルを検索してプロフィール画像などを取得
    display_name = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user_name', 'user_uid', 'content', 'image_url', 'created_at', 'display_name', 'profile_image']

    def get_display_name(self, obj):
        if obj.user_uid:
            user = User.objects.filter(user_id=obj.user_uid).first()
            if user:
                return user.display_name or obj.user_name or "匿名"
        return obj.user_name or "匿名"

    def get_profile_image(self, obj):
        if obj.user_uid:
            user = User.objects.filter(user_id=obj.user_uid).first()
            if user:
                return user.profile_image
        return None






class MyPageSerializer(serializers.ModelSerializer):
    posts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'user_id',
            'display_name',
            'profile_image',
            'introduction',
            'pixel_product',
            'posts'
        ]

    def get_posts(self, obj):
        posts = Post.objects.filter(user_uid=obj.user_id)
        return [{'title': p.title, 'content': p.content, 'created_at': p.created_at} for p in posts]

class VideoSerializer(serializers.ModelSerializer):
    is_watched = serializers.SerializerMethodField()
    is_test_passed = serializers.SerializerMethodField()
    has_test = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = '__all__'

    def get_is_watched(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            # VideoViewLogを確認
            # views.py等でVideoViewLogから検索するロジックがあるが、
            # ここではシンプルにLogが存在するかで判定 (watch_time > X秒などの条件は要検討だが一旦ログがあれば視聴済みとする)
            from .models import VideoViewLog
            return VideoViewLog.objects.filter(user=user, video=obj).exists()
        return False

    def get_is_test_passed(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            from .models import UserTestResult
            return UserTestResult.objects.filter(user=user, video_id=str(obj.id), is_passed=True).exists()
        return False
    
    def get_has_test(self, obj):
        from .models import VideoTest
        return VideoTest.objects.filter(video=obj).exists()

class TreasurePostSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    liked = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    user_uid = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = TreasurePost
        fields = [
            'id',
            'title',
            'content',
            'category',
            'parent_category',
            'image_url',
            'image_urls',
            'user_uid',
            'display_name',
            'profile_image',
            'created_at',
            'likes_count',
            'comments_count',
            'liked',
            'age',
            'gender',
            'device_used',
            'anxiety_needs',
            'appeal_points',
        ]

    def get_image_url(self, obj):
        if obj.image_urls:
             return obj.image_urls[0] if isinstance(obj.image_urls, list) and obj.image_urls else None
        return None

    def get_display_name(self, obj):
        user = User.objects.filter(user_id=obj.user_uid).first()
        return user.display_name if user else "匿名"

    def get_profile_image(self, obj):
        user = User.objects.filter(user_id=obj.user_uid).first()
        return user.profile_image if user else None

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_liked(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False

class NoticeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notice
        fields = '__all__'

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ("id", "text")   # is_correct は返さない（不正防止）


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True)

    class Meta:
        model = Question
        fields = ("id", "order", "text", "choices")


class VideoTestSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = VideoTest
        fields = ("video_id", "title", "questions")

class SurveyChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyChoice
        fields = "__all__"

class SurveyQuestionSerializer(serializers.ModelSerializer):
    choices = SurveyChoiceSerializer(many=True)

    class Meta:
        model = SurveyQuestion
        fields = "__all__"

class SurveySerializer(serializers.ModelSerializer):
    questions = SurveyQuestionSerializer(many=True)

    class Meta:
        model = Survey
        fields = "__all__"

class OfficeNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeNews
        fields = '__all__'


class TaskButtonSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskButton
        fields = '__all__'

class TreasureCommentSerializer(serializers.ModelSerializer):
    display_name = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = TreasureComment
        fields = ['id', 'post', 'user_name', 'user_uid', 'content', 'image_url', 'created_at', 'display_name', 'profile_image']

    def get_display_name(self, obj):
        if obj.user_uid:
            user = User.objects.filter(user_id=obj.user_uid).first()
            if user:
                return user.display_name or obj.user_name or "匿名"
        return obj.user_name or "匿名"

    def get_profile_image(self, obj):
        if obj.user_uid:
            user = User.objects.filter(user_id=obj.user_uid).first()
            if user:
                return user.profile_image
        return None

