'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Composant Select réutilisable avec label et gestion d'erreurs
 */
export default function FormSelect({
  label,
  id,
  value = '',
  onValueChange,
  options = [],
  placeholder = 'Sélectionner une option',
  error = '',
  disabled = false,
  required = false,
  getOptionLabel = (option) => option.label || option,
  getOptionValue = (option) => option.value || option,
}) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={error ? 'border-destructive' : ''}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem
              key={`${getOptionValue(option)}-${index}`}
              value={getOptionValue(option).toString()}
            >
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
