// User Roles
export const UserRole = {
  USER: 'USER',
  TECHNICIAN: 'TECHNICIAN',
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// User Status
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  PENDING_ACTIVATION: 'PENDING_ACTIVATION'
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// Ticket Status
export const TicketStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REOPENED: 'REOPENED',
  CLOSED: 'CLOSED'
} as const;

export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

// Ticket Type
export const TicketType = {
  BUG: 'BUG',
  FEATURE_REQUEST: 'FEATURE_REQUEST',
  ASSISTANCE: 'ASSISTANCE',
  INCIDENT: 'INCIDENT',
  RECLAMATION: 'RECLAMATION',
  RELANCE: 'RELANCE'
} as const;

export type TicketType = typeof TicketType[keyof typeof TicketType];

// Priority
export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export type Priority = typeof Priority[keyof typeof Priority];

// Team
export const Team = {
  SUPPORT: 'SUPPORT',
  DEVELOPMENT: 'DEVELOPMENT'
} as const;

export type Team = typeof Team[keyof typeof Team];


