import {
  Button,
  Stack,
  Title,
  Paper,
  Container,
  Center,
  Text,
  Group,
  ThemeIcon,
} from '@mantine/core'
import { IconTicket } from '@tabler/icons-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FormInput } from '@components/ui/FormInput'
import { login } from '../../api'
import { useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../../store/authStore'
import { useEffect } from 'react'

type LoginFormValues = {
  email: string
  password: string
}

const schema: yup.ObjectSchema<LoginFormValues> = yup.object({
  email: yup.string().required('Email is required'),
  password: yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
})

function LoginPage() {
  console.log('LoginPage rendering')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async () => {
    try {
      // Keycloak login will redirect to Keycloak's login page
      // After successful authentication, Keycloak will redirect back to the app
      // The authentication state will be updated automatically
      await login(window.location.origin + '/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <Container size="xs" style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Center style={{ width: '100%' }}>
        <Paper shadow="xl" p="xl" radius="md" style={{ width: '100%', maxWidth: 400 }}>
          <Stack>
            <Group justify="center" mb="md">
              <ThemeIcon
                size="xl"
                radius="xl"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
              >
                <IconTicket size={32} />
              </ThemeIcon>
            </Group>
            <Title order={2} ta="center" mb="xs" c="blue">
              Welcome Back
            </Title>
            <Text ta="center" c="dimmed" size="sm" mb="lg">
              Sign in to your SAV Support account
            </Text>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="md">
                <FormInput
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="Enter your email"
                  type="text"
                />
                <FormInput
                  control={control}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                />
                <Button type="submit" loading={isSubmitting} fullWidth size="md" mt="md">
                  Sign in
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Center>
    </Container>
  )
}

export default LoginPage
