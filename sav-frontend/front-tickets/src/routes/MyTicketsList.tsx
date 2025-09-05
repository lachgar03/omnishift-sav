import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '@/api'
import { TicketList } from '@/components/TicketList'
import type { TicketResponse } from '@/types'

export default function MyTicketsList() {
  const navigate = useNavigate()
  
  const { data: tickets } = useQuery({
    queryKey: ['myTickets'],
    queryFn: () => ticketsApi.getMyTickets()
  })
  
  const handleTicketClick = (ticket: TicketResponse) => {
    navigate({ to: `/tickets/${ticket.id}` })
  }
  
  return (
    <div className="my-tickets-page">
      <h1>My Tickets</h1>
      
      <TicketList
        title="My Tickets"
        tickets={tickets}
        onTicketClick={handleTicketClick}
        showFilters={true}
        showPagination={false}
      />
    </div>
  )
}


