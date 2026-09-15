import Button from '../components/Button';

export default function ProfilePage() {
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
          <div className="profile-avatar">AC</div>
          <div>
            <h3>Ana Costa</h3>
            <p>Técnico de inspeções</p>
          </div>
        </div>

        <div className="profile-info">
          <div><label>E-mail</label><strong>ana.costa@fieldops.com</strong></div>
          <div><label>Unidade</label><strong>Planta Norte</strong></div>
          <div><label>Permissões</label><strong>Técnico</strong></div>
          <div><label>Último login</label><strong>Hoje, 08:20</strong></div>
        </div>

        <div className="profile-actions">
          <Button variant="secondary">Editar perfil</Button>
          <Button>Gerenciar permissões</Button>
        </div>
      </div>
    </>
  );
}
