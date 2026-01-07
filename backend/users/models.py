from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


# --- カスタムユーザーマネージャー ---
class UserManager(BaseUserManager):
    def create_user(self, user_id, display_name=None, password=None, **extra_fields):
        if not user_id:
            raise ValueError("User must have a user_id")
        user = self.model(user_id=user_id, display_name=display_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, user_id, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(user_id, password=password, **extra_fields)


# === バッジ ===
class Badge(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=500)  # Firebase URL
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# --- カスタムユーザーモデル ---
class User(AbstractBaseUser, PermissionsMixin):
    user_id = models.CharField(max_length=128, unique=True)
    display_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(max_length=254, blank=True, null=True)
    profile_image = models.TextField(blank=True, null=True)
    introduction = models.TextField(blank=True, null=True)
    pixel_product = models.CharField(max_length=100, blank=True, null=True)
    shop_name = models.CharField(max_length=100, blank=True, null=True) # 🆕 店舗名

    points = models.IntegerField(default=0)
    exp = models.IntegerField(default=0)
    expMax = models.IntegerField(default=500)
    level = models.IntegerField(default=0)

    # 多対多のバッジ
    badges = models.ManyToManyField(Badge, blank=True, related_name="users")

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_secretary = models.BooleanField(default=False)  # 🆕 事務局判定
    date_joined = models.DateTimeField(auto_now_add=True)

    # 🆕 ログインポップアップ用
    login_count = models.IntegerField(default=0)
    last_seen_popup_id = models.UUIDField(null=True, blank=True)

    team = models.CharField(
        max_length=50,
        choices=[
            ("shop", "Pixel-Shop"),
            ("event", "Pixel-Event"),
            ("training", "Pixel-Training"),
        ],
        blank=True,
        null=True,
    )

    objects = UserManager()

    USERNAME_FIELD = "user_id"
    REQUIRED_FIELDS = ["email"]

    @property
    def is_admin_or_secretary(self):
        # 特定のUIDも管理者扱い
        admin_uids = ["Xx7gnfTCPQMXlNS5ceM4uUltoD03"]
        return self.is_staff or self.is_superuser or self.is_secretary or self.user_id in admin_uids

    def __str__(self):
        return self.display_name or self.user_id

    # レベル計算
    def calculate_level(self):
        # 0-99: Lev 0, 100-199: Lev 1, etc.
        return self.exp // 100

    def save(self, *args, **kwargs):
        old_level = getattr(self, '_original_level', None)
        self.level = self.calculate_level()
        new_level = self.level
        
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Check for Level Rewards
        if not is_new and old_level is not None and new_level > old_level:
            from missions.models import LevelReward
            # Check all levels reached from old+1 to new
            rewards = LevelReward.objects.filter(level__gt=old_level, level__lte=new_level)
            for reward in rewards:
                if reward.badge not in self.badges.all():
                    self.badges.add(reward.badge)
                    # Create Notification
                    Notification.objects.create(
                        recipient=self,
                        notification_type='BADGE',
                        badge_name=reward.badge.name,
                        message=f"レベル {reward.level} 到達報酬！バッジ「{reward.badge.name}」を獲得しました！"
                    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_level = self.level


# --- ポイントログ ---
class PointLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="admin_user")
    old_points = models.IntegerField()
    new_points = models.IntegerField()
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.display_name}：{self.old_points} → {self.new_points}"


# --- 通知 ---
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('LIKE', 'いいね'),
        ('COMMENT', 'コメント'),
        ('MENTION', 'メンション'),
        ('BADGE', 'バッジ付与'),
        ('POINT', 'ポイント変動'),
        ('NEWS', 'お知らせ'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    
    # 関連オブジェクト (必要に応じて)
    post_id = models.CharField(max_length=255, blank=True, null=True) # UUID or ID
    comment_id = models.IntegerField(blank=True, null=True)
    badge_name = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.display_name}への通知 ({self.notification_type})"
