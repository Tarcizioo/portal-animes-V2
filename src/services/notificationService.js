import {
    collection, addDoc, query, where,
    getDocs, getDoc, serverTimestamp, orderBy, limit,
    Timestamp, doc
} from 'firebase/firestore';
import { db } from '@/services/firebase';

// ─── Preference gate ─────────────────────────────────────────────────────────
/**
 * Returns whether `targetUid` has a given notification type enabled.
 * Defaults to true if the field is missing (opt-out model).
 */
async function isNotifEnabled(targetUid, type) {
    try {
        const snap = await getDoc(doc(db, 'users', targetUid));
        if (!snap.exists()) return true;
        const prefs = snap.data()?.notificationPrefs;
        if (!prefs || prefs[type] === undefined) return true;
        return prefs[type] === true;
    } catch {
        return true; // fail open: don't block notifications on read errors
    }
}

/**
 * Escreve uma notificação na subcoleção do usuário-alvo.
 * Retorna sem fazer nada se o author for o próprio user (sem auto-notificação).
 */
async function createNotification(targetUid, data) {
    if (!targetUid) return;
    try {
        const ref = collection(db, 'users', targetUid, 'notifications');
        await addDoc(ref, {
            ...data,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (err) {
        // Não interrompe a UX por falha de notificação
        console.warn('[notificationService] Falha ao criar notificação:', err);
    }
}

// ─── Deduplicação ────────────────────────────────────────────────────────────
/**
 * Verifica se já existe uma notificação do mesmo tipo + actorUid
 * criada nas últimas `windowHours` horas para o mesmo targetUid.
 */
async function isDuplicate(targetUid, type, actorUid, windowHours = 24) {
    try {
        const since = Timestamp.fromMillis(Date.now() - windowHours * 3600 * 1000);
        const ref = collection(db, 'users', targetUid, 'notifications');
        const q = query(
            ref,
            where('type', '==', type),
            where('actorUid', '==', actorUid),
            where('createdAt', '>=', since),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        const snap = await getDocs(q);
        return !snap.empty;
    } catch {
        return false; // em caso de erro de permissão, deixa criar
    }
}

// ─── Notificação: Visita de Perfil ───────────────────────────────────────────
/**
 * Chama quando currentUser visita o perfil público de targetUid.
 * Anti-spam: só cria 1 notificação por visitante a cada 24h.
 */
export async function notifyProfileView(targetUid, visitorProfile, visitorUid) {
    if (!targetUid || !visitorUid || targetUid === visitorUid) return;
    if (!visitorProfile) return;

    // Check user preference before writing
    const enabled = await isNotifEnabled(targetUid, 'profile_view');
    if (!enabled) return;

    const dup = await isDuplicate(targetUid, 'profile_view', visitorUid, 24);
    if (dup) return;

    await createNotification(targetUid, {
        type: 'profile_view',
        actorUid: visitorUid,
        actorName: visitorProfile.displayName || 'Alguém',
        actorAvatar: visitorProfile.photoURL || null,
        content: `${visitorProfile.displayName || 'Alguém'} visitou seu perfil.`,
        link: `/u/${visitorUid}`,
    });
}

// ─── Notificação: Like em Comentário ─────────────────────────────────────────
/**
 * Chama quando currentUser curte um comentário.
 * Não notifica se for o dono do comentário curtindo o próprio comentário.
 */
export async function notifyCommentLike(commentOwnerUid, likerProfile, likerUid, commentContent, animeId, animeTitle) {
    if (!commentOwnerUid || !likerUid || commentOwnerUid === likerUid) return;
    if (!likerProfile) return;

    // Check user preference before writing
    const enabled = await isNotifEnabled(commentOwnerUid, 'comment_like');
    if (!enabled) return;

    // Anti-spam: 1 like notification por liker por comentário a cada 12h
    const dup = await isDuplicate(commentOwnerUid, 'comment_like', likerUid, 12);
    if (dup) return;

    const preview = commentContent?.length > 50
        ? commentContent.slice(0, 47) + '…'
        : commentContent;

    await createNotification(commentOwnerUid, {
        type: 'comment_like',
        actorUid: likerUid,
        actorName: likerProfile.displayName || 'Alguém',
        actorAvatar: likerProfile.photoURL || null,
        content: `${likerProfile.displayName || 'Alguém'} curtiu seu comentário: "${preview}"`,
        link: `/anime/${animeId}`,
        animeId,
        animeTitle: animeTitle || '',
    });
}
