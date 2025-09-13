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
  Flex,
  Box,
  ScrollArea,
} from '@mantine/core'
import {
  IconDashboard,
  IconSettings,
  IconTicket,
  IconUsers,
  IconChartBar,
  IconLogout,
  IconChevronDown,
} from '@tabler/icons-react'
import { useUiStore } from '@store/uiStore'
import { useAuthStore } from '@store/authStore'
import { logout } from '@/api/authConfig'

export default function PrivateLayout() {
  const open = useUiStore((s) => s.sidebarOpen)
  const toggle = useUiStore((s) => s.toggleSidebar)
  const { user, isAdmin, isTechnician, isUser } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
      // Fallback: clear local auth state
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
  }

  const renderUserNavigation = () => (
    <>
      <NavLink
        component={Link}
        to="/dashboard"
        label="Dashboard"
        leftSection={<IconDashboard size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/tickets/my-tickets"
        label="My Tickets"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/tickets/create"
        label="Create Ticket"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
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
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/workflow/assigned"
        label="Assigned to Me"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/tickets"
        label="All Tickets"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/workflow/unassigned"
        label="Unassigned"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/workflow/priority/high"
        label="High Priority"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/workflow/priority/critical"
        label="Critical Priority"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/users"
        label="Users"
        leftSection={<IconUsers size="1rem" />}
        style={getNavLinkStyles()}
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
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/dashboard"
        label="Dashboard"
        leftSection={<IconDashboard size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/tickets"
        label="All Tickets"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/workflow/assigned"
        label="Assigned Tickets"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/workflow/unassigned"
        label="Unassigned Tickets"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/workflow/priority/high"
        label="High Priority"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/workflow/priority/critical"
        label="Critical Priority"
        leftSection={<IconTicket size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/users"
        label="User Management"
        leftSection={<IconUsers size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/admin/users"
        label="Admin Users"
        leftSection={<IconUsers size="1rem" />}
        style={getNavLinkStyles()}
      />
      <NavLink
        component={Link}
        to="/admin/statistics"
        label="System Statistics"
        leftSection={<IconChartBar size="1rem" />}
        style={getNavLinkStyles()}
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

  const getNavLinkStyles = () => ({
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateX(2px)',
      transition: 'all 0.2s ease',
    },
    '&[dataActive="true"]': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      color: 'white',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
  })

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !open },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex h="100%" px="md" justify="space-between" align="center">
          <Group>
            <Burger opened={open} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg" c="dark">
              SAV System
            </Text>
          </Group>

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
              <Menu.Item component={Link} to="/settings" leftSection={<IconSettings size="1rem" />}>
                Settings
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size="1rem" />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        className="sidebar-navbar"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRight: 'none',
        }}
      >
        <Flex direction="column" h="100%">
          <Text
            size="sm"
            fw={500}
            c="white"
            mb="xs"
            style={{
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Navigation
          </Text>

          <ScrollArea flex={1} scrollbarSize={4}>
            <Stack gap={4}>{renderNavigation()}</Stack>
          </ScrollArea>

          <Box>
            <Divider my="xs" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />
            <NavLink
              component={Link}
              to="/settings"
              label="Settings"
              leftSection={<IconSettings size="1rem" />}
              style={getNavLinkStyles()}
            />
          </Box>
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main>
        <ScrollArea h="100vh" scrollbarSize={4}>
          <Box p="md" h="100%">
            <Outlet />
          </Box>
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  )
}
