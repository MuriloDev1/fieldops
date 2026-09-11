-- =============================================================================
-- FieldOps - Script de Carga Inicial (Seed Data)
-- =============================================================================
-- Popula o banco com dados realistas baseados nos protótipos e especificações
-- do projeto (App mobile, painel administrativo e regras de negócio).
-- =============================================================================

BEGIN;

-- 1. Organização Padrão
INSERT INTO organizations (id, name, created_at, updated_at)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Indústria Central S/A', NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Usuários e Perfis (Admin, Supervisor e Técnicos de Campo)
INSERT INTO users (id, organization_id, name, email, role, active, created_at, updated_at)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Murilo Antunes', 'admin@fieldops.com', 'admin', true, NOW() - INTERVAL '30 days', NOW()),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Carlos Silva', 'supervisor@fieldops.com', 'supervisor', true, NOW() - INTERVAL '30 days', NOW()),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'João Silva', 'joao.silva@fieldops.com', 'technician', true, NOW() - INTERVAL '25 days', NOW()),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Carlos Oliveira', 'carlos.oliveira@fieldops.com', 'technician', true, NOW() - INTERVAL '25 days', NOW()),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Maria Souza', 'maria.souza@fieldops.com', 'technician', true, NOW() - INTERVAL '25 days', NOW()),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Ana Costa', 'ana.costa@fieldops.com', 'technician', true, NOW() - INTERVAL '25 days', NOW()),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Pedro Santos', 'pedro.santos@fieldops.com', 'technician', true, NOW() - INTERVAL '25 days', NOW())
ON CONFLICT (organization_id, email) DO NOTHING;

-- 3. Locais Operacionais / Plantas Industriais
INSERT INTO sites (id, organization_id, name, code, address, active, created_at, updated_at)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Refinaria Central', 'REF-01', 'Av. das Indústrias, 1000 - Polo Petroquímico', true, NOW() - INTERVAL '30 days', NOW()),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Unidade Sul', 'UNI-SUL', 'Rodovia Sul, Km 45 - Distrito Industrial', true, NOW() - INTERVAL '30 days', NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Unidade Alpha', 'UNI-ALP', 'Parque Fabril Alpha, Galpão 3', true, NOW() - INTERVAL '30 days', NOW()),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Unidade Beta', 'UNI-BET', 'Complexo Tecnológico Beta, Bloco B', true, NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (organization_id, code) DO NOTHING;

-- 4. Tipos de Equipamento
INSERT INTO equipment_types (id, organization_id, name, description, created_at, updated_at)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Compressor', 'Compressores de ar comprimido e gases industriais', NOW() - INTERVAL '30 days', NOW()),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Gerador', 'Geradores de energia a diesel para contingência', NOW() - INTERVAL '30 days', NOW()),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Bomba', 'Bombas submersas e centrífugas de alta pressão', NOW() - INTERVAL '30 days', NOW()),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Válvula', 'Válvulas de controle de pressão, alívio e retenção', NOW() - INTERVAL '30 days', NOW()),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Painel', 'Painéis elétricos de comando e distribuição de força', NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (organization_id, name) DO NOTHING;

-- 5. Equipamentos (Espelhando fielmente os dados dos protótipos)
INSERT INTO equipment (id, organization_id, site_id, equipment_type_id, responsible_user_id, name, code, status, description, created_at, updated_at)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Compressor Industrial 01', 'EQP-001', 'active', 'Compressor principal de alta vazão para linha de produção', NOW() - INTERVAL '20 days', NOW()),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'Gerador Diesel 02', 'EQP-002', 'active', 'Gerador de contingência para suporte à infraestrutura crítica', NOW() - INTERVAL '20 days', NOW()),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'Bomba Submersa 04', 'EQP-003', 'maintenance', 'Bomba de captação de efluentes da estação de tratamento', NOW() - INTERVAL '20 days', NOW()),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006', 'Válvula de Pressão B', 'EQP-004', 'active', 'Válvula automática reguladora da linha de alimentação principal', NOW() - INTERVAL '20 days', NOW()),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000007', 'Painel Elétrico Leste', 'EQP-005', 'inactive', 'Painel desativado temporariamente para reforma do setor leste', NOW() - INTERVAL '20 days', NOW())
ON CONFLICT (organization_id, code) DO NOTHING;

-- 6. Modelos de Inspeção (Checklist Templates)
INSERT INTO inspection_templates (id, organization_id, name, version, published, active, created_by_user_id, created_at, updated_at)
VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Inspeção de Compressores Industriais', 1, true, true, 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (organization_id, name, version) DO NOTHING;

-- 7. Perguntas do Checklist
INSERT INTO inspection_template_questions (id, template_id, position, prompt, question_type, required, help_text, validation, created_at, updated_at)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 1, 'O equipamento está em boas condições operacionais?', 'boolean', true, 'Verificar ruídos anormais, vibração excessiva ou danos na carcaça.', '{}'::jsonb, NOW() - INTERVAL '15 days', NOW()),
  ('10000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 2, 'Qual o nível de pressão aferido no manômetro principal?', 'single_choice', true, 'Classifique conforme os limites da tabela técnica do equipamento.', '{}'::jsonb, NOW() - INTERVAL '15 days', NOW()),
  ('10000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 3, 'Existe algum vazamento visível de óleo ou ar?', 'boolean', false, 'Caso haja vazamento, detalhe no campo de observação.', '{}'::jsonb, NOW() - INTERVAL '15 days', NOW()),
  ('10000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 4, 'Temperatura operacional (°C)', 'number', true, 'Faixa normal: 60°C a 85°C.', '{"min": 0, "max": 150}'::jsonb, NOW() - INTERVAL '15 days', NOW()),
  ('10000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001', 5, 'Registro fotográfico das condições gerais e manômetro', 'photo', false, 'Capture uma foto nítida evidenciando a leitura do manômetro.', '{}'::jsonb, NOW() - INTERVAL '15 days', NOW()),
  ('10000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001', 6, 'Observações adicionais de campo', 'text', false, 'Anotações livres sobre anomalias ou necessidades de manutenção futura.', '{}'::jsonb, NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (template_id, position) DO NOTHING;

-- 8. Opções da Pergunta de Múltipla Escolha
INSERT INTO inspection_question_options (id, question_id, position, label, value, created_at, updated_at)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1, 'Baixo (< 4 bar)', 'baixo', NOW() - INTERVAL '15 days', NOW()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 2, 'Normal (4 - 8 bar)', 'normal', NOW() - INTERVAL '15 days', NOW()),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 3, 'Alto (8 - 10 bar)', 'alto', NOW() - INTERVAL '15 days', NOW()),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 4, 'Crítico (> 10 bar)', 'critico', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (question_id, position) DO NOTHING;

-- 9. Atribuições de Inspeção (Assignments)
INSERT INTO inspection_assignments (id, template_id, equipment_id, assigned_to_user_id, assigned_by_user_id, status, due_at, created_at, updated_at)
VALUES
  -- Inspeção 1: Em andamento com o técnico João Silva
  ('30000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'in_progress', NOW() + INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW()),
  -- Inspeção 2: Agendada com Carlos Oliveira
  ('30000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'scheduled', NOW() + INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW()),
  -- Inspeção 3: Concluída por Maria Souza (gerou não conformidade)
  ('30000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
  -- Inspeção 4: Atrasada (due_at no passado) com Pedro Santos
  ('30000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000002', 'late', NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. Execuções de Inspeção (Runs)
INSERT INTO inspection_runs (id, assignment_id, executed_by_user_id, status, started_at, submitted_at, approved_by_user_id, approved_at, notes, created_at, updated_at)
VALUES
  -- Execução concluída e aprovada da Inspeção 3
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'approved', NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days', 'b0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days 20 hours', 'Inspeção finalizada. Constatado vazamento no retentor da bomba. Aberta NC para manutenção corretiva.', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- 11. Respostas da Execução (Answers)
INSERT INTO inspection_answers (id, run_id, question_id, value_text, value_number, value_boolean, value_json, created_at, updated_at)
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', NULL, NULL, false, '{"observacao": "Ruído anormal no rotor"}'::jsonb, NOW() - INTERVAL '3 days', NOW()),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'critico', NULL, NULL, '{}'::jsonb, NOW() - INTERVAL '3 days', NOW()),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', NULL, NULL, true, '{"ponto_vazamento": "Flange de saída"}'::jsonb, NOW() - INTERVAL '3 days', NOW()),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', NULL, 92.5, NULL, '{}'::jsonb, NOW() - INTERVAL '3 days', NOW()),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'Equipamento requer parada técnica urgente para troca da vedação.', NULL, NULL, '{}'::jsonb, NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (run_id, question_id) DO NOTHING;

-- 12. Não Conformidades (Alimentando o Dashboard e Alertas Críticos)
INSERT INTO non_conformities (id, equipment_id, inspection_run_id, answer_id, opened_by_user_id, title, description, severity, status, opened_at, created_at, updated_at)
VALUES
  ('60000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000005', 'Vazamento contínuo no anel de vedação da bomba', 'Detectado vazamento visível com gotejamento constante na flange de saída da Bomba Submersa 04 durante inspeção periódica.', 'high', 'open', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW()),
  ('60000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', NULL, NULL, 'b0000000-0000-0000-0000-000000000002', 'Vibração excessiva e superaquecimento no motor', 'Medição preliminar indicou vibração acima de 4.5 mm/s e temperatura superior a 90°C no mancal dianteiro.', 'critical', 'in_progress', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- 13. Ações Corretivas / Ações Rápidas do Dashboard
INSERT INTO corrective_actions (id, non_conformity_id, assigned_to_user_id, title, description, status, due_at, created_at, updated_at)
VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Substituir anel de vedação e reapertar conexões da flange', 'Executar desmontagem parcial, limpeza das faces de contato e aplicação de novo kit de gaxetas homologadas.', 'open', NOW() + INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW()),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'Análise de vibração e lubrificação do mancal', 'Coleta de espectro FFT e engraxamento com lubrificante sintético de alta temperatura.', 'in_progress', NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW())
ON CONFLICT (id) DO NOTHING;

-- 14. Histórico de Status dos Equipamentos
INSERT INTO equipment_status_history (id, equipment_id, old_status, new_status, changed_by_user_id, reason, changed_at)
VALUES
  ('80000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'active', 'maintenance', 'b0000000-0000-0000-0000-000000000002', 'Entrada em manutenção preventiva/corretiva devido a vazamento apontado na inspeção #3', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- 15. Anexos / Evidências Fotográficas (Armazenadas no MinIO S3)
INSERT INTO attachments (id, organization_id, owner_type, owner_id, file_name, mime_type, storage_url, size_bytes, uploaded_by_user_id, created_at)
VALUES
  ('90000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'non_conformity', '60000000-0000-0000-0000-000000000001', 'evidencia_vazamento_bomba04.jpg', 'image/jpeg', 'http://localhost:9000/fieldops-evidence/evidencia_vazamento_bomba04.jpg', 245890, 'b0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- 16. Log de Auditoria Inicial
INSERT INTO audit_logs (id, organization_id, actor_user_id, entity_type, entity_id, action, before_data, after_data, created_at)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'system', 'a0000000-0000-0000-0000-000000000001', 'INITIAL_SEED', NULL, '{"status": "seed_applied_successfully"}'::jsonb, NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
