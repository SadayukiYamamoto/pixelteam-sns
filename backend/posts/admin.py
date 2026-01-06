from django.contrib import admin
from .models import Post

admin.site.register(Post)

# posts/admin.py

from django.contrib import admin
from .models import Video, VideoViewLog

# 視聴ログを Video 画面で inline 表示
class VideoViewLogInline(admin.TabularInline):
    model = VideoViewLog
    extra = 0
    readonly_fields = ("user", "watch_time", "last_watched_at")

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "user",
        "views",
        "watch_time",
        "average_watch_rate",
        "completion_count",
        "category", # ← 追加
    )
    search_fields = ("title", "id", "user")
    list_filter = ("user",)
    inlines = [VideoViewLogInline]

    def average_watch_rate(self, obj):
        try:
            duration_sec = VideoAdmin.parse_duration(obj.duration)
            if duration_sec == 0:
                return "0%"
            rate = (obj.watch_time / duration_sec) * 100
            return f"{rate:.1f}%"
        except:
            return "-"

    average_watch_rate.short_description = "平均視聴率"

    def completion_count(self, obj):
        try:
            duration_sec = VideoAdmin.parse_duration(obj.duration)
            logs = VideoViewLog.objects.filter(video=obj)  # ← 修正！
            return sum(1 for log in logs if log.watch_time >= duration_sec * 0.8)
        except:
            return 0

    completion_count.short_description = "完走数"

    @staticmethod
    def parse_duration(duration_str):
        try:
            parts = duration_str.split(":")
            if len(parts) == 2:
                m, s = parts
                return int(m) * 60 + int(s)
            elif len(parts) == 3:
                h, m, s = parts
                return int(h) * 3600 + int(m) * 60 + int(s)
            return 0
        except:
            return 0

@admin.register(VideoViewLog)
class VideoViewLogAdmin(admin.ModelAdmin):
    list_display = ("video", "user", "watch_time", "last_watched_at")  # ← 修正！
    search_fields = ("video__id", "user__display_name")  # ← 修正！
    list_filter = ("last_watched_at",)



from django.contrib import admin
from .models import VideoTest, Question, Choice, UserTestResult, UserTestAnswer


# -------------------------
# Choice（選択肢）を Question 内に表示
# -------------------------
class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 2   # 追加で2つの空行を出す
    min_num = 2 # 最低2つの選択肢が必要
    max_num = 10
    fields = ("text", "is_correct")


# -------------------------
# Question（問題）を VideoTest 内に表示
# -------------------------
class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    show_change_link = True  # 詳細編集リンクも表示
    fields = ("order", "text")
    ordering = ("order",)
    inlines = [ChoiceInline]


# Django Admin では Inline のネストが標準機能では不可のため、
# QuestionInline 内で ChoiceInline は直接入りません。
# その代わり Question をクリックした先で ChoiceInline が表示される構成になります。

# -------------------------
# Question Admin（問題ごとに選択肢編集）
# -------------------------
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "test", "order", "text")
    list_filter = ("test",)
    ordering = ("test", "order")
    inlines = [ChoiceInline]


# -------------------------
# Choice Admin（ほぼ使わないが一応）
# -------------------------
@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "text", "is_correct")
    list_filter = ("is_correct", "question")


# -------------------------
# UserTestResult（成績管理）
# -------------------------
# -------------------------
# UserTestResult（成績管理）
# -------------------------
class UserTestAnswerInline(admin.TabularInline):
    model = UserTestAnswer
    extra = 0
    readonly_fields = ("question", "choice")
    can_delete = False

@admin.register(UserTestResult)
class UserTestResultAdmin(admin.ModelAdmin):
    list_display = ("user", "video_id", "score", "max_score", "is_passed", "created_at")
    list_filter = ("video_id", "user", "is_passed")
    ordering = ("-created_at",)
    inlines = [UserTestAnswerInline]

from django.contrib import admin
from .models import (
    Video, VideoTest, Question, Choice,
    Survey, SurveyQuestion, SurveyChoice,
    SurveyResponse, SurveyAnswer
)


# --- SurveyChoice が SurveyQuestion の中で編集される ---
class SurveyChoiceInline(admin.TabularInline):
    model = SurveyChoice
    extra = 1


# --- SurveyQuestion ---
@admin.register(SurveyQuestion)
class SurveyQuestionAdmin(admin.ModelAdmin):
    list_display = ("survey", "order", "text")
    inlines = [SurveyChoiceInline]


# --- Survey inline（VideoTest 下に表示） ---
class SurveyInline(admin.StackedInline):
    model = Survey
    extra = 1
    max_num = 1

@admin.register(VideoTest)
class VideoTestAdmin(admin.ModelAdmin):
    inlines = [SurveyInline]
    list_display = ("id", "title", "video")


# --- Survey Response & Answer ---
class SurveyAnswerInline(admin.TabularInline):
    model = SurveyAnswer
    extra = 0
    readonly_fields = ("question", "choice", "answer_text")
    can_delete = False

@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ("id", "test", "user_id", "created_at")
    list_filter = ("test", "created_at")
    inlines = [SurveyAnswerInline]
