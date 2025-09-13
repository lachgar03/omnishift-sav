export const API_BASE_URL = 'http://localhost:8081/api'
export const KEYCLOAK_URL = 'http://localhost:8180'
export const KEYCLOAK_REALM = 'sav-realm'
export const KEYCLOAK_CLIENT_ID = 'sav-backend'

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

  // User Sync Endpoints
  USERS_SYNC_TOKEN_INFO: '/users/sync/token-info',
  USERS_SYNC_USER_INFO: '/users/sync/user-info',
  USERS_SYNC_FORCE_SYNC: '/users/sync/force-sync',
  USERS_SYNC_EXISTS: '/users/sync/exists',
  USERS_SYNC_CREATE_MINIMAL: '/users/sync/create-minimal',

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
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const
