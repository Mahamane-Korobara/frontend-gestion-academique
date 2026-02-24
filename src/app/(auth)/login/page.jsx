'use client';

import { useState, useSyncExternalStore } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import useAuth from '@/lib/hooks/useAuth';
import { formatDateTime } from '@/lib/utils/format';
import { APP_NAME } from '@/lib/utils/constants';

// Composants shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function LoginPage() {
  const { login, changePassword, isLoading } = useAuth();

  // État du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // État UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const lastSuccessfulLogin = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {};
      const handler = () => onStoreChange();
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    },
    () => {
      if (typeof window === 'undefined') return '';
      return localStorage.getItem('lastSuccessfulLogin') || '';
    },
    () => ''
  );
  const [forcePasswordModalOpen, setForcePasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showForcedPasswords, setShowForcedPasswords] = useState({
    current: false,
    next: false,
    confirmation: false,
  });

  // Gérer le changement des inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const flattenServerErrors = (serverErrors = {}) => {
    const flat = {};
    Object.entries(serverErrors).forEach(([key, messages]) => {
      flat[key] = Array.isArray(messages) ? messages[0] : messages;
    });
    return flat;
  };

  // Gérer la soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation basique
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email invalide');
      return;
    }

    // Tentative de connexion
    const result = await login(formData);

    if (result.requiresPasswordChange) {
      setPasswordForm({
        email: formData.email,
        current_password: formData.password,
        new_password: '',
        new_password_confirmation: '',
      });
      setShowForcedPasswords({
        current: false,
        next: false,
        confirmation: false,
      });
      setPasswordErrors({});
      setForcePasswordModalOpen(true);
      return;
    }

    if (!result.success) {
      setError(result.message || 'Erreur de connexion');
      setAttemptCount((prev) => prev + 1);
    }
  };

  const handleMandatoryPasswordChange = async (e) => {
    e.preventDefault();

    const localErrors = {};
    if (!passwordForm.current_password) localErrors.current_password = 'Le mot de passe actuel est requis';
    if (!passwordForm.new_password) localErrors.new_password = 'Le nouveau mot de passe est requis';
    else if (passwordForm.new_password.length < 8) localErrors.new_password = 'Minimum 8 caractères';
    if (!passwordForm.new_password_confirmation) {
      localErrors.new_password_confirmation = 'La confirmation est requise';
    } else if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      localErrors.new_password_confirmation = 'La confirmation ne correspond pas';
    }

    if (Object.keys(localErrors).length > 0) {
      setPasswordErrors(localErrors);
      return;
    }

    setIsSubmittingPassword(true);
    setPasswordErrors({});

    const result = await changePassword({
      email: passwordForm.email,
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
      new_password_confirmation: passwordForm.new_password_confirmation,
      password: passwordForm.new_password,
      password_confirmation: passwordForm.new_password_confirmation,
    });

    setIsSubmittingPassword(false);

    if (!result.success) {
      setPasswordErrors(flattenServerErrors(result.errors || {}));
      if (!result.errors) {
        setPasswordErrors({ general: result.message || 'Erreur de changement de mot de passe' });
      }
      return;
    }

    setForcePasswordModalOpen(false);
    setFormData({
      email: passwordForm.email,
      password: passwordForm.new_password,
    });
    setError('');
    setAttemptCount(0);

    await login({
      email: passwordForm.email,
      password: passwordForm.new_password,
    });
  };

  // Calcul des tentatives restantes
  const maxAttempts = 3;
  const remainingAttempts = Math.max(0, maxAttempts - attemptCount);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Accédez à votre tableau de bord de gestion.
          </h1>
          
          {/* Dernière connexion */}
          {lastSuccessfulLogin && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-4">
              <RefreshCw className="w-4 h-4" />
              <span>
                Dernière connexion réussie : <strong>{formatDateTime(lastSuccessfulLogin)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Card shadcn/ui */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre espace
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@universite.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="pr-10"
                    autoComplete="email"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 text-xs h-auto"
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pr-10"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Erreur */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            {/* Sécurité */}
            {attemptCount > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-center font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Sécurité
                </p>
                
                <Alert variant="warning">
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">
                      Tentatives restantes : {remainingAttempts}
                    </p>
                    <p className="text-xs mt-1">
                      Le compte sera verrouillé après 3 échecs consécutifs pour une durée
                      de 30 minutes.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {APP_NAME} © {new Date().getFullYear()}
        </p>
      </div>

      <Dialog open={forcePasswordModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Changement de mot de passe requis</DialogTitle>
            <DialogDescription>
              Vous devez définir un nouveau mot de passe avant d&apos;accéder à la plateforme.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleMandatoryPasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forced-email">Email</Label>
              <Input
                id="forced-email"
                value={passwordForm.email}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_password">Mot de passe actuel</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  name="current_password"
                  type={showForcedPasswords.current ? 'text' : 'password'}
                  value={passwordForm.current_password}
                  onChange={handlePasswordFormChange}
                  disabled={isSubmittingPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() =>
                    setShowForcedPasswords((prev) => ({ ...prev, current: !prev.current }))
                  }
                  disabled={isSubmittingPassword}
                >
                  {showForcedPasswords.current ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordErrors.current_password && (
                <p className="text-xs text-destructive">{passwordErrors.current_password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  name="new_password"
                  type={showForcedPasswords.next ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={handlePasswordFormChange}
                  disabled={isSubmittingPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() =>
                    setShowForcedPasswords((prev) => ({ ...prev, next: !prev.next }))
                  }
                  disabled={isSubmittingPassword}
                >
                  {showForcedPasswords.next ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordErrors.new_password && (
                <p className="text-xs text-destructive">{passwordErrors.new_password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password_confirmation">Confirmer le nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new_password_confirmation"
                  name="new_password_confirmation"
                  type={showForcedPasswords.confirmation ? 'text' : 'password'}
                  value={passwordForm.new_password_confirmation}
                  onChange={handlePasswordFormChange}
                  disabled={isSubmittingPassword}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() =>
                    setShowForcedPasswords((prev) => ({
                      ...prev,
                      confirmation: !prev.confirmation,
                    }))
                  }
                  disabled={isSubmittingPassword}
                >
                  {showForcedPasswords.confirmation ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordErrors.new_password_confirmation && (
                <p className="text-xs text-destructive">{passwordErrors.new_password_confirmation}</p>
              )}
            </div>

            {passwordErrors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordErrors.general}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmittingPassword}>
              {isSubmittingPassword ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
