import { useState } from 'react';
import { initialCustomers } from '../core/data/mockData';
import { DataTable } from '../shared/components/DataTable';
import { ModalDrawer } from '../shared/components/ModalDrawer';

export const ClientsPage = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', cnpj: '', email: '', phone: '' });

  const columns = [
    { header: 'Nome da Empresa', key: 'name' },
    { header: 'CNPJ', key: 'cnpj' },
    { header: 'E-mail de Contato', key: 'email' },
    { header: 'Telefone', key: 'phone' },
    { header: 'Plantas Ativas', key: 'locationsCount' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCustomer = {
      id: `cust-${Date.now()}`,
      name: formData.name,
      cnpj: formData.cnpj,
      email: formData.email,
      phone: formData.phone,
      locationsCount: 0,
    };
    setCustomers([newCustomer, ...customers]);
    setFormData({ name: '', cnpj: '', email: '', phone: '' });
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="page-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Gestão de Clientes</h1>
          <p>Cadastro e listagem de empresas parceiras e contratantes.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          style={{ width: 'auto', padding: '0.6rem 1.25rem' }}
          onClick={() => setIsDrawerOpen(true)}
        >
          + Novo Cliente
        </button>
      </div>

      <DataTable
        title="Empresas Cadastradas"
        columns={columns}
        data={customers}
        totalCount={customers.length}
        currentPage={1}
        onRowAction={(row) => alert(`Cliente: ${row.name}\nCNPJ: ${row.cnpj}`)}
      />

      <ModalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Cadastrar Novo Cliente"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Razão Social / Nome Fantasia *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Petrobras S.A."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              CNPJ *
            </label>
            <input
              type="text"
              required
              placeholder="00.000.000/0001-00"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              E-mail de Contato *
            </label>
            <input
              type="email"
              required
              placeholder="contato@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
              Telefone
            </label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.375rem', color: '#fff' }}
            />
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="primary-button" style={{ flex: 1 }}>
              Salvar Cliente
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
