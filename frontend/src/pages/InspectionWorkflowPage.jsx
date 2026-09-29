import { useMemo, useState } from 'react';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Input from '../components/Input';
import { inspectionQuestions, equipment } from '../data/mockData';

const statusTone = {
  conforme: 'success',
  'não conforme': 'danger',
  pendente: 'warning',
};

export default function InspectionWorkflowPage({ inspection, onComplete, onBack }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState('');
  const [nonConformity, setNonConformity] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const question = inspectionQuestions[index];
  const currentAnswer = answers[question.id];
  const progress = useMemo(() => ((index + 1) / inspectionQuestions.length) * 100, [index]);

  const setAnswer = (value) => {
    setAnswers((current) => ({ ...current, [question.id]: value }));
  };

  const nextQuestion = () => {
    if (index < inspectionQuestions.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    setShowSummary(true);
  };

  const prevQuestion = () => {
    if (index > 0) {
      setIndex((current) => current - 1);
    }
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhoto(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const conformantCount = Object.values(answers).filter((value) => value === 'conforme').length;
  const nonConformantCount = Object.values(answers).filter((value) => value === 'não conforme').length;

  if (showSummary) {
    return (
      <div className="inspection-flow">
        <div className="page-header">
          <div>
            <span className="eyebrow">Resumo</span>
            <h1>Resumo da inspeção</h1>
          </div>
        </div>

        <div className="summary-grid workflow-summary">
          <div className="summary-card">
            <label>Equipamento</label>
            <strong>{inspection?.equipment ?? equipment[0].name}</strong>
          </div>
          <div className="summary-card">
            <label>Técnico</label>
            <strong>{inspection?.technician ?? 'Ana Costa'}</strong>
          </div>
          <div className="summary-card">
            <label>Data</label>
            <strong>{inspection?.date ?? '14/09/2026'}</strong>
          </div>
          <div className="summary-card">
            <label>Perguntas</label>
            <strong>{inspectionQuestions.length}</strong>
          </div>
          <div className="summary-card">
            <label>Conformes</label>
            <strong>{conformantCount}</strong>
          </div>
          <div className="summary-card">
            <label>Não conformes</label>
            <strong>{nonConformantCount}</strong>
          </div>
        </div>

        <div className="summary-panels">
          <div className="summary-box">
            <h3>Observações</h3>
            <p>{notes || 'Nenhuma observação registrada.'}</p>
          </div>
          <div className="summary-box">
            <h3>Evidências</h3>
            {photo ? <img src={photo} alt="Evidência fotográfica" className="summary-photo" /> : <p>Nenhuma foto anexada.</p>}
          </div>
        </div>

        <div className="inspection-actions footer-actions">
          <Button variant="secondary" onClick={() => setShowSummary(false)}>Voltar</Button>
          <Button onClick={() => onComplete()}>Finalizar inspeção</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="inspection-flow">
      <div className="page-header compact-header">
        <div>
          <span className="eyebrow">Checklist</span>
          <h1>Pergunta {index + 1} de {inspectionQuestions.length}</h1>
        </div>
        <Badge tone={statusTone[currentAnswer] ?? 'primary'}>{currentAnswer ? currentAnswer : 'Pendente'}</Badge>
      </div>

      <div className="progress-block large">
        <div className="progress-meta"><span>Progresso</span><strong>{Math.round(progress)}%</strong></div>
        <div className="progress-track">
          <div className="progress-fill primary" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="question-card">
        <h2>{question.question}</h2>
        <div className="option-group">
          <button
            type="button"
            className={`option-button ${currentAnswer === 'conforme' ? 'selected success' : ''}`}
            onClick={() => {
              setAnswer('conforme');
              setNonConformity('');
            }}
          >
            Conforme
          </button>
          <button
            type="button"
            className={`option-button ${currentAnswer === 'não conforme' ? 'selected danger' : ''}`}
            onClick={() => setAnswer('não conforme')}
          >
            Não conforme
          </button>
        </div>

        {currentAnswer === 'não conforme' ? (
          <div className="nonconformity-panel">
            <Input label="Descrição da não conformidade" value={nonConformity} onChange={(event) => setNonConformity(event.target.value)} placeholder="Descreva o problema encontrado" />
            <label className="field">
              <span>Observação</span>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Registre a observação da inspeção" />
            </label>
            <div className="upload-box">
              <label className="upload-trigger">
                <input type="file" accept="image/*" onChange={handlePhoto} />
                <span>Adicionar foto</span>
              </label>
              {photo ? (
                <div className="photo-preview">
                  <img src={photo} alt="Evidência" />
                  <button type="button" className="link-button" onClick={() => setPhoto('')}>Remover</button>
                </div>
              ) : (
                <div className="empty-photo">Nenhuma foto anexada.</div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="inspection-actions">
        <Button variant="secondary" onClick={prevQuestion} disabled={index === 0}>Voltar</Button>
        <Button onClick={nextQuestion}>{index < inspectionQuestions.length - 1 ? 'Próxima pergunta' : 'Resumo da inspeção'}</Button>
      </div>
    </div>
  );
}
