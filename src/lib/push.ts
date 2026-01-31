import webpush from 'web-push';
import { PushSubscription } from '@/models/all';

// Configure Web Push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@aladdinvapestore.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function sendPushNotificationToAdmins(payload: { title: string; body: string; icon?: string; url?: string }) {
    try {
        const subscriptions = await PushSubscription.find({ isAdmin: true });

        if (subscriptions.length === 0) {
            console.log('No admin subscriptions found for push notifications.');
            return;
        }

        const notificationPayload = JSON.stringify(payload);

        const pushPromises = subscriptions.map(sub =>
            webpush.sendNotification(sub.subscription, notificationPayload)
                .catch(async (err) => {
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        console.log('Subscription expired or gone, removing from DB.');
                        await PushSubscription.findByIdAndDelete(sub._id);
                    } else {
                        console.error('Push notification error:', err);
                    }
                })
        );

        await Promise.all(pushPromises);
    } catch (error) {
        console.error('Failed to send push notifications:', error);
    }
}
