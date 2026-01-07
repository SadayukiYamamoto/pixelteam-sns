from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Mission, UserMissionProgress
from .utils import get_period_start

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mission_list_view(request):
    user = request.user
    if not user.team:
        return Response([])

    missions = Mission.objects.filter(team=user.team).order_by('mission_type', 'order')
    
    data = []
    periods = {
        'daily': get_period_start('daily'),
        'weekly': get_period_start('weekly')
    }

    for mission in missions:
        progress, _ = UserMissionProgress.objects.get_or_create(user=user, mission=mission)
        
        # Check for period reset
        if progress.last_updated < periods[mission.mission_type]:
            progress.current_count = 0
            progress.is_completed = False
            progress.is_claimed = False
            progress.save()
            
        data.append({
            "id": mission.id,
            "title": mission.title,
            "description": mission.description,
            "exp_reward": mission.exp_reward,
            "mission_type": mission.mission_type,
            "current_count": progress.current_count,
            "target_count": mission.target_count,
            "is_completed": progress.is_completed,
            "is_claimed": progress.is_claimed
        })
        
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_mission_view(request, pk):
    user = request.user
    progress = UserMissionProgress.objects.filter(user=user, mission_id=pk).first()
    
    if not progress:
        return Response({"error": "Progress not found"}, status=404)
    
    # Check if the progress is still valid for the current period
    period_start = get_period_start(progress.mission.mission_type)
    if progress.last_updated < period_start:
        # Auto-reset if the user tries to claim a stale mission
        progress.current_count = 0
        progress.is_completed = False
        progress.is_claimed = False
        progress.save()
        return Response({"error": "Mission period has reset"}, status=400)
        
    if not progress.is_completed:
        return Response({"error": "Mission not completed"}, status=400)
        
    if progress.is_claimed:
        return Response({"error": "Reward already claimed"}, status=400)
    
    progress.is_claimed = True
    progress.save()
    
    # Update user EXP
    user.exp += progress.mission.exp_reward
    user.save() # User.save() triggers calculate_level()
    
    return Response({
        "status": "success",
        "new_exp": user.exp,
        "new_level": user.level
    })

from .serializers import LevelRewardSerializer
from .models import LevelReward

# === 管理者用: レベル報酬一覧 & 作成 ===
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_level_reward_list_create(request):
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    if request.method == 'GET':
        rewards = LevelReward.objects.all().order_by('level')
        serializer = LevelRewardSerializer(rewards, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = LevelRewardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

# === 管理者用: レベル報酬編集 & 削除 ===
@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_level_reward_detail(request, pk):
    if not request.user.is_admin_or_secretary:
        return Response({"detail": "権限がありません"}, status=403)

    try:
        reward = LevelReward.objects.get(pk=pk)
    except LevelReward.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    if request.method == 'PATCH':
        serializer = LevelRewardSerializer(reward, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        reward.delete()
        return Response({"message": "Deleted"}, status=204)

from .utils import update_mission_progress

# === 汎用ミッショントリガー ===
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def trigger_mission_view(request):
    action_type = request.data.get('action_type')
    action_detail = request.data.get('action_detail')
    
    if not action_type:
        return Response({"error": "action_type is required"}, status=400)
        
    update_mission_progress(request.user, action_type, action_detail)
    return Response({"status": "success"})
