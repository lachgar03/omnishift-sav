import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Alert, Button, Stack, Text } from '@mantine/core'
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Stack
          gap="md"
          p="xl"
          style={{ minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}
        >
          <Alert icon={<IconAlertCircle size="1rem" />} color="red" title="Something went wrong">
            <Text size="sm" mb="md">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button
              leftSection={<IconRefresh size="1rem" />}
              onClick={() => {
                this.setState({ hasError: false, error: undefined })
                window.location.reload()
              }}
            >
              Reload Page
            </Button>
          </Alert>
        </Stack>
      )
    }

    return this.props.children
  }
}
