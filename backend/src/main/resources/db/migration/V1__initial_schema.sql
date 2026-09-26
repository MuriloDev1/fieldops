-- =============================================================================
-- FIELDOPS - SCHEMA DO BANCO DE DADOS CENTRAL (PostgreSQL 16)
-- Em total conformidade com a Seção 10 (Modelo de Dados) e Seção 12 (API REST)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 10.6 Usuários e Responsabilidades
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, SUPERVISOR, TECHNICIAN, CLIENT_VIEWER
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, BLOCKED
    phone VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- 10.5.1 Clientes (Empresas parceiras e contratantes)
-- Compatível com a tela ClientsPage do Front-end Web
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- Nome de exibição / Fantasia
    legal_name VARCHAR(255),    -- Razão Social
    document VARCHAR(50),       -- CNPJ ou CPF
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- -----------------------------------------------------------------------------
-- 10.5.2 Locais / Plantas Operacionais
-- Compatível com LocationsPage do Front-end Web
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL, -- Nome da Planta / Local
    description TEXT,
    address_line TEXT,          -- Endereço Completo
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    contact_name VARCHAR(255),  -- Supervisor de Campo local
    contact_phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sites_client_id ON inspection_sites(client_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON inspection_sites(status);

-- -----------------------------------------------------------------------------
-- 10.5.3 Equipamentos
-- Compatível com EquipmentPage do Front-end Web e Mobile
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES inspection_sites(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    asset_number VARCHAR(100),     -- Patrimônio
    serial_number VARCHAR(100),    -- Número de Série
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    type VARCHAR(100),             -- Categoria/Tipo (ex: Bomba Hidráulica, Compressor, etc.)
    description TEXT,
    qr_code VARCHAR(255) UNIQUE,   -- Identificador único do QR Code para app mobile
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, DECOMMISSIONED, OK, ALTA, CRITICO
    installed_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_equipment_site_id ON equipment(site_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_asset_number ON equipment(asset_number);

-- -----------------------------------------------------------------------------
-- 10.7 Modelos de Inspeção (Templates) e Versionamento Imutável
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, ACTIVE, INACTIVE
    current_version INT NOT NULL DEFAULT 1,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inspection_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES inspection_templates(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    title_snapshot VARCHAR(255) NOT NULL,
    description_snapshot TEXT,
    published_by UUID REFERENCES users(id),
    published_at TIMESTAMPTZ,
    active_for_new_inspections BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (template_id, version_number)
);

CREATE TABLE IF NOT EXISTS template_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_version_id UUID NOT NULL REFERENCES inspection_template_versions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS template_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES template_sections(id) ON DELETE CASCADE,
    code VARCHAR(50),
    title TEXT NOT NULL,
    description TEXT,
    response_type VARCHAR(50) NOT NULL, -- TEXT_SHORT, TEXT_LONG, NUMBER, BOOLEAN, CONFORMITY, SINGLE_CHOICE, DATE, PHOTO
    required BOOLEAN NOT NULL DEFAULT false,
    observation_required_on_failure BOOLEAN NOT NULL DEFAULT false,
    evidence_required_on_failure BOOLEAN NOT NULL DEFAULT false,
    options_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 10.8 Execução da Inspeção, Snapshots e Respostas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_version_id UUID NOT NULL REFERENCES inspection_template_versions(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    site_id UUID NOT NULL REFERENCES inspection_sites(id),
    equipment_id UUID REFERENCES equipment(id),
    technician_id UUID NOT NULL REFERENCES users(id),
    supervisor_id UUID NOT NULL REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, ASSIGNED, IN_PROGRESS, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CANCELED
    scheduled_for TIMESTAMPTZ,
    started_at_device TIMESTAMPTZ,
    started_at_server TIMESTAMPTZ,
    completed_at_device TIMESTAMPTZ,
    submitted_at_server TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    canceled_by UUID REFERENCES users(id),
    canceled_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_inspections_tech_status ON inspections(technician_id, status);
CREATE INDEX IF NOT EXISTS idx_inspections_super_status ON inspections(supervisor_id, status);
CREATE INDEX IF NOT EXISTS idx_inspections_client_id ON inspections(client_id);
CREATE INDEX IF NOT EXISTS idx_inspections_site_id ON inspections(site_id);
CREATE INDEX IF NOT EXISTS idx_inspections_equipment_id ON inspections(equipment_id);
CREATE INDEX IF NOT EXISTS idx_inspections_scheduled ON inspections(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_inspections_status_sched ON inspections(status, scheduled_for);

CREATE TABLE IF NOT EXISTS inspection_item_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    source_template_item_id UUID,
    section_title VARCHAR(255) NOT NULL,
    section_description TEXT,
    section_order INT NOT NULL DEFAULT 0,
    item_code VARCHAR(50),
    item_title TEXT NOT NULL,
    item_description TEXT,
    response_type VARCHAR(50) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT false,
    rules_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    options_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    item_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_snapshots_inspection_id ON inspection_item_snapshots(inspection_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_order ON inspection_item_snapshots(inspection_id, section_order, item_order);

CREATE TABLE IF NOT EXISTS inspection_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    inspection_item_id UUID NOT NULL REFERENCES inspection_item_snapshots(id) ON DELETE CASCADE UNIQUE,
    value_text TEXT,
    value_number NUMERIC,
    value_boolean BOOLEAN,
    value_date DATE,
    value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    observation TEXT,
    conformity VARCHAR(50), -- NOT_APPLICABLE, CONFORMING, NON_CONFORMING
    answered_by UUID REFERENCES users(id),
    answered_at_device TIMESTAMPTZ,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_responses_inspection_id ON inspection_responses(inspection_id);
CREATE INDEX IF NOT EXISTS idx_responses_answered_by ON inspection_responses(answered_by);

-- -----------------------------------------------------------------------------
-- 10.9 Evidências (Arquivos / Fotos com metadados)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    response_id UUID REFERENCES inspection_responses(id) ON DELETE SET NULL,
    non_conformity_id UUID,
    type VARCHAR(50) NOT NULL DEFAULT 'PHOTO',
    storage_key VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT,
    checksum VARCHAR(100),
    description TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    captured_at_device TIMESTAMPTZ,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidences_inspection_id ON evidences(inspection_id);
CREATE INDEX IF NOT EXISTS idx_evidences_response_id ON evidences(response_id);
CREATE INDEX IF NOT EXISTS idx_evidences_uploaded_at ON evidences(uploaded_at);

-- -----------------------------------------------------------------------------
-- 10.10 Não Conformidades
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS non_conformities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    inspection_item_id UUID REFERENCES inspection_item_snapshots(id),
    response_id UUID REFERENCES inspection_responses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',     -- OPEN, IN_PROGRESS, RESOLVED, CANCELLED
    created_by UUID REFERENCES users(id),
    created_at_device TIMESTAMPTZ,
    server_received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_nc_inspection_id ON non_conformities(inspection_id);
CREATE INDEX IF NOT EXISTS idx_nc_severity ON non_conformities(severity);
CREATE INDEX IF NOT EXISTS idx_nc_status ON non_conformities(status);

ALTER TABLE evidences 
    ADD CONSTRAINT fk_evidences_non_conformity 
    FOREIGN KEY (non_conformity_id) REFERENCES non_conformities(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_evidences_nc_id ON evidences(non_conformity_id);

-- -----------------------------------------------------------------------------
-- 10.11 Revisão da Inspeção
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inspection_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    decision VARCHAR(50) NOT NULL, -- APPROVED, REJECTED
    reason TEXT,
    comments TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    review_cycle INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_inspection_id ON inspection_reviews(inspection_id);

-- -----------------------------------------------------------------------------
-- 10.12 Auditoria (AuditEvent)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    actor_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    device_occurred_at TIMESTAMPTZ,
    previous_value_json JSONB,
    new_value_json JSONB,
    metadata_json JSONB,
    request_id VARCHAR(100),
    device_id VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_inspection ON audit_events(inspection_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_occurred ON audit_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_request ON audit_events(request_id);
