import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { TextInput, PasswordInput } from '@mantine/core'
import type { TextInputProps } from '@mantine/core'

type Props<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password'
} & Omit<TextInputProps, 'value' | 'onChange'>

export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  ...rest
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
            {...(field as any)}
            {...(rest as any)}
          />
        ) : (
          <TextInput
            label={label}
            placeholder={placeholder}
            error={fieldState.error?.message}
            {...field}
            {...rest}
          />
        )
      }
    />
  )
}
