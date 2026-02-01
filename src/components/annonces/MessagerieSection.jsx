import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MessagerieSection() {
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-300 h-125 flex flex-col items-center justify-center text-center p-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <Send className="w-8 h-8 text-blue-600 rotate-45" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">Messagerie Interne</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-2">
        Bientôt, vous pourrez discuter directement avec les professeurs et les étudiants depuis cet espace.
      </p>
      <Button className="mt-6" variant="outline">
        Démarrer une conversation
      </Button>
    </div>
  );
}