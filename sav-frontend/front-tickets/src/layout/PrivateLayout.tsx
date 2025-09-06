import { Link, Outlet } from '@tanstack/react-router'
import { 
  AppShell, 
  Burger, 
  Group, 
  Text, 
  NavLink, 
  Stack, 
  Divider,
  Avatar,
  Menu,
  Button,
  ActionIcon
} from '@mantine/core'
import { 
  IconDashboard, 
  IconSettings, 
  IconTicket, 
  IconUsers, 
  IconChartBar,
  IconLogout,
  IconUser,
  IconChevronDown
} from '@tabler/icons-react'
import { useUiStore } from '@store/uiStore'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'

export default function PrivateLayout() {
  const open = useUiStore((s) => s.sidebarOpen)
  const toggle = useUiStore((s) => s.toggleSidebar)
  const { user, isAdmin, isTechnician, isUser, logout } = useAuthStore()

  const renderUserNavigation = () => (
    <>
      <NavLink
        component={Link}
        to="/dashboard"
        label="Dashboard"
        leftSection={<IconDashboard size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/tickets/my-tickets"
        label="My Tickets"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/tickets"
        label="Create Ticket"
        leftSection={<IconTicket size="1rem" />}
      />
    </>
  )

  const renderTechnicianNavigation = () => (
    <>
      <NavLink
        component={Link}
        to="/dashboard"
        label="Dashboard"
        leftSection={<IconDashboard size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/workflow/assigned"
        label="Assigned to Me"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/tickets"
        label="All Tickets"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/workflow/unassigned"
        label="Unassigned"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/workflow/priority/high"
        label="High Priority"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/workflow/priority/critical"
        label="Critical Priority"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/users"
        label="Users"
        leftSection={<IconUsers size="1rem" />}
      />
    </>
  )

  const renderAdminNavigation = () => (
    <>
      <NavLink
        component={Link}
        to="/admin/dashboard"
        label="Admin Dashboard"
        leftSection={<IconChartBar size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/dashboard"
        label="Dashboard"
        leftSection={<IconDashboard size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/tickets"
        label="All Tickets"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/workflow/assigned"
        label="Assigned Tickets"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/workflow/unassigned"
        label="Unassigned Tickets"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/workflow/priority/high"
        label="High Priority"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/workflow/priority/critical"
        label="Critical Priority"
        leftSection={<IconTicket size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/users"
        label="User Management"
        leftSection={<IconUsers size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/admin/users"
        label="Admin Users"
        leftSection={<IconUsers size="1rem" />}
      />
      <NavLink
        component={Link}
        to="/admin/statistics"
        label="System Statistics"
        leftSection={<IconChartBar size="1rem" />}
      />
    </>
  )

  const renderNavigation = () => {
    if (isAdmin) {
      return renderAdminNavigation()
    } else if (isTechnician) {
      return renderTechnicianNavigation()
    } else if (isUser) {
      return renderUserNavigation()
    }
    return null
  }

  const getUserRoleText = () => {
    if (isAdmin) return 'Admin'
    if (isTechnician) return 'Technician'
    if (isUser) return 'User'
    return 'Guest'
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !open } }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={open} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg">SAV System</Text>
          </Group>
          <Group gap="md">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button variant="subtle" rightSection={<IconChevronDown size="1rem" />}>
                  <Group gap="xs">
                    <Avatar size="sm" color="blue">
                      {user?.firstName?.[0] || 'U'}
                    </Avatar>
                    <Text size="sm">{user?.firstName || 'User'}</Text>
                  </Group>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{getUserRoleText()}</Menu.Label>
                <Menu.Item
                  component={Link}
                  to="/settings"
                  leftSection={<IconSettings size="1rem" />}
                >
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size="1rem" />}
                  onClick={logout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="sm" fw={500} c="dimmed" mb="xs">
            Navigation
          </Text>
          {renderNavigation()}
          <Divider my="xs" />
          <NavLink
            component={Link}
            to="/settings"
            label="Settings"
            leftSection={<IconSettings size="1rem" />}
          />
        </Stack>
      </AppShell.Navbar>
      
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
