import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { TextInput, PasswordInput } from '@mantine/core'

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password'
  [key: string]: unknown
}

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
}: Props<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) =>
        type === 'password' ? (
          <PasswordInput
            label={label}
            placeholder={placeholder}
            error={fieldState.error?.message}
            size="md"
            radius="md"
            {...field}
          />
        ) : (
          <TextInput
            label={label}
            placeholder={placeholder}
            error={fieldState.error?.message}
            size="md"
            radius="md"
            {...field}
          />
        )
      }
    />
  )
}
