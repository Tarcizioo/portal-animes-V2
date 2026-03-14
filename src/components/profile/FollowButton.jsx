import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/context/AuthContext';
import { notifyNewFollower } from '@/services/notificationService';
import { useUserProfile } from '@/hooks/useUserProfile';

/**
 * FollowButton
 * Rendered on a public profile. Hidden on your own profile or when logged out.
 *
 * @param {string}  targetUid      - UID of the profile being viewed
 * @param {object}  targetProfile  - Public profile data of the target user
 */
export function FollowButton({ targetUid, targetProfile }) {
    const { user } = useAuth();
    const { profile: myProfile } = useUserProfile();
    const { isFollowing, loading, mutating, follow, unfollow } = useFollow(targetUid);
    const [hovered, setHovered] = useState(false);

    // Don't render for own profile or logged-out users
    if (!user || !targetUid || user.uid === targetUid) return null;
    if (loading) return null;

    const handleClick = async () => {
        if (mutating) return;
        if (isFollowing) {
            await unfollow();
        } else {
            await follow(targetProfile);
            // Fire-and-forget notification
            notifyNewFollower(targetUid, myProfile, user.uid).catch(() => {});
        }
    };

    const label = isFollowing
        ? (hovered ? 'Deixar de seguir' : 'Seguindo')
        : '+ Seguir';

    const Icon = mutating
        ? Loader2
        : isFollowing
            ? (hovered ? UserMinus : UserCheck)
            : UserPlus;

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={mutating}
            className={`flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-md transition-all text-xs md:text-sm font-bold border ${
                isFollowing
                    ? hovered
                        ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
                        : 'bg-bg-secondary border-border-color text-text-primary hover:border-button-accent/50'
                    : 'bg-button-accent text-text-on-primary border-transparent hover:opacity-90'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${mutating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{label}</span>
        </motion.button>
    );
}
