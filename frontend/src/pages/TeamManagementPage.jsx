import { useState, useEffect } from 'react';
import { DataTable } from '../shared/components/DataTable';
import { ModalDrawer } from '../shared/components/ModalDrawer';
import { StatusBadge } from '../shared/components/StatusBadge';
import { usersApi } from '../core/services/api';
import { UserPlus, Mail, Phone, Shield } from 'lucide-react';

const fallbackTeam = [
  { id: '1', name: 'Administrador do Sistema', email: 'admin@fieldops.com', role: 'ADMIN', status: 'ACTIVE', phone: '(11) 99999-0001' },
  { id: '2', name: 'Roberto Silva', email: 'supervisor@fieldops.com', role: 'SUPERVISOR', status: 'ACTIVE', phone: '(11) 99999-0002' },
  { id: '3', name: 'Carlos Lima', email: 'tecnico@fieldops.com', role: 'TECHNICIAN', status: 'ACTIVE', phone: '(11) 99999-0003' },
];

const roleLabels = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor Regional',
  TECHNICIAN: 'Técnico de Campo',
};

const statusLabels = {
  ACTIVE: 'OK',
  INACTIVE: 'Desativado',
  BLOCKED: 'Crítico',
};

export const TeamManagementPage = () => {
  const [users, setUsers] = useState(fallbackTeam);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN',
    phone: '',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      }
    } catch (err) {
      console.warn('Usando dados de fallback para equipe:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const created = await usersApi.create(formData);
      setUsers((prev) => [created, ...prev]);
      setIsDrawerOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
        phone: '',
      });
      alert('Colaborador cadastrado com sucesso!');
    } catch (err) {
      alert('Erro ao cadastrar colaborador: ' + (err.message || 'Verifique os dados'));
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await usersApi.updateStatus(user.id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      if (selectedUser?.id === user.id) setSelectedUser(updated);
    } catch (err) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  const columns = [
    {
      header: 'Nome',
      key: 'name',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#0284c7',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {val ? val.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'U'}
          </div>
          <div>
            <strong style={{ color: '#f8fafc', display: 'block' }}>{val}</strong>
            <small style={{ color: '#94a3b8' }}>{row.email}</small>
          </div>
        </div>
      ),
    },
    {
      header: 'Função',
      key: 'role',
      render: (val) => roleLabels[val] || val,
    },
    {
      header: 'Telefone',
      key: 'phone',
      render: (val) => val || '-',
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={statusLabels[val] || val} />,
    },
  ];

  return (
    <>
      <div className="page-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Gestão de Equipe</h1>
          <p>Acompanhamento de técnicos de campo, supervisores e credenciais de acesso.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.625rem 1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <UserPlus size={18} />
          Novo Colaborador
        </button>
      </div>

      <DataTable
        title="Membros da Equipe"
        columns={columns}
        data={users}
        totalCount={users.length}
        currentPage={1}
        onRowAction={(row) => setSelectedUser(row)}
      />

      {/* Drawer: Cadastrar Novo Colaborador */}
      <ModalDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Novo Colaborador"
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: João da Silva"
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              E-mail Corporativo *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="joao@fieldops.com"
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Senha de Acesso *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Papel / Perfil *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            >
              <option value="TECHNICIAN">Técnico de Campo</option>
              <option value="SUPERVISOR">Supervisor Operacional</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Telefone de Contato
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              style={{
                flex: 1,
                padding: '0.625rem',
                backgroundColor: '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.625rem',
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Salvar
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* Drawer: Detalhes do Usuário */}
      <ModalDrawer
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Detalhes do Colaborador"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.15rem' }}>{selectedUser.name}</h3>
              <p style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>{roleLabels[selectedUser.role] || selectedUser.role}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                <span>✉ {selectedUser.email}</span>
                <span>📞 {selectedUser.phone || 'Sem telefone cadastrado'}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                Ações Administrativas
              </label>
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedUser)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  backgroundColor: selectedUser.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {selectedUser.status === 'ACTIVE' ? 'Desativar Acesso' : 'Reativar Acesso'}
              </button>
            </div>
          </div>
        )}
      </ModalDrawer>
    </>
  );
};
