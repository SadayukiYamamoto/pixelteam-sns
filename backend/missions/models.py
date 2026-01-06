from django.db import models
from django.conf import settings
import uuid

class Mission(models.Model):
    MISSION_TYPES = [
        ('daily', 'DAILY'),
        ('weekly', 'WEEKLY'),
    ]

    TEAM_TYPES = [
        ('shop', 'Pixel-Shop'),
        ('event', 'Pixel-Event'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    exp_reward = models.IntegerField(default=1)
    mission_type = models.CharField(max_length=10, choices=MISSION_TYPES)
    team = models.CharField(max_length=10, choices=TEAM_TYPES)
    
    # Trigger action name (e.g., 'login', 'post', 'like', 'comment', 'treasure_post', etc.)
    action_type = models.CharField(max_length=50)
    
    # Identifier for specific actions (e.g., TaskButton title or Notice ID)
    action_detail = models.CharField(max_length=255, blank=True, null=True)
    
    target_count = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    
    # Whether this mission is achieved if ANYONE in the shop completes it
    is_shop_wide = models.BooleanField(default=False)

    def __str__(self):
        return f"[{self.mission_type}] {self.title} ({self.team})"

class UserMissionProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mission_progress")
    mission = models.ForeignKey(Mission, on_delete=models.CASCADE)
    current_count = models.IntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    is_claimed = models.BooleanField(default=False)
    
    # Used to check period reset logic
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'mission')

    def __str__(self):
        return f"{self.user.display_name} - {self.mission.title} ({self.current_count}/{self.mission.target_count})"

class LevelReward(models.Model):
    level = models.IntegerField(unique=True)
    badge = models.ForeignKey('users.Badge', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lv.{self.level} Reward: {self.badge.name}"
