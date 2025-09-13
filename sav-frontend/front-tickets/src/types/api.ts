export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  company?: string
  department?: string
  role: UserRole
  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: number
  title: string
  description: string
  status: TicketStatus
  type: TicketType
  priority: Priority
  assignedTeam?: Team
  assignedUserId?: string
  createdByUserId: string
  createdAt: string
  updatedAt: string
  messages?: TicketMessage[]
  attachments?: TicketAttachment[]
}

export interface TicketMessage {
  id: number
  content: string
  createdByUserId: string
  authorId: string
  createdAt: string
}

export interface TicketAttachment {
  id: number
  filename: string
  fileUrl: string
  uploadedAt: string
}

export enum UserRole {
  USER = 'USER',
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REOPENED = 'REOPENED',
  CLOSED = 'CLOSED',
}

export enum TicketType {
  BUG = 'BUG',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  ASSISTANCE = 'ASSISTANCE',
  INCIDENT = 'INCIDENT',
  RECLAMATION = 'RECLAMATION',
  RELANCE = 'RELANCE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum Team {
  SUPPORT = 'SUPPORT',
  DEVELOPMENT = 'DEVELOPMENT',
}

// API Request/Response types
export interface CreateTicketRequest {
  title: string
  description: string
  type: TicketType
  priority: Priority
}

export interface UpdateTicketRequest {
  title?: string
  description?: string
  status?: TicketStatus
  priority?: Priority
  assignedTeam?: Team
  assignedUserId?: string
}

export interface CreateUserRequest {
  username: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
}

export interface UpdateUserProfileRequest {
  firstName: string
  lastName: string
  phoneNumber?: string
  company?: string
  department?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  validationErrors?: Record<string, string>
}

export interface TicketStatistics {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  assignedTickets: number
  closedTickets: number
  highPriorityTickets?: number
  criticalPriorityTickets?: number
  averageResolutionTime?: number
}

export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  technicians: number
  admins: number
  recentRegistrations?: number
}

export interface KeycloakUserInfo {
  sub: string
  preferred_username: string
  email: string
  given_name?: string
  family_name?: string
  name?: string
}
