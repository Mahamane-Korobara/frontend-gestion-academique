import { Send } from 'lucide-react';

function EmptyState({ message }) {
  return (
    <div className="flex items-center justify-center h-full p-4 text-center text-gray-500 text-sm">
      {message}
    </div>
  );
}

// Composant EmptyConversationState
function EmptyConversationState() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center text-gray-500">
        <Send className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-20" />
        <p className="font-medium text-sm sm:text-base">
          Sélectionnez une conversation pour commencer
        </p>
      </div>
    </div>
  );
}
export { EmptyState, EmptyConversationState };