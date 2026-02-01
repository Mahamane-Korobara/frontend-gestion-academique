'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Menu } from 'lucide-react';
import { useMessages } from '@/lib/hooks/useMessages';
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
import {
  EmptyState,
  EmptyConversationState,
} from '@/components/annonces/Empty';

import { cn } from '@/lib/utils/cn';

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
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  // Fonction pour parser les dates au format "DD/MM/YYYY HH:MM"
  const parseDate = (dateString) => {
    if (!dateString) return new Date();
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart ? timePart.split(':') : ['00', '00'];
    return new Date(year, month - 1, day, hours, minutes);
  };

  // Construire la liste des conversations
  useEffect(() => {
    const convMap = new Map();

    messages.forEach((msg) => {
      const otherUser = msg.expediteur.id === user?.id ? msg.destinataire : msg.expediteur;
      
      if (!convMap.has(otherUser.id)) {
        convMap.set(otherUser.id, {
          userId: otherUser.id,
          user: otherUser,
        });
      }
    });

    const convArray = Array.from(convMap.values()).sort((a, b) => {
      const lastA = messages
        .filter((m) => 
          (m.expediteur.id === a.userId || m.destinataire.id === a.userId) &&
          (m.expediteur.id === user?.id || m.destinataire.id === user?.id)
        )
        .sort((m1, m2) => parseDate(m2.created_at) - parseDate(m1.created_at))[0];
      
      const lastB = messages
        .filter((m) => 
          (m.expediteur.id === b.userId || m.destinataire.id === b.userId) &&
          (m.expediteur.id === user?.id || m.destinataire.id === user?.id)
        )
        .sort((m1, m2) => parseDate(m2.created_at) - parseDate(m1.created_at))[0];

      if (!lastA) return 1;
      if (!lastB) return -1;
      
      return parseDate(lastB.created_at) - parseDate(lastA.created_at);
    });

    setConversations(convArray);
  }, [messages, user?.id]);

  // Filtrer les conversations
  const filteredConversations = conversations.filter((conv) =>
    conv.user.nom.toLowerCase().includes(searchText.toLowerCase())
  );

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

  // Obtenir le dernier message
  const getLastMessage = (conv) => {
    const allMessages = [...messages, ...sentMessages];
    const convMessages = allMessages.filter(
      (m) =>
        (m.expediteur.id === conv.userId || m.destinataire.id === conv.userId) &&
        (m.expediteur.id === user?.id || m.destinataire.id === user?.id)
    );
    return convMessages.length > 0
      ? convMessages.sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at))[0]
      : null;
  };

  // Compter les messages non lus
  const getUnreadCount = (conv) => {
    return messages.filter(
      (m) => m.destinataire.id === user?.id && 
             m.expediteur.id === conv.userId && 
             !m.is_lu
    ).length;
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
              <Button 
                size="sm" 
                variant="ghost" 
                className="md:hidden"
                onClick={() => setShowSidebar(false)}
              >
                <Menu className="w-5 h-5" />
              </Button>
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
                  const lastMsg = getLastMessage(conv);
                  const unreadCount = getUnreadCount(conv);
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
                      parseDate={parseDate}
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
              {/* En-tête du chat */}
              <ChatHeader 
                conversation={selectedConversation}
                onBack={handleBackToList}
              />

              <Separator />

              {/* Zone des messages */}
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
                          senderName={selectedConversation.user.nom}
                          parseDate={parseDate}
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

              {/* Zone de saisie */}
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
    </Card>
  );
}