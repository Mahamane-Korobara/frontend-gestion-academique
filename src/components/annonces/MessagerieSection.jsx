'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Menu, Plus } from 'lucide-react';
import { useMessages } from '@/lib/hooks/useMessages';
import { useUsers } from '@/lib/hooks/useUsers';
import useAuth from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/partage/LoadingSpinner';
import ErrorAlert from '@/components/partage/ErrorAlert';
import ConversationItem from '@/components/annonces/ConversationItem';
import ChatHeader from '@/components/annonces/ChatHeader';
import MessageBubble from '@/components/annonces/MessageBubble';
import MessageInput from '@/components/annonces/MessageInput';
import NewConversationModal from '@/components/annonces/NewConversationModal';
import {
  EmptyState,
  EmptyConversationState,
} from '@/components/annonces/Empty';
import { cn } from '@/lib/utils/cn';

// Import des fonctions utilitaires
import {
  parseCustomDate,
  buildConversations,
  filterConversations,
  getLastMessage,
  getUnreadCount,
  getUserDisplayName,
  normalizeUser,
} from '@/lib/utils/messageHelpers';

export default function MessagerieSection() {
  const { 
    messages, 
    sentMessages, 
    currentConversationMessages, 
    createMessage, 
    loading, 
    error,
    loadConversation, 
    fetchUnreadCount 
  } = useMessages();
  const { user } = useAuth();
  const { users, loading: usersLoading, error: usersError } = useUsers();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Filtrer les utilisateurs (exclure l'utilisateur connecté)
  const availableUsers = users.filter((u) => u.id !== user?.id);

  // Construire la liste des conversations (SIMPLIFIÉ)
  useEffect(() => {
    if (!user?.id) return;
    
    const builtConversations = buildConversations(
      messages, 
      sentMessages, 
      user.id, 
      parseCustomDate
    );
    
    setConversations(builtConversations);
  }, [messages, sentMessages, user?.id]);

  // Filtrer les conversations (SIMPLIFIÉ)
  const filteredConversations = filterConversations(conversations, searchText);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversationMessages]);

  // Charger la conversation
  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);
    setShowSidebar(false);
    setLoadingConversation(true);
    try {
      await loadConversation(conv.userId);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoadingConversation(false);
    }
  };

  // Retour à la liste
  const handleBackToList = () => {
    setShowSidebar(true);
    setSelectedConversation(null);
  };

  // Envoyer un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await createMessage({
        destinataire_id: selectedConversation.userId,
        sujet: 'Message',
        contenu: messageText,
      });
      setMessageText('');
      
      await loadConversation(selectedConversation.userId);
      await fetchUnreadCount();
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Gérer l'envoi d'un message à un nouvel utilisateur (SIMPLIFIÉ)
  const handleSelectUserAndSendMessage = async (userId, messageContent) => {
    try {
      await createMessage({
        destinataire_id: userId,
        sujet: 'Message',
        contenu: messageContent,
      });

      await loadConversation(userId);
      await fetchUnreadCount();

      // Sélectionner la conversation (SIMPLIFIÉ avec normalizeUser)
      const selectedUser = availableUsers.find((u) => u.id === userId);
      if (selectedUser) {
        setSelectedConversation({
          userId: selectedUser.id,
          user: normalizeUser(selectedUser),
        });
        setShowSidebar(false);
      }

      return true;
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      throw err;
    }
  };

  if (loading && conversations.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <Card className="h-[calc(100vh-120px)] min-h-125 max-h-200 rounded-none sm:rounded-xl border-0 sm:border overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar - Liste des conversations */}
        <div 
          className={cn(
            "border-r-0 md:border-r bg-gray-50 flex-col",
            showSidebar ? "flex w-full md:w-80 lg:w-96" : "hidden md:flex md:w-80 lg:w-96"
          )}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b bg-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Messages</h2>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="rounded-full p-2 hover:bg-gray-100"
                  onClick={() => setIsNewConversationModalOpen(true)}
                  title="Nouvelle conversation"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="md:hidden"
                  onClick={() => setShowSidebar(false)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 h-9 sm:h-10 rounded-full text-sm"
              />
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredConversations.length > 0 ? (
              <div className="divide-y">
                {filteredConversations.map((conv) => {
                  // SIMPLIFIÉ - Utilisation des fonctions utilitaires
                  const lastMsg = getLastMessage(
                    messages, 
                    sentMessages, 
                    conv.userId, 
                    user?.id, 
                    parseCustomDate
                  );
                  const unreadCount = getUnreadCount(messages, conv.userId, user?.id);
                  const isSelected = selectedConversation?.userId === conv.userId;

                  return (
                    <ConversationItem
                      key={conv.userId}
                      conversation={conv}
                      lastMessage={lastMsg}
                      unreadCount={unreadCount}
                      isSelected={isSelected}
                      currentUserId={user?.id}
                      onClick={() => handleSelectConversation(conv)}
                      parseDate={parseCustomDate}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState 
                message={conversations.length === 0 
                  ? 'Aucun message pour le moment' 
                  : 'Aucune conversation trouvée'
                } 
              />
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div 
          className={cn(
            "flex-1 flex-col bg-white",
            !showSidebar || selectedConversation ? "flex" : "hidden md:flex"
          )}
        >
          {selectedConversation ? (
            <>
              <ChatHeader 
                conversation={selectedConversation}
                onBack={handleBackToList}
              />

              <Separator />

              {loadingConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto no-scrollbar p-3 sm:p-4 bg-gray-50">
                  <div className="space-y-2 sm:space-y-3">
                    {currentConversationMessages.length > 0 ? (
                      currentConversationMessages.map((msg) => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwn={msg.expediteur.id === user?.id}
                          senderName={getUserDisplayName(selectedConversation.user)}
                          parseDate={parseCustomDate}
                        />
                      ))
                    ) : (
                      <EmptyState message="Aucun message dans cette conversation" />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}

              <Separator />

              <MessageInput
                value={messageText}
                onChange={setMessageText}
                onSubmit={handleSendMessage}
                disabled={sendingMessage}
              />
            </>
          ) : (
            <EmptyConversationState />
          )}
        </div>
      </div>

      {/* Modal pour créer une nouvelle conversation */}
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        users={availableUsers}
        usersLoading={usersLoading}
        usersError={usersError}
        onSelectUserAndSendMessage={handleSelectUserAndSendMessage}
      />
    </Card>
  );
}