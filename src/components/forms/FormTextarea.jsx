'use client';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

/**
 * Composant Textarea réutilisable avec label et gestion d'erreurs
 */
export default function FormTextarea({
  label,
  id,
  name,
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  error = '',
  disabled = false,
  required = false,
  rows = 3,
  maxLength = undefined,
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
      <Textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`${error ? 'border-destructive' : ''} ${className}`}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {maxLength && (
        <p className="text-xs text-gray-500">
          {value.length}/{maxLength} caractères
        </p>
      )}
    </div>
  );
}
