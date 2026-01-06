from django.utils import timezone
from datetime import timedelta
from .models import Mission, UserMissionProgress
from django.contrib.auth import get_user_model

User = get_user_model()

def get_period_start(mission_type='daily'):
    """
    Returns the start time of the current mission period (3:00 AM reset).
    """
    now = timezone.localtime() # Assumes Asia/Tokyo based on settings.py
    
    if mission_type == 'daily':
        # Reset at 3:00 AM daily
        start_today = now.replace(hour=3, minute=0, second=0, microsecond=0)
        if now < start_today:
            return start_today - timedelta(days=1)
        return start_today
    
    elif mission_type == 'weekly':
        # Reset at Monday 3:00 AM
        days_since_monday = now.weekday() # Monday=0
        start_this_monday = (now - timedelta(days=days_since_monday)).replace(hour=3, minute=0, second=0, microsecond=0)
        
        if now < start_this_monday:
            return start_this_monday - timedelta(weeks=1)
        return start_this_monday
    
    return now

def update_mission_progress(user, action_type, action_detail=None, amount=1):
    """
    Updates progress for users based on triggers.
    Handles shop-wide missions by updating all members in the same shop.
    """
    if not user or not hasattr(user, 'team') or not user.team:
        return

    # Find relevant missions
    missions = Mission.objects.filter(
        team=user.team,
        action_type=action_type
    )
    
    if action_detail:
        missions = missions.filter(action_detail=action_detail)
    
    for mission in missions:
        period_start = get_period_start(mission.mission_type)
        
        target_users = [user]
        if mission.is_shop_wide and user.shop_name:
            target_users = User.objects.filter(shop_name=user.shop_name, team=user.team, is_active=True)
        
        for t_user in target_users:
            progress, _ = UserMissionProgress.objects.get_or_create(
                user=t_user,
                mission=mission
            )
            
            # Reset if stale
            if progress.last_updated < period_start:
                progress.current_count = 0
                progress.is_completed = False
                progress.is_claimed = False
            
            # Update if not already achieved
            if not progress.is_completed:
                progress.current_count += amount
                if progress.current_count >= mission.target_count:
                    progress.current_count = mission.target_count
                    progress.is_completed = True
                progress.save()
