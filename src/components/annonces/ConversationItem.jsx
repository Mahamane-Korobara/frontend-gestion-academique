import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';

export default function ConversationItem({ 
  conversation, 
  lastMessage, 
  unreadCount, 
  isSelected, 
  currentUserId,
  onClick,
  parseDate 
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 sm:p-3 cursor-pointer transition-colors",
        isSelected ? "bg-blue-50" : "hover:bg-gray-100 active:bg-gray-100"
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
          <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-white font-bold text-sm sm:text-base">
            {conversation.user.nom.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
            {conversation.user.nom}
          </h3>
          {lastMessage && (
            <>
              <p className="text-xs text-gray-500 truncate">
                {lastMessage.expediteur.id === currentUserId ? 'Vous: ' : ''}
                {lastMessage.contenu}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400">
                {parseDate(lastMessage.created_at).toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </>
          )}
        </div>

        {unreadCount > 0 && (
          <Badge 
            variant="default" 
            className="bg-blue-600 h-4 sm:h-5 min-w-4 sm:min-w-5 text-[10px] sm:text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
}