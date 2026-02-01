import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils/cn';

export default function MessageBubble({ message, isOwn, senderName, parseDate }) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className="flex gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-xs lg:max-w-md">
        {!isOwn && (
          <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
            <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-white font-bold text-[10px] sm:text-xs">
              {senderName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "rounded-lg px-3 py-1.5 sm:px-4 sm:py-2",
              isOwn
                ? "bg-blue-600 text-white rounded-br-none"
                : "bg-gray-200 text-gray-900 rounded-bl-none"
            )}
          >
            <p className="text-xs sm:text-sm wrap-break-word">{message.contenu}</p>
          </div>
          <p
            className={cn(
              "text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-gray-500",
              isOwn ? "text-right" : "text-left"
            )}
          >
            {parseDate(message.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
            {isOwn && (message.is_lu ? ' ✓✓' : ' ✓')}
          </p>
        </div>
      </div>
    </div>
  );
}
