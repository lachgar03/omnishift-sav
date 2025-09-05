import { useAuthStore } from '@/store/authStore'
import { Link } from '@tanstack/react-router'

export const Navigation = () => {
  const {  isUser, isTechnician, isAdmin } = useAuthStore()

  const renderUserNavigation = () => (
    <>
      <Link to="/dashboard" className="nav-link">
        Dashboard
      </Link>
      <Link to="/tickets/my-tickets" className="nav-link">
        My Tickets
      </Link>
      <Link to="/tickets" className="nav-link">
        Create Ticket
      </Link>
      <Link to="/settings" className="nav-link">
        Profile Settings
      </Link>
    </>
  )

  const renderTechnicianNavigation = () => (
    <>
      <Link to="/dashboard" className="nav-link">
        Dashboard
      </Link>
      <Link to="/workflow/assigned" className="nav-link">
        Assigned to Me
      </Link>
      <Link to="/tickets" className="nav-link">
        All Tickets
      </Link>
      <Link to="/workflow/unassigned" className="nav-link">
        Unassigned
      </Link>
      <Link to="/workflow/priority/high" className="nav-link">
        High Priority
      </Link>
      <Link to="/workflow/priority/critical" className="nav-link">
        Critical Priority
      </Link>
      <Link to="/users" className="nav-link">
        Users
      </Link>
      <Link to="/tickets/my-tickets" className="nav-link">
        My Tickets
      </Link>
      <Link to="/settings" className="nav-link">
        Profile Settings
      </Link>
    </>
  )

  const renderAdminNavigation = () => (
    <>
      <Link to="/admin/dashboard" className="nav-link">
        Admin Dashboard
      </Link>
      <Link to="/dashboard" className="nav-link">
        Dashboard
      </Link>
      <Link to="/tickets" className="nav-link">
        All Tickets
      </Link>
      <Link to="/workflow/assigned" className="nav-link">
        Assigned Tickets
      </Link>
      <Link to="/workflow/unassigned" className="nav-link">
        Unassigned Tickets
      </Link>
      <Link to="/workflow/priority/high" className="nav-link">
        High Priority
      </Link>
      <Link to="/workflow/priority/critical" className="nav-link">
        Critical Priority
      </Link>
      <Link to="/users" className="nav-link">
        User Management
      </Link>
      <Link to="/admin/users" className="nav-link">
        Admin Users
      </Link>
      <Link to="/admin/statistics" className="nav-link">
        System Statistics
      </Link>
      <Link to="/admin/settings" className="nav-link">
        System Settings
      </Link>
      <Link to="/settings" className="nav-link">
        Profile Settings
      </Link>
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

  return (
    <nav className="main-navigation">
      <div className="nav-brand">
        <Link to="/dashboard" className="brand-link">
          SAV System
        </Link>
      </div>
      
      <div className="nav-menu">
        {renderNavigation()}
      </div>
      
      <div className="nav-user">
        <span className="user-roles">
          {isAdmin ? "Admin" : isTechnician ? "Technician" : isUser ? "User" : "Guest"}
        </span>
      </div>
    </nav>
  )
}
