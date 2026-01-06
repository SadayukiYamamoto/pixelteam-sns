from rest_framework import serializers
from .models import Mission, UserMissionProgress, LevelReward
from users.serializers import BadgeSerializer

class MissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mission
        fields = "__all__"

class LevelRewardSerializer(serializers.ModelSerializer):
    badge_data = BadgeSerializer(source='badge', read_only=True)
    
    class Meta:
        model = LevelReward
        fields = ["id", "level", "badge", "badge_data", "created_at"]
