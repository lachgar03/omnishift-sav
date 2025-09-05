import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, ticketMessagesApi, ticketAttachmentsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/utils/formatDate'
import { getStatusColor, getPriorityColor, getStatusLabel, getPriorityLabel } from '@/utils/statusUtils'
import { TicketStatus } from '@/types'

export default function TicketDetail() {
  const { id } = useParams({ from: '/tickets/$id' })
  const { isAdmin, isTechnician } = useAuthStore()
  const queryClient = useQueryClient()
  const [messageContent, setMessageContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  // Fetch ticket data
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id)
  })
  
  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: (content: string) => ticketMessagesApi.create(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setMessageContent('')
    }
  })
  
  // Upload attachment mutation
  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => ticketAttachmentsApi.upload(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setFile(null)
    }
  })
  
  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: TicketStatus) => 
      ticketsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    }
  })
  
  if (isLoading) {
    return <div className="loading">Loading ticket details...</div>
  }
  
  if (error || !ticket) {
    return <div className="error">Error loading ticket details</div>
  }
  
  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageContent.trim()) {
      addMessageMutation.mutate(messageContent)
    }
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  
  const handleUploadAttachment = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      uploadAttachmentMutation.mutate(file)
    }
  }
  
  const handleStatusChange = (status: TicketStatus) => {
    updateStatusMutation.mutate(status)
  }
  
  return (
    <div className="ticket-detail">
      <div className="ticket-header">
        <h1>{ticket.title}</h1>
        
        <div className="ticket-meta">
          <span className={`status-badge status-${getStatusColor(ticket.status)}`}>
            {getStatusLabel(ticket.status)}
          </span>
          <span className={`priority-badge priority-${getPriorityColor(ticket.priority)}`}>
            {getPriorityLabel(ticket.priority)}
          </span>
          <span className="ticket-type">{ticket.type}</span>
          <span className="ticket-date">Created: {formatDate(ticket.createdAt)}</span>
        </div>
      </div>
      
      <div className="ticket-body">
        <div className="ticket-description">
          <h3>Description</h3>
          <p>{ticket.description}</p>
        </div>
        
        {(isAdmin || isTechnician) && (
          <div className="ticket-actions">
            <h3>Actions</h3>
            <div className="action-buttons">
              {ticket.status !== TicketStatus.IN_PROGRESS && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
                >
                  Start Working
                </button>
              )}
              
              {ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED && (
                <button 
                  className="btn btn-success"
                  onClick={() => handleStatusChange(TicketStatus.RESOLVED)}
                >
                  Mark Resolved
                </button>
              )}
              
              {ticket.status === TicketStatus.RESOLVED && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleStatusChange(TicketStatus.CLOSED)}
                >
                  Close Ticket
                </button>
              )}
              
              {ticket.status === TicketStatus.CLOSED && (
                <button 
                  className="btn btn-warning"
                  onClick={() => handleStatusChange(TicketStatus.REOPENED)}
                >
                  Reopen Ticket
                </button>
              )}
            </div>
          </div>
        )}
        
        <div className="ticket-messages">
          <h3>Messages</h3>
          {ticket.messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            <div className="message-list">
              {ticket.messages.map(message => (
                <div key={message.id} className="message-item">
                  <div className="message-header">
                    <span className="message-author">User {message.authorId}</span>
                    <span className="message-date">{formatDate(message.createdAt)}</span>
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleAddMessage} className="message-form">
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={addMessageMutation.isPending}
            >
              {addMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
        
        <div className="ticket-attachments">
          <h3>Attachments</h3>
          {ticket.attachments.length === 0 ? (
            <p>No attachments.</p>
          ) : (
            <div className="attachment-list">
              {ticket.attachments.map(attachment => (
                <div key={attachment.id} className="attachment-item">
                  <span className="attachment-name">{attachment.filename}</span>
                  <span className="attachment-date">{formatDate(attachment.uploadedAt)}</span>
                  <a 
                    href={attachment.fileUrl} 
                    className="btn btn-sm btn-secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleUploadAttachment} className="attachment-form">
            <input
              type="file"
              onChange={handleFileChange}
              required
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!file || uploadAttachmentMutation.isPending}
            >
              {uploadAttachmentMutation.isPending ? 'Uploading...' : 'Upload Attachment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


