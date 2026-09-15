import { useState } from 'react';
import { initialCustomers, initialLocations, initialEquipments } from '../core/data/mockData';
import { DataTable } from '../shared/components/DataTable';
import { ModalDrawer } from '../shared/components/ModalDrawer';
import { StatusBadge } from '../shared/components/StatusBadge';
import { QrCode } from 'lucide-react';

export const EquipmentPage = () => {
  const [equipments, setEquipments] = useState(initialEquipments);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Bomba Hidráulica',
    customerId: initialCustomers[0]?.id || '',
    locationId: initialLocations[0]?.id || '',
    serialNumber: '',
    qrCodeId: 'QR-EQP-1099',
    status: 'OK'
  });

  // Locations filtered by selected customer in form
  const availableFormLocations = initialLocations.filter(
    (loc) => loc.customerId === formData.customerId
  );

  // Filtered table data
  const filteredEquipments = equipments.filter((eqp) => {
    if (selectedCustomerId && eqp.customerId !== selectedCustomerId) return false;
    if (selectedLocationId && eqp.locationId !== selectedLocationId) return false;
    return true;
  });

  const columns = [
    {
      header: 'QR CODE',
      key: 'qrCodeId',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <QrCode size={20} color="#38bdf8" />
          <code style={{ fontSize: '0.75rem', backgroundColor: '#0f172a', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', color: '#38bdf8' }}>
            {val}
          </code>
        </div>
      )
    },
    { header: 'Nome do Equipamento', key: 'name' },
    { header: 'Tipo', key: 'type' },
    { header: 'Cliente', key: 'customerName' },
    { header: 'Planta / Local', key: 'locationName' },
    { header: 'Nº de Série', key: 'serialNumber' },
    { header: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
  ];

  const handleCustomerChangeInForm = (custId) => {
    const locs = initialLocations.filter((l) => l.customerId === custId);
    setFormData({
      ...formData,
      customerId: custId,
      locationId: locs[0]?.id || ''
    });
  };

  const handleGenerateQRCode = () => {
    const code = `QR-${formData.type.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData({ ...formData, qrCodeId: code });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cust = initialCustomers.find((c) => c.id === formData.customerId);
    const loc = initialLocations.find((l) => l.id === formData.locationId);

    const newEquipment = {
      id: `eqp-${Date.now()}`,
      qrCodeId: formData.qrCodeId,
      name: formData.name,
      type: formData.type,
      customerId: formData.customerId,
      customerName: cust ? cust.name : 'N/A',
      locationId: formData.locationId,
      locationName: loc ? loc.name : 'N/A',
      serialNumber: formData.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: formData.status,
      lastInspected: 'Hoje'
    };

    setEquipments([newEquipment, ...equipments]);
    setIsDrawerOpen(false);
    setFormData({
      name: '',
      type: 'Bomba Hidráulica',
      customerId: initialCustomers[0]?.id || '',
      locationId: initialLocations[0]?.id || '',
      serialNumber: '',
      qrCodeId: `QR-EQP-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OK'
    });
  };

  return (
    <>
      <div className="page-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Gestão de Equipamentos</h1>
          <p>Listagem de ativos industriais e vinculação de QR Codes para inspeção mobile.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
          onClick={() => setIsDrawerOpen(true)}
        >
          + Novo Equipamento
        </button>
      </div>

      <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Cliente:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setSelectedLocationId('');
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              color: '#ffffff',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Todos os Clientes</option>
            {initialCustomers.map((cust) => (
              <option key={cust.id} value={cust.id}>{cust.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Planta / Local:</label>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.375rem',
              color: '#ffffff',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Todas as Plantas</option>
            {initialLocations
              .filter((loc) => !selectedCustomerId || loc.customerId === selectedCustomerId)
              .map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
          </select>
        </div>
      </div>

      <DataTable
        title="Equipamentos Cadastrados"
        columns={columns}
        data={filteredEquipments}
        totalCount={filteredEquipments.length}
        currentPage={1}
        onRowAction={(row) => alert(`Equipamento: ${row.name}\nCódigo QR: ${row.qrCodeId}\nNº Série: ${row.serialNumber}`)}
      />

      <ModalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Cadastrar Novo Equipamento"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Nome do Equipamento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Bomba Centrifuga X1"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Tipo de Equipamento *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            >
              <option value="Bomba Hidráulica">Bomba Hidráulica</option>
              <option value="Válvula de Segurança">Válvula de Segurança</option>
              <option value="Esteira Industrial">Esteira Industrial</option>
              <option value="Compressor de Ar">Compressor de Ar</option>
              <option value="Painel de Automação">Painel de Automação</option>
              <option value="Gerador Diesel">Gerador Diesel</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Cliente *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChangeInForm(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            >
              {initialCustomers.map((cust) => (
                <option key={cust.id} value={cust.id}>{cust.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Planta / Local *
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              required
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            >
              {availableFormLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Número de Série
            </label>
            <input
              type="text"
              placeholder="Ex: SN-8849-2023"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Identificador Exclusivo do QR Code (para App Mobile) *
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                required
                value={formData.qrCodeId}
                onChange={(e) => setFormData({ ...formData, qrCodeId: e.target.value })}
                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#38bdf8', fontWeight: 'bold' }}
              />
              <button
                type="button"
                onClick={handleGenerateQRCode}
                className="toolbar-button"
                style={{ whiteSpace: 'nowrap' }}
              >
                Gerar Novo
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px dashed #334155', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📱 QR</span>
            <span style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.875rem' }}>{formData.qrCodeId}</span>
            <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>
              Pronto para ser impresso e fixado no equipamento.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Status Operacional Inicial
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            >
              <option value="OK">OK (Operativo)</option>
              <option value="Alta">Alta Atenção</option>
              <option value="Crítico">Crítico (Falha)</option>
              <option value="Baixa">Baixa Prioridade</option>
            </select>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="primary-button" style={{ flex: 1 }}>
              Cadastrar Equipamento
            </button>
            <button
              type="button"
              className="toolbar-button"
              onClick={() => setIsDrawerOpen(false)}
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </ModalDrawer>
    </>
  );
};
