'use client';

import { LogOut, Settings, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useAuth from '@/lib/hooks/useAuth';
import useUIStore from '@/lib/store/uiStore';

/**
 * Header réutilisable
 * @param {string} title - Titre de la page
 * @param {string} description - Description de la page
 * @param {React.ReactNode} actions - Actions supplémentaires (optionnel)
 */
export default function Header({ 
  title = 'Vue d\'ensemble',
  description = 'Bienvenue sur le tableau de bord',
  actions = null
}) {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    await logout();
  };

  // Initiales de l'utilisateur
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-30 w-full h-20 flex items-center justify-between px-6 lg:px-8 border-b bg-white/80 backdrop-blur-md">
      {/* Gauche : Menu mobile + Titre */}
      <div className="flex items-center gap-6 flex-1">
        {/* Menu burger (mobile) */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Titre de la page (dynamique) */}
        <div className="hidden lg:block py-2">
          <h1 className="font-bold text-xl">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Centre : Actions supplémentaires */}
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}

      {/* Droite : Menu utilisateur */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}