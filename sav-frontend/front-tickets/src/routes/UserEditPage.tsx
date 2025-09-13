import { useParams } from '@tanstack/react-router'
import { Container, Title, Alert } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

function UserEditPage() {
  const { id } = useParams({ from: '/users/$id/edit' })

  return (
    <Container size="md" py="md">
      <Title order={2} mb="md">
        Edit User
      </Title>

      <Alert icon={<IconInfoCircle size="1rem" />} color="blue" title="Under Development">
        User editing functionality is currently under development.
        <br />
        User ID: {id}
      </Alert>
    </Container>
  )
}

export default UserEditPage
