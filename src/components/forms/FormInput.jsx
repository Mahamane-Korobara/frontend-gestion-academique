'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Composant Input réutilisable avec label et gestion d'erreurs
 */
export default function FormInput({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  error = '',
  disabled = false,
  required = false,
  maxLength = undefined,
  pattern = undefined,
  autoComplete = undefined,
  className = '',
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        maxLength={maxLength}
        pattern={pattern}
        autoComplete={autoComplete}
        className={`${error ? 'border-destructive' : ''} ${className}`}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
