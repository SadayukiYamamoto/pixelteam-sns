export const handleNotificationRedirection = (notif, navigate, onClose = null) => {
    if (!notif || !notif.post_id) return;

    if (notif.notification_type === 'NEWS') {
        navigate(`/notice/${notif.post_id}`);
    } else {
        const query = (notif.notification_type === 'COMMENT' || notif.notification_type === 'REPLY' || notif.comment_id) ? '?openComments=true' : '';
        if (notif.is_treasure_post) {
            navigate(`/treasure/post/${notif.post_id}${query}`);
        } else {
            navigate(`/posts/${notif.post_id}${query}`);
        }
    }

    if (onClose) onClose();
};
