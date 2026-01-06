from django.db import models
import uuid
from users.models import User

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # UUID型のIDを使用
    author_id = models.CharField(max_length=200, blank=True, null=True)
    user_name = models.CharField(max_length=100)
    profile_image = models.URLField(blank=True, null=True)
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    category = models.CharField(max_length=50, blank=True)
    image = models.URLField(blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    user_uid = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    is_scheduled = models.BooleanField(default=False)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    mentions = models.ManyToManyField(User, related_name='mentioned_posts', blank=True)
    hashtags = models.ManyToManyField('Hashtag', related_name='posts', blank=True)
    is_featured = models.BooleanField(default=False) # ← 事務局おすすめ


    def __str__(self):
        return self.title or "(無題)"

    class Meta:
        db_table = 'posts_post'


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user_name = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_name}: {self.content[:20]}'




from django.db import models
import uuid

class Video(models.Model):
    # Firestore の動画IDをそのまま primary key にする
    id = models.CharField(primary_key=True, max_length=200)

    title = models.CharField(max_length=200)
    user = models.CharField(max_length=100)
    views = models.IntegerField(default=0)
    duration = models.CharField(max_length=10, blank=True, null=True)
    thumb = models.URLField(max_length=500, blank=True, null=True)
    video_url = models.URLField(max_length=500)
    userAvatar = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    watch_time = models.IntegerField(default=0)

    
    # 管理用フィールド
    category = models.CharField(max_length=100, default="未分類", blank=True)
    order = models.IntegerField(default=0)
    is_short = models.BooleanField(default=False) # ← ショート動画フラグ
    is_featured = models.BooleanField(default=False) # ← 注目の動画フラグ


    def __str__(self):
        return self.title

class VideoViewLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name="logs")
    watch_time = models.IntegerField(default=0)
    last_watched_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        user_name = getattr(self.user, "display_name", "Anonymous")
        return f"{self.video.title} - {user_name}"

class Hashtag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"#{self.name}"

class TreasurePost(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    parent_category = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.URLField(max_length=1000, blank=True, null=True)
    image_urls = models.JSONField(blank=True, null=True)  # ← 複数画像対応
    user_uid = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    likes = models.ManyToManyField(User, related_name='liked_treasure_posts', blank=True)

    # 🔹 新規追加フィールド
    age = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    device_used = models.CharField(max_length=100, blank=True, null=True)
    anxiety_needs = models.TextField(blank=True, null=True)
    appeal_points = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title or "(無題)"

    class Meta:
        db_table = 'treasure_posts'
        verbose_name = 'Treasure Post'
        verbose_name_plural = 'Treasure Posts'

class TreasureComment(models.Model):
    post = models.ForeignKey(TreasurePost, on_delete=models.CASCADE, related_name='comments')
    user_name = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user_name}: {self.content[:20]}'

# posts/models.py
class Notice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # お知らせタイトル（必須）
    title = models.CharField(max_length=255)

    # カテゴリ（事務局 / イベント / PixelDrop など）
    category = models.CharField(max_length=100)

    # 本文（Tiptap の HTML をそのまま保存）
    body = models.TextField(blank=True)

    # サムネイル画像URL
    image_url = models.URLField(max_length=1000, blank=True, null=True)

    # 外部リンク (事務局だよりのURLなど)
    external_url = models.URLField(max_length=1000, blank=True, null=True)

    # 本文のどこにサムネイルを置くか（必須）
    image_position = models.CharField(
        max_length=20,
        choices=[
            ("header", "Header"),
            ("top", "Top"),
            ("bottom", "Bottom"),
            ("hidden", "Hidden"),
        ],
        default="header"
    )

    # ログインポップアップ専用フラグ
    is_login_popup = models.BooleanField(default=False)

    # テキストカラー（綱島が言っていた色変更）
    text_color = models.CharField(max_length=20, default="#000000")

    # 管理者名（投稿者）
    admin_name = models.CharField(max_length=100, default="事務局")

    # 投稿日時
    created_at = models.DateTimeField(auto_now_add=True)
    # 更新日時
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "notice"

    def __str__(self):
        return f"[{self.category}] {self.title}"

# === 動画テスト関連モデル ===

class VideoTest(models.Model):
    video = models.OneToOneField(Video, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        try:
            return f"{self.video.title} のテスト"
        except:
            return f"Video Missing (id={self.id})"



class Question(models.Model):
    test = models.ForeignKey(VideoTest, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    order = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.order}. {self.text[:20]}"


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.text} ({'正解' if self.is_correct else '×'})"


class UserTestResult(models.Model):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    video_id = models.CharField(max_length=200)
    score = models.IntegerField()
    max_score = models.IntegerField()
    is_passed = models.BooleanField(default=False)  # ✅ 合否判定を追加
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.display_name} - {self.video_id}: {self.score}/{self.max_score} ({'合格' if self.is_passed else '不合格'})"

class UserTestAnswer(models.Model):
    result = models.ForeignKey(UserTestResult, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.question.text[:10]}... -> {self.choice.text} ({'○' if self.choice.is_correct else '×'})"

class Survey(models.Model):
    video_test = models.OneToOneField(
        VideoTest,
        on_delete=models.CASCADE,
        related_name="survey"
    )
    title = models.CharField(max_length=200)

    def __str__(self):
        return f"Survey of {self.video_test.title}"

class SurveyQuestion(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name="questions")
    text = models.CharField(max_length=255)
    order = models.IntegerField(default=1)
    question_type = models.CharField(max_length=50, default="choice")

class SurveyChoice(models.Model):
    question = models.ForeignKey(SurveyQuestion, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=255)

class SurveyResponse(models.Model):
    test = models.ForeignKey(VideoTest, on_delete=models.CASCADE)
    user_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class SurveyAnswer(models.Model):
    response = models.ForeignKey(SurveyResponse, on_delete=models.CASCADE)
    question = models.ForeignKey(SurveyQuestion, on_delete=models.CASCADE)
    answer_text = models.TextField(blank=True, null=True)
    choice = models.ForeignKey(SurveyChoice, blank=True, null=True, on_delete=models.SET_NULL)

class OfficeNews(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    thumbnail = models.URLField(max_length=1000, blank=True, null=True)
    external_url = models.URLField(max_length=1000, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'office_news'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class TaskButton(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    icon_name = models.CharField(max_length=50)  # Lucide icon name
    color = models.CharField(max_length=50, default="text-gray-800")
    url = models.CharField(max_length=500, blank=True, null=True)
    category = models.CharField(max_length=50)  # pixel-shop / pixel-event
    parent_category = models.CharField(max_length=50, blank=True, null=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category} - {self.title}"

    class Meta:
        ordering = ['category', 'order']


class UserInteractionLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="interaction_logs")
    category = models.CharField(max_length=50)  # post, video, knowhow, task
    item_id = models.CharField(max_length=255, blank=True, null=True)
    item_title = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.display_name} - {self.category} - {self.item_title}"

    class Meta:
        db_table = 'user_interaction_logs'
        ordering = ['-created_at']

class LoginPopupSetting(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notice = models.OneToOneField(Notice, on_delete=models.CASCADE, related_name="popup_setting")
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Popup: {self.notice.title} ({'Active' if self.is_active else 'Inactive'})"
