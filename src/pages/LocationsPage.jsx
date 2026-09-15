import { useState } from 'react';
import { initialCustomers, initialLocations } from '../core/data/mockData';
import { DataTable } from '../shared/components/DataTable';
import { ModalDrawer } from '../shared/components/ModalDrawer';

export const LocationsPage = () => {
  const [locations, setLocations] = useState(initialLocations);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    customerId: initialCustomers[0]?.id || '',
    city: '',
    state: '',
    address: '',
    supervisor: ''
  });

  const filteredLocations = selectedCustomerId
    ? locations.filter((loc) => loc.customerId === selectedCustomerId)
    : locations;

  const columns = [
    { header: 'Nome da Planta / Local', key: 'name' },
    { header: 'Cliente (Empresa)', key: 'customerName' },
    { header: 'Cidade/UF', key: 'city', render: (val, row) => `${row.city} - ${row.state}` },
    { header: 'Endereço', key: 'address' },
    { header: 'Supervisor Local', key: 'supervisor' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const customer = initialCustomers.find((c) => c.id === formData.customerId);
    const newLocation = {
      id: `loc-${Date.now()}`,
      customerId: formData.customerId,
      customerName: customer ? customer.name : 'Cliente Indefinido',
      name: formData.name,
      city: formData.city,
      state: formData.state,
      address: formData.address,
      supervisor: formData.supervisor || 'Não atribuído',
      equipmentsCount: 0
    };
    setLocations([newLocation, ...locations]);
    setFormData({ name: '', customerId: initialCustomers[0]?.id || '', city: '', state: '', address: '', supervisor: '' });
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="page-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Gestão de Locais e Plantas</h1>
          <p>Unidades operacionais vinculadas aos clientes cadastrados.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
          onClick={() => setIsDrawerOpen(true)}
        >
          + Novo Local / Planta
        </button>
      </div>

      <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
          Filtrar por Cliente:
        </label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
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
            <option key={cust.id} value={cust.id}>
              {cust.name}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        title="Plantas Operacionais"
        columns={columns}
        data={filteredLocations}
        totalCount={filteredLocations.length}
        currentPage={1}
        onRowAction={(row) => alert(`Planta: ${row.name}\nEndereço: ${row.address}`)}
      />

      <ModalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Cadastrar Novo Local / Planta"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Cliente Vinculado *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
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
              Nome da Planta / Unidade *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Refinaria Central - Galpão B"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>Cidade *</label>
              <input
                type="text"
                required
                placeholder="Ex: Macaé"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>UF *</label>
              <input
                type="text"
                required
                placeholder="RJ"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>Endereço Completo</label>
            <input
              type="text"
              placeholder="Rua, Número, Bairro, CEP"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>Supervisor de Campo</label>
            <input
              type="text"
              placeholder="Nome do supervisor responsável"
              value={formData.supervisor}
              onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="primary-button" style={{ flex: 1 }}>
              Salvar Local
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
