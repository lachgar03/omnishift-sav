-- V2__Create_user_tables.sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
                                     id VARCHAR(36) PRIMARY KEY, -- Keycloak UUID
    username VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    company VARCHAR(255),
    department VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_role CHECK (role IN ('USER', 'TECHNICIAN', 'ADMIN')),
    CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION'))
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Update tickets table to add foreign key references to users
-- Add columns if they don't exist (for existing tickets table)
DO $$
BEGIN
    -- Add created_by_user foreign key constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_tickets_created_by_user') THEN
ALTER TABLE tickets
    ADD CONSTRAINT fk_tickets_created_by_user
        FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
END IF;

    -- Add assigned_user foreign key constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_tickets_assigned_user') THEN
ALTER TABLE tickets
    ADD CONSTRAINT fk_tickets_assigned_user
        FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL;
END IF;
END $$;

-- Update ticket_messages table to add foreign key reference
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE constraint_name = 'fk_ticket_messages_author') THEN
ALTER TABLE ticket_messages
    ADD CONSTRAINT fk_ticket_messages_author
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;
END IF;
END $$;

-- Create sample admin user (optional - you can remove this if you prefer to create users via Keycloak)
INSERT INTO users (id, username, first_name, last_name, email, role, status, created_at, updated_at)
VALUES
    ('admin-sample-uuid-123456789', 'admin', 'System', 'Administrator', 'admin@sav.com', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING;

-- Create sample technician user
INSERT INTO users (id, username, first_name, last_name, email, role, status, company, department, created_at, updated_at)
VALUES
    ('tech-sample-uuid-123456789', 'technician1', 'John', 'Tech', 'tech@sav.com', 'TECHNICIAN', 'ACTIVE', 'SAV Company', 'IT Support', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING;