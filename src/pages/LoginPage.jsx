import Button from '../components/Button';
import Input from '../components/Input';

export default function LoginPage({ onLogin }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">F</div>
          <div>
            <strong>FIELDOPS</strong>
            <span>Gestão de inspeções técnicas</span>
          </div>
        </div>

        <h1>Entrar na plataforma</h1>
        <p className="auth-subtitle">Acesse o painel operacional para gerenciar inspeções e ordens de serviço.</p>

        <form className="auth-form" onSubmit={(event) => { event.preventDefault(); onLogin(); }}>
          <Input label="E-mail" name="email" type="email" value="tecnico@fieldops.com" onChange={() => {}} placeholder="seu@email.com" />
          <Input label="Senha" name="password" type="password" value="********" onChange={() => {}} placeholder="Sua senha" />
          <div className="auth-row">
            <label className="checkbox-row">
              <input type="checkbox" defaultChecked />
              <span>Lembrar acesso</span>
            </label>
            <button type="button" className="link-button text-button">Esqueci minha senha</button>
          </div>
          <Button type="submit" className="auth-submit">Entrar</Button>
        </form>
      </div>
    </div>
  );
}
