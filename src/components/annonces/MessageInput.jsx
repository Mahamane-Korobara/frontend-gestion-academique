import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';


export default function MessageInput({ value, onChange, onSubmit, disabled }) {
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    onChange(e.target.value);
    // Auto-expand textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-2 sm:p-4">
      <div className="flex gap-2 sm:gap-3 items-end">
        <Textarea
          ref={textareaRef}
          placeholder="Écrivez un message..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 resize-none max-h-30 no-scrollbar"
          rows={1}
          style={{ minHeight: '36px' }}
        />
        <Button
          type="submit"
          disabled={!value.trim() || disabled}
          className="h-9 w-9 sm:h-10 sm:w-10 p-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2 hidden sm:block">
        Shift + Entrée pour une nouvelle ligne
      </p>
    </form>
  );
}
