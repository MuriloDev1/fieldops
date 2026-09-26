-- =============================================================================
-- FIELDOPS - SEED DE DADOS INICIAIS
-- Totalmente compatível com o Front-end Web (mockData.js), Mobile e Seção 10/12
-- =============================================================================

-- Senha padrão para todos os usuários de teste: "123456"
-- BCrypt hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi

-- -----------------------------------------------------------------------------
-- 1. Usuários Base
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, status, phone)
VALUES 
    ('90000000-0000-0000-0000-000000000001', 'Administrador Geral', 'admin@fieldops.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN', 'ACTIVE', '(11) 98765-4321'),
    ('90000000-0000-0000-0000-000000000002', 'Supervisor Profile', 'supervisor@fieldops.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'SUPERVISOR', 'ACTIVE', '(11) 98888-1111'),
    ('90000000-0000-0000-0000-000000000003', 'Carlos Técnico', 'tecnico@fieldops.local', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'TECHNICIAN', 'ACTIVE', '(11) 97777-2222')
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Clientes (Empresas parceiras e contratantes)
-- -----------------------------------------------------------------------------
INSERT INTO clients (id, name, legal_name, document, email, phone, status)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Petrobras S.A.', 'Petróleo Brasileiro S.A.', '33.000.167/0001-01', 'contato@petrobras.com.br', '(21) 3224-4477', 'ACTIVE'),
    ('22222222-2222-2222-2222-222222222222', 'Vale Indústrias', 'Vale S.A.', '33.592.510/0001-54', 'operacoes@vale.com', '(31) 3819-2000', 'ACTIVE'),
    ('33333333-3333-3333-3333-333333333333', 'Klabin Papel e Celulose', 'Klabin S.A.', '89.637.490/0001-45', 'campo@klabin.com.br', '(11) 3046-5000', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. Locais / Plantas Operacionais
-- -----------------------------------------------------------------------------
INSERT INTO inspection_sites (id, client_id, name, description, address_line, city, state, postal_code, contact_name, status)
VALUES 
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Unidade de Extração Alpha', 'Plataforma marítima de produção', 'Bacia de Campos, Plataforma P-51', 'Macaé', 'RJ', '27910-000', 'Carlos Eduardo', 'ACTIVE'),
    ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Refinaria Central', 'Complexo de refino principal', 'Rodovia Washington Luíz, Km 12', 'Duque de Caxias', 'RJ', '25000-000', 'Ana Paula', 'ACTIVE'),
    ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Terminal Marítimo Sul', 'Operações de carga e descarga portuária', 'Porto de Santos, Cais 04', 'Santos', 'SP', '11013-000', 'Roberto Silva', 'ACTIVE'),
    ('a4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Planta de Processamento Carajás', 'Usina de beneficiamento mineral', 'Distrito Industrial 02', 'Parauapebas', 'PA', '68515-000', 'Fernanda Lima', 'ACTIVE'),
    ('a5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Unidade Monte Alegre', 'Fábrica de papel kraft e embalagens', 'Av. Brasil, 1000', 'Telêmaco Borba', 'PR', '84275-000', 'Julio Cesar', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. Equipamentos
-- -----------------------------------------------------------------------------
INSERT INTO equipment (id, site_id, name, asset_number, serial_number, manufacturer, model, type, description, qr_code, status, installed_at)
VALUES 
    ('e1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Bomba Submersa 04', 'PAT-2023-001', 'SN-SUB-2023-88', 'Sulzer', 'ABS XFP', 'Bomba Hidráulica', 'Bomba submersível para escoamento de efluentes', 'QR-BOMBA-04-ALPHA', 'CRITICAL', '2023-01-15'),
    ('e2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Válvula de Pressão B', 'PAT-2022-045', 'SN-VAL-2022-14', 'Emerson', 'Fisher 657', 'Válvula de Segurança', 'Válvula de alívio e controle de alta pressão', 'QR-VALV-02-CENTRAL', 'HIGH', '2022-06-20'),
    ('e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Correia Transportadora 2', 'PAT-2021-089', 'SN-COR-2021-99', 'Metso Outotec', 'TR-800', 'Esteira Industrial', 'Correia transportadora de granéis sólidos', 'QR-CORR-02-MARITIMO', 'LOW', '2021-11-10'),
    ('e4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'Compressor Principal', 'PAT-2023-012', 'SN-CMP-2023-01', 'Atlas Copco', 'GA 90 VSD', 'Compressor de Ar', 'Compressor de ar rotativo de parafuso', 'QR-COMP-01-CARAJAS', 'HIGH', '2023-03-05'),
    ('e5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'Painel Elétrico Leste', 'PAT-2023-104', 'SN-PNL-2023-55', 'WEG', 'CCM-01', 'Painel de Automação', 'Painel de distribuição e comando de motores', 'QR-PAINEL-LESTE-KLABIN', 'CRITICAL', '2023-08-18')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. Modelo de Inspeção, Versão Publicada e Checklist
-- -----------------------------------------------------------------------------
INSERT INTO inspection_templates (id, title, description, category, status, current_version, created_by)
VALUES 
    ('t1111111-1111-1111-1111-111111111111', 'Inspeção de Compressores Industriais', 'Checklist periódico de rotina e segurança para compressores', 'Compressores', 'ACTIVE', 1, '90000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inspection_template_versions (id, template_id, version_number, title_snapshot, description_snapshot, published_by, published_at, active_for_new_inspections)
VALUES 
    ('v1111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111111', 1, 'Inspeção de Compressores Industriais', 'Checklist periódico de rotina e segurança para compressores', '90000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_sections (id, template_version_id, title, description, display_order)
VALUES 
    ('s1111111-1111-1111-1111-111111111111', 'v1111111-1111-1111-1111-111111111111', 'Identificação e Condições Gerais', 'Checagens visuais do ambiente e carcaça', 1),
    ('s2222222-2222-2222-2222-222222222222', 'v1111111-1111-1111-1111-111111111111', 'Sistema Mecânico e Lubrificação', 'Níveis de óleo, vibração e ruído', 2),
    ('s3333333-3333-3333-3333-333333333333', 'v1111111-1111-1111-1111-111111111111', 'Sistema Elétrico e Segurança', 'Painel de controle, cabos e botão de emergência', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO template_items (id, section_id, code, title, description, response_type, required, observation_required_on_failure, evidence_required_on_failure, display_order)
VALUES 
    ('i1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'ITEM-01', 'A proteção do equipamento está íntegra?', 'Verifique trincas, ausência de parafusos e partes soltas.', 'CONFORMITY', true, true, true, 1),
    ('i2222222-2222-2222-2222-222222222222', 's1111111-1111-1111-1111-111111111111', 'ITEM-02', 'A área ao redor está limpa e desobstruída?', 'Garantir acesso rápido e ventilação adequada.', 'BOOLEAN', true, false, false, 2),
    ('i3333333-3333-3333-3333-333333333333', 's2222222-2222-2222-2222-222222222222', 'ITEM-03', 'O nível de óleo está na faixa indicada no visor?', 'Verificar visor de nível de óleo com compressor parado.', 'CONFORMITY', true, true, true, 3),
    ('i4444444-4444-4444-4444-444444444444', 's2222222-2222-2222-2222-222222222222', 'ITEM-04', 'Qual a pressão atual indicada no manômetro (bar)?', 'Informar o valor numérico em bar.', 'NUMBER', true, false, false, 4),
    ('i5555555-5555-5555-5555-555555555555', 's3333333-3333-3333-3333-333333333333', 'ITEM-05', 'O botão de parada de emergência está operante?', 'Testar atuação física e destravamento.', 'CONFORMITY', true, true, true, 5)
ON CONFLICT (id) DO NOTHING;
