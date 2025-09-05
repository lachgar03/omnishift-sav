import { axiosInstance } from './axiosInstance'
import { API_ENDPOINTS } from '@/constants/api'
import type { 
  TicketResponse, 
  CreateTicketRequest, 
  UpdateTicketRequest,
  TicketFilterRequest,
  PageResponse,
  TicketMessageResponse,
  CreateTicketMessageRequest,
  TicketAttachmentResponse
} from '@/types'

// Create API objects for tickets and related resources
export const ticketsApi = {
  // Main ticket operations
  getAll: async (params: TicketFilterRequest): Promise<PageResponse<TicketResponse>> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TICKETS, { params })
    return data
  },
  
  getById: async (id: string | number): Promise<TicketResponse> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.TICKETS}/${id}`)
    return data
  },
  
  getMyTickets: async (): Promise<TicketResponse[]> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TICKETS_MY)
    return data
  },
  
  getAssignedToMe: async (): Promise<TicketResponse[]> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TICKETS_ASSIGNED)
    return data
  },
  
  getDashboard: async (): Promise<any> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TICKETS_DASHBOARD)
    return data
  },
  
  create: async (ticket: CreateTicketRequest): Promise<TicketResponse> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.TICKETS, ticket)
    return data
  },
  
  update: async (id: string | number, ticket: UpdateTicketRequest): Promise<TicketResponse> => {
    const { data } = await axiosInstance.put(`${API_ENDPOINTS.TICKETS}/${id}`, ticket)
    return data
  },
  
  getByStatus: async (status: string): Promise<TicketResponse[]> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.TICKETS_BY_STATUS}/${status}`)
    return data
  },
  
  getByPriority: async (priority: string): Promise<TicketResponse[]> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.TICKETS_BY_PRIORITY}/${priority}`)
    return data
  },
  
  getByTeam: async (team: string): Promise<TicketResponse[]> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.TICKETS_BY_TEAM}/${team}`)
    return data
  },
  
  getStatistics: async (): Promise<any> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.TICKETS_STATISTICS)
    return data
  },
  
  assignTeam: async (id: string | number, team: string): Promise<TicketResponse> => {
    const { data } = await axiosInstance.patch(`${API_ENDPOINTS.TICKETS}/${id}/assign-team`, { team })
    return data
  },
  
  assignUser: async (id: string | number, userId: string): Promise<TicketResponse> => {
    const { data } = await axiosInstance.patch(`${API_ENDPOINTS.TICKETS}/${id}/assign-user`, { userId })
    return data
  },
  
  close: async (id: string | number): Promise<TicketResponse> => {
    const { data } = await axiosInstance.patch(`${API_ENDPOINTS.TICKETS}/${id}/close`, {})
    return data
  },
  
  reopen: async (id: string | number): Promise<TicketResponse> => {
    const { data } = await axiosInstance.patch(`${API_ENDPOINTS.TICKETS}/${id}/reopen`, {})
    return data
  }
}

// Ticket messages API
export const ticketMessagesApi = {
  getAll: async (ticketId: string | number): Promise<TicketMessageResponse[]> => {
    const url = API_ENDPOINTS.TICKET_MESSAGES.replace('{ticketId}', String(ticketId))
    const { data } = await axiosInstance.get(url)
    return data
  },
  
  create: async (ticketId: string | number, message: CreateTicketMessageRequest): Promise<TicketMessageResponse> => {
    const url = API_ENDPOINTS.TICKET_MESSAGES.replace('{ticketId}', String(ticketId))
    const { data } = await axiosInstance.post(url, message)
    return data
  },
  
  delete: async (ticketId: string | number, messageId: string | number): Promise<void> => {
    const url = `${API_ENDPOINTS.TICKET_MESSAGES.replace('{ticketId}', String(ticketId))}/${messageId}`
    await axiosInstance.delete(url)
  }
}

// Ticket attachments API
export const ticketAttachmentsApi = {
  getAll: async (ticketId: string | number): Promise<TicketAttachmentResponse[]> => {
    const url = API_ENDPOINTS.TICKET_ATTACHMENTS.replace('{ticketId}', String(ticketId))
    const { data } = await axiosInstance.get(url)
    return data
  },
  
  upload: async (ticketId: string | number, file: File): Promise<TicketAttachmentResponse> => {
    const url = API_ENDPOINTS.TICKET_ATTACHMENTS.replace('{ticketId}', String(ticketId))
    const formData = new FormData()
    formData.append('file', file)
    
    const { data } = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  },
  
  download: async (ticketId: string | number, attachmentId: string | number): Promise<Blob> => {
    const url = API_ENDPOINTS.TICKET_ATTACHMENTS_DOWNLOAD
      .replace('{ticketId}', String(ticketId))
      .replace('{attachmentId}', String(attachmentId))
    
    const { data } = await axiosInstance.get(url, {
      responseType: 'blob'
    })
    return data
  },
  
  delete: async (ticketId: string | number, attachmentId: string | number): Promise<void> => {
    const url = `${API_ENDPOINTS.TICKET_ATTACHMENTS.replace('{ticketId}', String(ticketId))}/${attachmentId}`
    await axiosInstance.delete(url)
  }
}


