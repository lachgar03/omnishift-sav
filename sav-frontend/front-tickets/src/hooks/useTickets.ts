import { useState, useEffect, useCallback } from 'react'
import { ticketService } from '../services/ticketService'
import type { Ticket, CreateTicketRequest, UpdateTicketRequest } from '../types/api'

export const useTickets = (page: number = 0, size: number = 20) => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ticketService.getTickets(page, size)
      setTickets(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }, [page, size])

  const createTicket = useCallback(async (request: CreateTicketRequest) => {
    try {
      setLoading(true)
      setError(null)
      const newTicket = await ticketService.createTicket(request)
      setTickets((prev) => [newTicket, ...prev])
      return newTicket
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateTicket = useCallback(async (id: number, request: UpdateTicketRequest) => {
    try {
      setLoading(true)
      setError(null)
      const updatedTicket = await ticketService.updateTicket(id, request)
      setTickets((prev) => prev.map((ticket) => (ticket.id === id ? updatedTicket : ticket)))
      return updatedTicket
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return {
    tickets,
    loading,
    error,
    totalPages,
    totalElements,
    fetchTickets,
    createTicket,
    updateTicket,
  }
}
