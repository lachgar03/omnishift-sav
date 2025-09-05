import { Link, Outlet } from '@tanstack/react-router'
import { AppShell, Burger, Group, Text } from '@mantine/core'
import { useUiStore } from '@store/uiStore'

export default function PrivateLayout() {
  const open = useUiStore((s) => s.sidebarOpen)
  const toggle = useUiStore((s) => s.toggleSidebar)
  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !open } }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={open} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={600}>App</Text>
          </Group>
          <Group gap="md">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/settings">Settings</Link>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md"></AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
