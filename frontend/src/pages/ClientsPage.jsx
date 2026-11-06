import { useState, useEffect } from 'react';
import { clientsApi } from '../core/services/api';
import { DataTable } from '../shared/components/DataTable';
import { ModalDrawer } from '../shared/components/ModalDrawer';

export const ClientsPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', cnpj: '', email: '', phone: '' });

  const columns = [
    { header: 'Nome da Empresa', key: 'name' },
    { header: 'CNPJ', key: 'cnpj' },
    { header: 'E-mail de Contato', key: 'email' },
    { header: 'Telefone', key: 'phone' },
    { header: 'Plantas Ativas', key: 'locationsCount' },
  ];

  // Carrega clientes diretamente do banco via API Spring Boot
  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsApi.getAll();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar clientes do banco:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await clientsApi.create(formData);
      setCustomers((prev) => [created, ...prev]);
      setFormData({ name: '', cnpj: '', email: '', phone: '' });
      setIsDrawerOpen(false);
    } catch (err) {
      alert('Erro ao salvar cliente no banco de dados: ' + (err?.response?.data?.message || err.message));
    }
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
        onRowAction={(row) => alert(`Cliente: ${row.name}\nCNPJ: ${row.cnpj || row.document}`)}
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

export default ClientsPage;
