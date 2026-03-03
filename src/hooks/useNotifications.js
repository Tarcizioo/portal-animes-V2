import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/services/firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, writeBatch, where, deleteDoc } from 'firebase/firestore';

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        const notificationsRef = collection(db, 'users', user.uid, 'notifications');
        const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(20));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }));

            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.read).length);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching notifications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const markAsRead = async (notificationId) => {
        if (!user) return;
        try {
            const notifRef = doc(db, 'users', user.uid, 'notifications', notificationId);
            await updateDoc(notifRef, { read: true });
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!user || notifications.length === 0) return;

        try {
            const batch = writeBatch(db);
            const unread = notifications.filter(n => !n.read);

            if (unread.length === 0) return;

            unread.forEach(n => {
                const notifRef = doc(db, 'users', user.uid, 'notifications', n.id);
                batch.update(notifRef, { read: true });
            });

            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const deleteNotification = async (notificationId) => {
        if (!user) return;
        try {
            const notifRef = doc(db, 'users', user.uid, 'notifications', notificationId);
            await deleteDoc(notifRef);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const deleteAllRead = async () => {
        if (!user || notifications.length === 0) return;
        try {
            const batch = writeBatch(db);
            const read = notifications.filter(n => n.read);
            if (read.length === 0) return;
            read.forEach(n => {
                const ref = doc(db, 'users', user.uid, 'notifications', n.id);
                batch.delete(ref);
            });
            await batch.commit();
        } catch (error) {
            console.error('Error deleting read notifications:', error);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
    };
}
