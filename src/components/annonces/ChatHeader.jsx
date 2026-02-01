import { ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function ChatHeader({ conversation, onBack }) {
  // Normaliser le nom de l'utilisateur (peut être 'nom' ou 'name')
  const userName = conversation?.user?.nom || conversation?.user?.name || 'Utilisateur';
  const userRole = conversation?.user?.role?.display_name || '';

  return (
    <div className="p-3 sm:p-4 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Button
          size="sm"
          variant="ghost"
          className="md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
          <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-white font-bold text-sm sm:text-base">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {userName}
          </h3>
          {userRole && (
            <p className="text-[10px] sm:text-xs text-gray-500 truncate">
              {userRole}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}