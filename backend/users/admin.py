from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User, Badge


class CustomUserAdmin(UserAdmin):

    # 一覧表示
    list_display = ("user_id", "display_name", "points", "exp", "level", "profile_image_preview")

    # 編集不可項目
    readonly_fields = (
        "profile_image_preview",
        "profile_image_display",
        "last_login",
        "date_joined",
    )

    # 表示するフィールド構成
    fieldsets = (
        # 基本情報
        (None, {"fields": ("user_id", "password")}),

        # プロフィール
        ("プロフィール情報", {
            "fields": (
                "display_name",
                "email",
                "profile_image",
                "profile_image_display",
                "introduction",
                "pixel_product",
                "team",
            )
        }),

        # ゲーム・ポイント情報
        ("ゲーム情報", {
            "fields": (
                "points",
                "exp",
                "level",
                "badges",
            )
        }),

        # 権限
        ("権限", {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),

        # ログ情報（read-only）
        ("ログ情報", {"fields": ("last_login", "date_joined")}),
    )

    # 新規作成時
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("user_id", "email", "password1", "password2", "is_staff", "is_active")
        }),
    )

    ordering = ("user_id",)

    list_display = ("user_id", "display_name", "points", "exp", "level")

    # ====== 画像プレビュー ======
    def profile_image_preview(self, obj):
        img = obj.profile_image
        if not img:
            return "-"
        url = getattr(img, "url", img)
        return format_html(
            '<img src="{}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;" />',
            url,
        )
    profile_image_preview.short_description = "画像"

    def profile_image_display(self, obj):
        img = obj.profile_image
        if not img:
            return "No image"
        url = getattr(img, "url", img)
        return format_html(
            '<img src="{}" style="width:120px; height:120px; border-radius:50%; object-fit:cover; border:1px solid #ccc;" />',
            url,
        )
    profile_image_display.short_description = "プロフィール画像"


admin.site.register(User, CustomUserAdmin)


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ("name", "image_preview", "description", "created_at")
    search_fields = ("name",)
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if not obj.image_url:
            return "(no image)"
        return format_html(
            '<img src="{}" style="width:60px;height:60px;object-fit:contain;border-radius:4px;">',
            obj.image_url,
        )

class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ("user_id", "display_name", "points", "exp", "level")
    ordering = ("user_id",)

    fieldsets = (
        ("基本情報", {
            "fields": ("user_id", "display_name", "email", "profile_image")
        }),
        ("ポイント / レベル", {
            "fields": ("points", "exp", "level")
        }),
        ("バッジ", {
            "fields": ("badges",)
        }),
        ("パーミッション", {
            "fields": ("is_active", "is_staff", "is_superuser")
        }),
    )

    filter_horizontal = ("badges",)
