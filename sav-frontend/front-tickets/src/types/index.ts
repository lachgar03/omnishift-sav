// Enums from the guide
export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REOPENED = 'REOPENED',
  CLOSED = 'CLOSED'
}

export enum TicketType {
  BUG = 'BUG',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  ASSISTANCE = 'ASSISTANCE',
  INCIDENT = 'INCIDENT',
  RECLAMATION = 'RECLAMATION',
  RELANCE = 'RELANCE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum Team {
  SUPPORT = 'SUPPORT',
  DEVELOPMENT = 'DEVELOPMENT'
}

export enum UserRole {
  USER = 'USER',
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION'
}

// User interfaces
export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  company?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  company?: string;
  department?: string;
}

export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  company?: string;
  department?: string;
  email?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

// Ticket interfaces
export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  type: TicketType;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  assignedTeam?: Team;
  assignedUserId?: string;
  messages: TicketMessageResponse[];
  attachments: TicketAttachmentResponse[];
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  type: TicketType;
  priority: Priority;
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: Priority;
  assignedTeam?: Team;
  assignedUserId?: string;
}

export interface TicketFilterRequest {
  status?: TicketStatus;
  priority?: Priority;
  assignedUserId?: string;
  createdByUserId?: string;
  searchTerm?: string;
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
}

// Ticket Message interfaces
export interface TicketMessageResponse {
  id: number;
  content: string;
  createdAt: string;
  authorId: string;
}

export interface CreateTicketMessageRequest {
  content: string;
}

// Ticket Attachment interfaces
export interface TicketAttachmentResponse {
  id: number;
  filename: string;
  fileUrl: string;
  uploadedAt: string;
}

// Pagination interface
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// Auth interfaces
export interface AuthUser {
  id: string;
  username: string;
  email?: string;        // Made optional
  firstName?: string;    // Made optional
  lastName?: string;     // Made optional
  fullName?: string;     // Made optional
  roles: UserRole[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// Dashboard interfaces
export interface DashboardResponse {
  myTicketsCount: number;
  assignedToMeCount: number;
  myOpenTickets: number;
  myInProgressTickets: number;
  recentTickets: TicketResponse[];
  globalStats?: TicketStatsResponse;
  urgentTickets?: TicketResponse[];
  unassignedTickets?: TicketResponse[];
}

export interface TicketStatsResponse {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  assignedTickets: number;
  resolvedTickets: number;
  reopenedTickets: number;
  closedTickets: number;
  activeTickets: number;
  completionRate: number;
}

// Error interface
export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: string;
}
