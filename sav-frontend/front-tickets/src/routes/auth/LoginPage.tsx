import { Button, Stack, Title } from '@mantine/core'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FormInput } from '@components/ui/FormInput'
import { login } from '../../api'

type LoginFormValues = {
  email: string
  password: string
}

const schema: yup.ObjectSchema<LoginFormValues> = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
})

export default function LoginPage() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async () => {
    await login()
  }

  return (
    <Stack maw={400} mx="auto" mt="xl">
      <Title order={2}>Login</Title>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <FormInput
            control={control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            type="email"
          />
          <FormInput
            control={control}
            name="password"
            label="Password"
            placeholder="Your password"
            type="password"
          />
          <Button type="submit" loading={isSubmitting}>
            Sign in
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}
