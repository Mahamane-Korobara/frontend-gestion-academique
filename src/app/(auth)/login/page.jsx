'use client';

import { useState, useEffect } from 'react';
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

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  // État du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // État UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastSuccessfulLogin, setLastSuccessfulLogin] = useState('');

  // Charger la dernière connexion réussie
  useEffect(() => {
    const savedLastLogin = localStorage.getItem('lastSuccessfulLogin');
    if (savedLastLogin) {
      setLastSuccessfulLogin(savedLastLogin);
    }
  }, []);

  // Gérer le changement des inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
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

    if (!result.success) {
      setError(result.message || 'Erreur de connexion');
      setAttemptCount((prev) => prev + 1);
    }
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
    </div>
  );
}