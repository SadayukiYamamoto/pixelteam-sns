from django.urls import path
from .views import (
    mission_list_view, 
    claim_mission_view,
    admin_level_reward_list_create,
    admin_level_reward_detail,
    trigger_mission_view
)

urlpatterns = [
    path('', mission_list_view, name='mission-list'),
    path('<int:pk>/claim/', claim_mission_view, name='claim-mission'),
    
    # Admin
    path('admin/level-rewards/', admin_level_reward_list_create, name='admin-level-reward-list'),
    path('admin/level-rewards/<int:pk>/', admin_level_reward_detail, name='admin-level-reward-detail'),
    
    # Trigger
    path('trigger/', trigger_mission_view, name='trigger-mission'),
]
