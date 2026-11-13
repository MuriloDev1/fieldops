import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../core/context/AuthContext';
import { useToast } from '../core/context/ToastContext';
import { ROLE_LABELS, normalizeRole } from '../core/permissions';

const ROLE_DESCRIPTIONS = {
  ADMIN: 'Gerencia usuários, permissões e configurações gerais do sistema.',
  SUPERVISOR: 'Acompanha inspeções, monitora técnicos e supervisiona resultados.',
  TECHNICIAN: 'Executa inspeções, preenche checklists e registra não conformidades.',
  CLIENT: 'Acompanha indicadores, histórico e relatórios das suas unidades.',
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const role = normalizeRole(user?.role);
  const name = user?.name || 'Usuário';
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Conta</span>
          <h1>Perfil</h1>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h3>{name}</h3>
            <p>{ROLE_LABELS[role]}</p>
          </div>
        </div>

        <div className="profile-info">
          <div><label>E-mail</label><strong>{user?.email || '—'}</strong></div>
          <div><label>Perfil de acesso</label><strong>{ROLE_LABELS[role]}</strong></div>
          <div><label>Situação</label><strong>{user?.status === 'INACTIVE' ? 'Inativo' : 'Ativo'}</strong></div>
          <div><label>Responsabilidades</label><strong>{ROLE_DESCRIPTIONS[role]}</strong></div>
        </div>

        <div className="profile-actions">
          <Button variant="secondary" onClick={() => toast.info('A edição de perfil será liberada em breve.')}>Editar perfil</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Voltar</Button>
          <Button variant="danger" onClick={logout}>Sair da conta</Button>
        </div>
      </div>
    </>
  );
}
