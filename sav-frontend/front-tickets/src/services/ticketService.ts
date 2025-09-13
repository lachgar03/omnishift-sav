import { apiClient } from './apiClient'
import type {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  PaginatedResponse,
  TicketStatistics,
} from '../types/api'

export class TicketService {
  async createTicket(request: CreateTicketRequest): Promise<Ticket> {
    return apiClient.post<Ticket>('/tickets', request)
  }

  async getTickets(page: number = 0, size: number = 20): Promise<PaginatedResponse<Ticket>> {
    return apiClient.get<PaginatedResponse<Ticket>>(`/tickets?page=${page}&size=${size}`)
  }

  async getMyTickets(page: number = 0, size: number = 20): Promise<PaginatedResponse<Ticket>> {
    return apiClient.get<PaginatedResponse<Ticket>>(`/tickets/my-tickets?page=${page}&size=${size}`)
  }

  async getTicket(id: number): Promise<Ticket> {
    return apiClient.get<Ticket>(`/tickets/${id}`)
  }

  async updateTicket(id: number, request: UpdateTicketRequest): Promise<Ticket> {
    return apiClient.put<Ticket>(`/tickets/${id}`, request)
  }

  async updateMyTicket(id: number, title: string, description: string): Promise<Ticket> {
    return apiClient.put<Ticket>(`/tickets/${id}/my`, { title, description })
  }

  async assignTicketToTeam(id: number, team: string): Promise<Ticket> {
    return apiClient.put<Ticket>(`/tickets/${id}/assign-team`, { team })
  }

  async assignTicketToUser(id: number, userId: string): Promise<Ticket> {
    return apiClient.put<Ticket>(`/tickets/${id}/assign-user`, { userId })
  }

  async closeTicket(id: number): Promise<Ticket> {
    return apiClient.put<Ticket>(`/tickets/${id}/close`)
  }

  async reopenTicket(id: number): Promise<Ticket> {
    return apiClient.put<Ticket>(`/tickets/${id}/reopen`)
  }

  async getTicketStatistics(): Promise<TicketStatistics> {
    return apiClient.get('/tickets/statistics')
  }
}

export const ticketService = new TicketService()
