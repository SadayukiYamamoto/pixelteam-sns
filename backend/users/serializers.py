from rest_framework import serializers
from .models import User, Badge, Notification


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    badges = BadgeSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = [
            "user_id",
            "display_name",
            "email",
            "profile_image",
            "introduction",
            "pixel_product",
            "team",
            "shop_name",
            "points",
            "exp",
            "expMax",
            "level",
            "is_secretary",
            "terms_agreed",
            "badges", 
        ]


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "user_id",
            "display_name",
            "profile_image",
            "introduction",
            "team",
            "points",
            "level",
            "is_secretary",
            "shop_name",
        ]


class NotificationSerializer(serializers.ModelSerializer):
    sender = PublicUserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "sender",
            "notification_type",
            "post_id",
            "comment_id",
            "badge_name",
            "message",
            "is_read",
            "created_at",
        ]
