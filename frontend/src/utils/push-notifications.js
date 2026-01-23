import { PushNotifications } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';
import axiosClient from '../api/axiosClient';

let isInitialized = false;

export const initializePushNotifications = async () => {
    console.log('Push notifications: initializePushNotifications called.');

    if (isInitialized) {
        if (Capacitor.getPlatform() !== 'web') {
            await PushNotifications.register();
        }
        return;
    }

    if (Capacitor.getPlatform() === 'web') {
        console.log('Push notifications: Not supported on web platform.');
        return;
    }

    try {
        console.log('Push notifications: Checking permissions.');
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        // トークン登録時のリスナー
        PushNotifications.addListener('registration', async (token) => {
            console.log('Push notifications: Registration success (APNs):', token.value);

            try {
                let fcmTokenValue = token.value;
                if (Capacitor.getPlatform() === 'ios') {
                    // iOSの場合はFCMトークンに変換して取得
                    const fcmRes = await FCM.getToken();
                    fcmTokenValue = fcmRes.token;
                    console.log('Push notifications: FCM TOKEN OBTAINED:', fcmTokenValue);
                }

                // Backend に FCM トークンを送信
                const res = await axiosClient.post('update_fcm_token/', { fcm_token: fcmTokenValue });
                console.log('Push notifications: Token synced with backend:', res.data);
            } catch (err) {
                console.error('Push notifications: Error during FCM token sync:', err);
            }
        });

        PushNotifications.addListener('registrationError', (error) => {
            console.error('Push notifications: Error on registration:', JSON.stringify(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notifications: Received:', JSON.stringify(notification));
        });

        console.log('Push notifications: Calling PushNotifications.register()...');
        await PushNotifications.register();
        isInitialized = true;

    } catch (e) {
        console.error('Push notifications: Critical error during initialization:', e);
    }
};
