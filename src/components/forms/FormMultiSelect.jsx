'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Composant Select pour les filtres avec shadcn/ui
 */
export default function FormMultiSelect({
  id,
  value = '',
  onValueChange,
  options = [],
  placeholder = 'Sélectionner une option',
  disabled = false,
  getOptionLabel = (option) => option.label || option,
  getOptionValue = (option) => option.value || option,
  className = '',
}) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={className}>
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
  );
}
