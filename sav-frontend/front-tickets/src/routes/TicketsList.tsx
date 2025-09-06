import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ticketsApi } from '@/api'
import { TicketList } from '@/components/TicketList'
import type { TicketResponse } from '@/types'

export default function TicketsList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { data } = useQuery({
    queryKey: ['tickets', page, pageSize],
    queryFn: () =>
      ticketsApi.getAll({
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      }),
  })

  const handleTicketClick = (ticket: TicketResponse) => {
    navigate({ to: `/tickets/${ticket.id}` })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
  }

  return (
    <div className="tickets-list-page">
      <h1>All Tickets</h1>

      <TicketList
        title="Tickets"
        tickets={data?.content}
        onTicketClick={handleTicketClick}
        showFilters={true}
        showPagination={true}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  )
}
