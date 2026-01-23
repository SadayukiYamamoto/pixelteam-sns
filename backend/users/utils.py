import firebase_admin
from firebase_admin import messaging
import logging

logger = logging.getLogger(__name__)

def send_push_notification(user, title, body, data=None):
    """
    ユーザーにプッシュ通知を送信する
    """
    print(f"DEBUG: Push notification attempt for user: {user.user_id}")
    if not user.fcm_token:
        print(f"DEBUG: User {user.user_id} has NO FCM token. Skipping push notification.")
        logger.info(f"User {user.user_id} has no FCM token. Skipping push notification.")
        return

    print(f"DEBUG: User {user.user_id} HAS FCM token: {user.fcm_token[:10]}...")

    # データが辞書でない場合は空の辞書にする
    if data is None:
        data = {}
    
    # 全てのデータ値を文字列にする必要がある (FCMの制約)
    string_data = {k: str(v) for k, v in data.items()}

    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=string_data,
        token=user.fcm_token,
        # iOSの設定 (バッジなど)
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(badge=1, sound="default"),
            ),
        ),
        # Androidの設定
        android=messaging.AndroidConfig(
            priority="high",
            notification=messaging.AndroidNotification(
                sound="default",
            ),
        ),
    )

    try:
        response = messaging.send(message)
        logger.info(f"Successfully sent push notification to {user.user_id}: {response}")
        return response
    except Exception as e:
        logger.error(f"Error sending push notification to {user.user_id}: {e}")
        # トークンが無効な場合はクリアするなどの処理をここに追加可能
        return None
