'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/**
 * Composant Checkbox réutilisable avec label
 */
export default function FormCheckbox({
  id,
  label,
  checked = false,
  onChange,
  disabled = false,
  error = '',
  className = '',
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
        {label && (
          <Label
            htmlFor={id}
            className="font-normal cursor-pointer"
          >
            {label}
          </Label>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
