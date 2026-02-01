/**
 * Combine les messages reçus et envoyés
 */
export const combineMessages = (messages, sentMessages) => {
    return [...messages, ...sentMessages];
};

/**
 * Filtre les messages d'une conversation spécifique
 */
export const getConversationMessages = (allMessages, conversationUserId, currentUserId) => {
    return allMessages.filter(
        (m) =>
            (m.expediteur.id === conversationUserId || m.destinataire.id === conversationUserId) &&
            (m.expediteur.id === currentUserId || m.destinataire.id === currentUserId)
    );
};

/**
 * Trie les messages par date (du plus récent au plus ancien)
 */
export const sortMessagesByDate = (messages, parseDate) => {
    return messages.sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
};

/**
 * Obtient le dernier message d'une conversation
 */
export const getLastMessage = (messages, sentMessages, conversationUserId, currentUserId, parseDate) => {
    const allMessages = combineMessages(messages, sentMessages);
    const conversationMessages = getConversationMessages(allMessages, conversationUserId, currentUserId);

    if (conversationMessages.length === 0) return null;

    return sortMessagesByDate(conversationMessages, parseDate)[0];
};

/**
 * Compte les messages non lus d'une conversation
 */
export const getUnreadCount = (messages, conversationUserId, currentUserId) => {
    return messages.filter(
        (m) =>
            m.destinataire.id === currentUserId &&
            m.expediteur.id === conversationUserId &&
            !m.is_lu
    ).length;
};

/**
 * Normalise le nom d'un utilisateur (gère nom/name)
 */
export const getUserDisplayName = (user) => {
    if (!user) return '';
    return user.nom || user.name || '';
};

/**
 * Normalise un objet utilisateur avec les propriétés requises
 */
export const normalizeUser = (user) => {
    if (!user) return null;

    return {
        id: user.id,
        nom: user.nom || user.name || '',
        name: user.name || user.nom || '',
        role: user.role,
        email: user.email,
    };
};

/**
 * Parse une date au format "DD/MM/YYYY HH:MM"
 */
export const parseCustomDate = (dateString) => {
    if (!dateString) return new Date();

    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];

    return new Date(year, month - 1, day, hours, minutes);
};

/**
 * Construit la liste des conversations à partir des messages
 */
export const buildConversations = (messages, sentMessages, currentUserId, parseDate) => {
    const convMap = new Map();
    const allMessages = combineMessages(messages, sentMessages);

    allMessages.forEach((msg) => {
        const otherUser = msg.expediteur.id === currentUserId ? msg.destinataire : msg.expediteur;

        if (!convMap.has(otherUser.id)) {
            convMap.set(otherUser.id, {
                userId: otherUser.id,
                user: normalizeUser(otherUser),
            });
        }
    });

    // Convertir en tableau et trier par dernier message
    const conversations = Array.from(convMap.values()).sort((a, b) => {
        const lastA = getLastMessage(messages, sentMessages, a.userId, currentUserId, parseDate);
        const lastB = getLastMessage(messages, sentMessages, b.userId, currentUserId, parseDate);

        if (!lastA) return 1;
        if (!lastB) return -1;

        return parseDate(lastB.created_at) - parseDate(lastA.created_at);
    });

    return conversations;
};

/**
 * Filtre les conversations par texte de recherche
 */
export const filterConversations = (conversations, searchText) => {
    if (!searchText.trim()) return conversations;

    const searchLower = searchText.toLowerCase();

    return conversations.filter((conv) => {
        const userName = getUserDisplayName(conv.user);
        return userName.toLowerCase().includes(searchLower);
    });
};