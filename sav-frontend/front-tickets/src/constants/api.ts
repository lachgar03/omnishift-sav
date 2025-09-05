export const API_BASE_URL = 'http://localhost:8081/api'
export const KEYCLOAK_URL = 'http://localhost:8081'
export const KEYCLOAK_REALM = 'sav-realm'
export const KEYCLOAK_CLIENT_ID = 'sav-frontend'

export const API_ENDPOINTS = {
  // Auth
  DEBUG_TOKEN: '/debug/token-info',
  
  // Users
  USERS_ME: '/users/me',
  USERS: '/users',
  USERS_TECHNICIANS: '/users/technicians',
  USERS_BY_ROLE: '/users/role',
  USERS_BY_STATUS: '/users/status',
  USERS_SEARCH: '/users/search',
  USERS_STATISTICS: '/users/statistics',
  
  // Tickets
  TICKETS: '/tickets',
  TICKETS_MY: '/tickets/my-tickets',
  TICKETS_ASSIGNED: '/tickets/assigned-to-me',
  TICKETS_DASHBOARD: '/tickets/dashboard',
  TICKETS_BY_STATUS: '/tickets/status',
  TICKETS_BY_PRIORITY: '/tickets/priority',
  TICKETS_BY_TEAM: '/tickets/team',
  TICKETS_STATISTICS: '/tickets/statistics',
  
  // Ticket Messages
  TICKET_MESSAGES: '/tickets/{ticketId}/messages',
  
  // Ticket Attachments
  TICKET_ATTACHMENTS: '/tickets/{ticketId}/attachments',
  TICKET_ATTACHMENTS_DOWNLOAD: '/tickets/{ticketId}/attachments/{attachmentId}/download',
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const


