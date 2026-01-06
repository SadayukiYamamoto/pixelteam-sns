import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import axiosClient from '../api/axiosClient';

let isInitialized = false;

export const initializePushNotifications = async () => {
    console.log('Push notifications: initializePushNotifications called.');

    if (isInitialized) {
        console.log('Push notifications already initialized, skipping listeners setup.');
        if (Capacitor.getPlatform() !== 'web') {
            console.log('Push notifications: Re-registering to ensure token is fresh.');
            await PushNotifications.register();
        }
        return;
    }

    if (Capacitor.getPlatform() === 'web') {
        console.log('Push notifications: Not supported on web platform.');
        return;
    }

    try {
        console.log('Push notifications: Requesting permissions.');
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.warn('Push notifications: User denied permissions!');
            return;
        }

        console.log('Push notifications: Permissions granted. Setting up listeners.');

        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', async (token) => {
            console.log('Push notifications: Registration success, token:', token.value);
            try {
                // Backend にトークンを送信してユーザーに紐付ける
                const res = await axiosClient.post('update_fcm_token/', { fcm_token: token.value });
                console.log('Push notifications: FCM token synced with backend:', res.data);
            } catch (err) {
                console.error('Push notifications: Failed to sync FCM token with backend:', err.response?.data || err.message);
            }
        });

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Push notifications: Error on registration: ' + JSON.stringify(error));
        });

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notifications: Received: ' + JSON.stringify(notification));
        });

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push notifications: Action performed: ' + JSON.stringify(notification));
        });

        console.log('Push notifications: Calling PushNotifications.register().');
        await PushNotifications.register();
        isInitialized = true;
    } catch (e) {
        console.error('Push notifications: Critical error during initialization:', e);
    }
};
