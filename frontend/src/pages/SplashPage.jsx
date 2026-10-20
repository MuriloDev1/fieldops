import Button from '../components/Button';

export default function SplashPage({ onContinue }) {
  return (
    <div className="splash-screen">
      <div className="splash-card">
        <div className="brand-mark large">F</div>
        <span className="eyebrow">FieldOps</span>
        <h1>Operação segura e confiável em campo.</h1>
        <p>Plataforma para inspeções técnicas, não conformidades, evidências e acompanhamento de equipes.</p>
        <Button onClick={onContinue} className="splash-button">Acessar plataforma</Button>
      </div>
    </div>
  );
}
