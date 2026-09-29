export const initialCustomers = [
  { id: 'cust-1', name: 'Petrobras S.A.', cnpj: '33.000.167/0001-01', email: 'contato@petrobras.com.br', phone: '(21) 3224-4477', locationsCount: 3 },
  { id: 'cust-2', name: 'Vale Indústrias', cnpj: '33.592.510/0001-54', email: 'operacoes@vale.com', phone: '(31) 3819-2000', locationsCount: 2 },
  { id: 'cust-3', name: 'Klabin Papel e Celulose', cnpj: '89.637.490/0001-45', email: 'campo@klabin.com.br', phone: '(11) 3046-5000', locationsCount: 1 },
];

export const initialLocations = [
  { id: 'loc-1', customerId: 'cust-1', customerName: 'Petrobras S.A.', name: 'Unidade de Extração Alpha', city: 'Macaé', state: 'RJ', address: 'Bacia de Campos, Plataforma P-51', supervisor: 'Carlos Eduardo', equipmentsCount: 4 },
  { id: 'loc-2', customerId: 'cust-1', customerName: 'Petrobras S.A.', name: 'Refinaria Central', city: 'Duque de Caxias', state: 'RJ', address: 'Rodovia Washington Luíz, Km 12', supervisor: 'Ana Paula', equipmentsCount: 3 },
  { id: 'loc-3', customerId: 'cust-1', customerName: 'Petrobras S.A.', name: 'Terminal Marítimo Sul', city: 'Santos', state: 'SP', address: 'Porto de Santos, Cais 04', supervisor: 'Roberto Silva', equipmentsCount: 2 },
  { id: 'loc-4', customerId: 'cust-2', customerName: 'Vale Indústrias', name: 'Planta de Processamento Carajás', city: 'Parauapebas', state: 'PA', address: 'Distrito Industrial 02', supervisor: 'Fernanda Lima', equipmentsCount: 3 },
  { id: 'loc-5', customerId: 'cust-3', customerName: 'Klabin Papel e Celulose', name: 'Unidade Monte Alegre', city: 'Telêmaco Borba', state: 'PR', address: 'Av. Brasil, 1000', supervisor: 'Julio Cesar', equipmentsCount: 2 },
];

export const initialEquipments = [
  {
    id: 'eqp-1',
    qrCodeId: 'QR-BOMBA-04-ALPHA',
    name: 'Bomba Submersa 04',
    type: 'Bomba Hidráulica',
    customerId: 'cust-1',
    customerName: 'Petrobras S.A.',
    locationId: 'loc-1',
    locationName: 'Unidade de Extração Alpha',
    serialNumber: 'SN-SUB-2023-88',
    status: 'Crítico',
    lastInspected: '24 Out 2023'
  },
  {
    id: 'eqp-2',
    qrCodeId: 'QR-VALV-02-CENTRAL',
    name: 'Válvula de Pressão B',
    type: 'Válvula de Segurança',
    customerId: 'cust-1',
    customerName: 'Petrobras S.A.',
    locationId: 'loc-2',
    locationName: 'Refinaria Central',
    serialNumber: 'SN-VAL-2022-14',
    status: 'Alta',
    lastInspected: '23 Out 2023'
  },
  {
    id: 'eqp-3',
    qrCodeId: 'QR-CORR-02-MARITIMO',
    name: 'Correia Transportadora 2',
    type: 'Esteira Industrial',
    customerId: 'cust-1',
    customerName: 'Petrobras S.A.',
    locationId: 'loc-3',
    locationName: 'Terminal Marítimo Sul',
    serialNumber: 'SN-COR-2021-99',
    status: 'Baixa',
    lastInspected: '22 Out 2023'
  },
  {
    id: 'eqp-4',
    qrCodeId: 'QR-COMP-01-CARAJAS',
    name: 'Compressor Principal',
    type: 'Compressor de Ar',
    customerId: 'cust-2',
    customerName: 'Vale Indústrias',
    locationId: 'loc-4',
    locationName: 'Planta de Processamento Carajás',
    serialNumber: 'SN-CMP-2023-01',
    status: 'Alta',
    lastInspected: '21 Out 2023'
  },
  {
    id: 'eqp-5',
    qrCodeId: 'QR-PAINEL-LESTE-KLABIN',
    name: 'Painel Elétrico Leste',
    type: 'Painel de Automação',
    customerId: 'cust-3',
    customerName: 'Klabin Papel e Celulose',
    locationId: 'loc-5',
    locationName: 'Unidade Monte Alegre',
    serialNumber: 'SN-PNL-2023-55',
    status: 'Crítico',
    lastInspected: '21 Out 2023'
  }
];
