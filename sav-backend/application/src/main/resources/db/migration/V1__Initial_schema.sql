-- V1__Create_ticket_tables.sql
-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
                                       id BIGSERIAL PRIMARY KEY,
                                       title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_user_id VARCHAR(255) NOT NULL,
    assigned_team VARCHAR(50),
    assigned_user_id VARCHAR(255),

    CONSTRAINT chk_status CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REOPENED', 'CLOSED')),
    CONSTRAINT chk_type CHECK (type IN ('BUG', 'FEATURE_REQUEST', 'ASSISTANCE', 'INCIDENT', 'RECLAMATION', 'RELANCE')),
    CONSTRAINT chk_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT chk_team CHECK (assigned_team IS NULL OR assigned_team IN ('SUPPORT', 'DEVELOPMENT'))
    );

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
                                               id BIGSERIAL PRIMARY KEY,
                                               content TEXT NOT NULL,
                                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                               author_id VARCHAR(255) NOT NULL,
    ticket_id BIGINT NOT NULL,

    CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    );

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
                                                  id BIGSERIAL PRIMARY KEY,
                                                  filename VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ticket_id BIGINT NOT NULL,

    CONSTRAINT fk_ticket_attachments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_user ON tickets(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON ticket_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);