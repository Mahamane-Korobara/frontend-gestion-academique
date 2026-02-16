'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import FormSelect from '@/components/forms/FormSelect';
import FormTextarea from '@/components/forms/FormTextarea';
import LoadingSpinner from '@/components/partage/LoadingSpinner';
import ErrorAlert from '@/components/partage/ErrorAlert';

export default function NewConversationModal({
  isOpen,
  onClose,
  users = [],
  usersLoading = false,
  usersError = null,
  initialUserId = null,
  onSelectUserAndSendMessage,
}) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState({});

  // Pré-remplir avec l'utilisateur initial ou le seul utilisateur disponible
  useEffect(() => {
    if (isOpen) {
      if (initialUserId) {
        setSelectedUserId(initialUserId.toString());
      } else if (users.length === 1) {
        setSelectedUserId(users[0].id.toString());
      }
    }
  }, [isOpen, initialUserId, users]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId('');
      setMessageContent('');
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!selectedUserId.trim()) {
      newErrors.selectedUserId = 'Veuillez sélectionner un destinataire';
    }

    if (!messageContent.trim()) {
      newErrors.messageContent = 'Le message est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    setIsSending(true);

    try {
      await onSelectUserAndSendMessage(
        parseInt(selectedUserId),
        messageContent
      );

      // Réinitialiser le formulaire
      setSelectedUserId('');
      setMessageContent('');
      setErrors({});

      toast.success('Message envoyé avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast.error(
        error.message || 'Une erreur est survenue lors de l\'envoi du message'
      );
    } finally {
      setIsSending(false);
    }
  };

  if (usersLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <LoadingSpinner />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-sm" /> 
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Sélectionnez un destinataire et envoyez un message
          </DialogDescription>
        </DialogHeader>

        {usersError && (
          <ErrorAlert
            title="Erreur de chargement"
            message="Impossible de charger la liste des utilisateurs"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sélection du destinataire */}
          <FormSelect
            id="recipient"
            name="recipient"
            label="Destinataire"
            value={selectedUserId}
            onValueChange={(value) => {
              setSelectedUserId(value);
              if (errors.selectedUserId) {
                setErrors((prev) => ({ ...prev, selectedUserId: '' }));
              }
            }}
            options={users.map((user) => ({
              value: user.id.toString(),
              label: user.nom || user.name,
            }))}
            placeholder="Sélectionner un utilisateur"
            error={errors.selectedUserId}
            disabled={isSending}
            required
          />

          {/* Message initial */}
          <FormTextarea
            id="message"
            name="message"
            label="Message"
            placeholder="Écrivez votre message..."
            value={messageContent}
            onChange={(e) => {
              setMessageContent(e.target.value);
              if (errors.messageContent) {
                setErrors((prev) => ({ ...prev, messageContent: '' }));
              }
            }}
            error={errors.messageContent}
            disabled={isSending}
            rows={4}
            required
          />

          {/* Boutons d'action */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
