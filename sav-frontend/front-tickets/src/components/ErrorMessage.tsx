import React from 'react'
import { Alert, Button, Text } from '@mantine/core'
import { IconAlertCircle, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  variant?: 'error' | 'warning' | 'info'
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  variant = 'error',
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case 'error':
        return { color: 'red', icon: <IconAlertCircle size="1rem" /> }
      case 'warning':
        return { color: 'yellow', icon: <IconAlertTriangle size="1rem" /> }
      case 'info':
        return { color: 'blue', icon: <IconInfoCircle size="1rem" /> }
      default:
        return { color: 'red', icon: <IconAlertCircle size="1rem" /> }
    }
  }

  const { color, icon } = getVariantProps()

  return (
    <Alert color={color} icon={icon} title={variant.charAt(0).toUpperCase() + variant.slice(1)}>
      <Text size="sm" mb={onRetry ? 'md' : 0}>
        {message}
      </Text>
      {onRetry && (
        <Button size="xs" variant="light" color={color} onClick={onRetry}>
          Try again
        </Button>
      )}
    </Alert>
  )
}
