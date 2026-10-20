export const technicians = [
  { id: 1, name: 'Ana Costa', email: 'ana.costa@fieldops.com', status: 'Disponível', inspectionsDone: 42, pending: 3, role: 'Técnico' },
  { id: 2, name: 'Bruno Silva', email: 'bruno.silva@fieldops.com', status: 'Em campo', inspectionsDone: 36, pending: 5, role: 'Técnico' },
  { id: 3, name: 'Carla Mendes', email: 'carla.mendes@fieldops.com', status: 'Disponível', inspectionsDone: 51, pending: 2, role: 'Técnico' },
  { id: 4, name: 'Daniel Rocha', email: 'daniel.rocha@fieldops.com', status: 'Em manutenção', inspectionsDone: 18, pending: 7, role: 'Supervisor' },
];

export const equipment = [
  { id: 'EQ-1204', name: 'Bomba centrífuga 04', type: 'Bombas', location: 'Planta Norte', status: 'Operando', lastInspection: '12/09/2026', nextInspection: '12/10/2026' },
  { id: 'EQ-9012', name: 'Válvula de segurança V-12', type: 'Válvulas', location: 'Área de processo', status: 'Alerta', lastInspection: '08/09/2026', nextInspection: '15/09/2026' },
  { id: 'EQ-4708', name: 'Compressores 02', type: 'Compressão', location: 'Setor A', status: 'Operando', lastInspection: '04/09/2026', nextInspection: '09/10/2026' },
  { id: 'EQ-3311', name: 'Sistema de drenagem', type: 'Infraestrutura', location: 'Galpão 3', status: 'Em manutenção', lastInspection: '28/08/2026', nextInspection: '06/09/2026' },
];

export const inspections = [
  { id: 'INS-2048', name: 'Inspeção de segurança de bomba', equipment: 'Bomba centrífuga 04', technician: 'Ana Costa', date: '14/09/2026', status: 'Em andamento', priority: 'Alta', progress: 35 },
  { id: 'INS-1921', name: 'Checklist de válvulas', equipment: 'Válvula de segurança V-12', technician: 'Bruno Silva', date: '12/09/2026', status: 'Conforme', priority: 'Média', progress: 100 },
  { id: 'INS-1853', name: 'Verificação de drenagem', equipment: 'Sistema de drenagem', technician: 'Carla Mendes', date: '11/09/2026', status: 'Pendente', priority: 'Baixa', progress: 0 },
  { id: 'INS-1789', name: 'Inspeção estrutural Setor A', equipment: 'Compressores 02', technician: 'Ana Costa', date: '09/09/2026', status: 'Não conforme', priority: 'Alta', progress: 65 },
  { id: 'INS-1710', name: 'Aferição de pressão', equipment: 'Linha de produção 02', technician: 'Bruno Silva', date: '08/09/2026', status: 'Cancelado', priority: 'Baixa', progress: 0 },
  { id: 'INS-1655', name: 'Inspeção de isolamentos', equipment: 'Painel elétrico principal', technician: 'Carla Mendes', date: '06/09/2026', status: 'Concluído', priority: 'Alta', progress: 100 },
];

export const nonConformities = [
  { id: 'NC-104', description: 'Válvula com vazamento em conexão de saída', equipment: 'Válvula de segurança V-12', inspection: 'INS-1921', technician: 'Bruno Silva', date: '12/09/2026', priority: 'Alta', status: 'Aberta' },
  { id: 'NC-118', description: 'Bomba apresentando ruído excessivo no eixo', equipment: 'Bomba centrífuga 04', inspection: 'INS-2048', technician: 'Ana Costa', date: '14/09/2026', priority: 'Alta', status: 'Em andamento' },
  { id: 'NC-095', description: 'Fuga em linha de drenagem externa', equipment: 'Sistema de drenagem', inspection: 'INS-1853', technician: 'Carla Mendes', date: '11/09/2026', priority: 'Média', status: 'Resolvida' },
];

export const serviceOrders = [
  { id: 'OS-4401', description: 'Manutenção corretiva em bomba centrífuga', equipment: 'Bomba centrífuga 04', responsible: 'Daniel Rocha', priority: 'Alta', status: 'Aberta', date: '14/09/2026' },
  { id: 'OS-4389', description: 'Troca de selo de válvula', equipment: 'Válvula de segurança V-12', responsible: 'Ana Costa', priority: 'Média', status: 'Em andamento', date: '12/09/2026' },
  { id: 'OS-4374', description: 'Revisão do painel elétrico', equipment: 'Painel elétrico principal', responsible: 'Carla Mendes', priority: 'Baixa', status: 'Concluída', date: '09/09/2026' },
];

export const inspectionHistory = [
  { id: 'HIS-112', equipment: 'Bomba centrífuga 04', technician: 'Ana Costa', status: 'Conforme', date: '13/09/2026' },
  { id: 'HIS-119', equipment: 'Válvula de segurança V-12', technician: 'Bruno Silva', status: 'Não conforme', date: '12/09/2026' },
  { id: 'HIS-121', equipment: 'Sistema de drenagem', technician: 'Carla Mendes', status: 'Pendente', date: '11/09/2026' },
  { id: 'HIS-125', equipment: 'Compressores 02', technician: 'Ana Costa', status: 'Concluído', date: '10/09/2026' },
];

export const dashboardMetrics = [
  { label: 'Inspeções realizadas', value: '1.284', delta: '+5,2% no mês', tone: 'blue' },
  { label: 'Inspeções pendentes', value: '48', delta: '8 críticas', tone: 'yellow' },
  { label: 'Em andamento', value: '12', delta: '3 hoje', tone: 'cyan' },
  { label: 'Não conformidades', value: '09', delta: '2 abertas', tone: 'red' },
  { label: 'Equipamentos', value: '136', delta: '94% ativos', tone: 'slate' },
  { label: 'Técnicos', value: '24', delta: '19 disponíveis', tone: 'green' },
  { label: 'Ordens de serviço', value: '17', delta: '5 com atraso', tone: 'orange' },
];

export const inspectionQuestions = [
  {
    id: 1,
    question: 'O equipamento apresenta condições adequadas de funcionamento?',
    type: 'boolean',
    expected: 'conforme',
  },
  {
    id: 2,
    question: 'Os elementos de proteção e sinalização estão visíveis e em bom estado?',
    type: 'boolean',
    expected: 'conforme',
  },
  {
    id: 3,
    question: 'Há evidência de desgaste, corrosão ou vazamento na estrutura?',
    type: 'boolean',
    expected: 'conforme',
  },
  {
    id: 4,
    question: 'Os pontos de lubrificação e manutenção foram verificados?',
    type: 'boolean',
    expected: 'conforme',
  },
];
