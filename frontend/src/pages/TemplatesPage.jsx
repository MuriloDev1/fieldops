import { useState, useEffect } from 'react';
import { DataTable } from '../shared/components/DataTable';
import { ModalDrawer } from '../shared/components/ModalDrawer';
import { StatusBadge } from '../shared/components/StatusBadge';
import { templatesApi } from '../core/services/api';
import { Plus, ListChecks, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const fallbackTemplates = [
  {
    id: 'tmpl-1001',
    title: 'Checklist Preventivo de Bomba Hidráulica',
    description: 'Verificação periódica de selagem mecânica, rolamentos, vibração e pressão de sucção.',
    status: 'ACTIVE',
    versionNumber: 1,
    sectionsCount: 3,
    itemsCount: 10,
  },
  {
    id: 'tmpl-1002',
    title: 'Inspeção Elétrica de Subestação',
    description: 'Termografia, integridade de painéis CCM, aterramento e disjuntores de média tensão.',
    status: 'ACTIVE',
    versionNumber: 2,
    sectionsCount: 4,
    itemsCount: 15,
  },
  {
    id: 'tmpl-1003',
    title: 'Checklist de Segurança e Caldeiras',
    description: 'Inspeção NR-13 para vasos de pressão, válvulas de segurança e manômetros.',
    status: 'ACTIVE',
    versionNumber: 1,
    sectionsCount: 3,
    itemsCount: 12,
  },
];

export const TemplatesPage = () => {
  const [templates, setTemplates] = useState(fallbackTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeVersionDetails, setActiveVersionDetails] = useState(null);
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Template Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sections: [
      {
        title: 'Inspeção Visual e Segurança',
        orderIndex: 0,
        items: [
          { text: 'Equipamento limpo e desobstruído?', responseType: 'CONFORM_NON_CONFORM', required: true, orderIndex: 0 },
          { text: 'Presença de ruídos ou vibrações anormais?', responseType: 'CONFORM_NON_CONFORM', required: true, orderIndex: 1 },
        ],
      },
    ],
  });

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await templatesApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setTemplates(data);
      }
    } catch (err) {
      console.warn('Usando dados de fallback para modelos de checklist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    setActiveVersionDetails(null);
    try {
      const details = await templatesApi.getActiveVersion(template.id);
      if (details) setActiveVersionDetails(details);
    } catch (err) {
      console.warn('Erro ao carregar versão ativa:', err);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const created = await templatesApi.create(formData);
      setTemplates((prev) => [created, ...prev]);
      setIsNewDrawerOpen(false);
      setFormData({
        title: '',
        description: '',
        sections: [
          {
            title: 'Inspeção Visual e Segurança',
            orderIndex: 0,
            items: [
              { text: 'Equipamento limpo e desobstruído?', responseType: 'CONFORM_NON_CONFORM', required: true, orderIndex: 0 },
              { text: 'Presença de ruídos ou vibrações anormais?', responseType: 'CONFORM_NON_CONFORM', required: true, orderIndex: 1 },
            ],
          },
        ],
      });
      alert('Modelo de checklist criado com sucesso!');
    } catch (err) {
      alert('Erro ao criar modelo: ' + (err.message || 'Verifique os dados'));
    }
  };

  const handlePublishNewVersion = async (templateId) => {
    if (!confirm('Deseja publicar uma nova versão imutável deste checklist? Todas as novas inspeções passarão a utilizar a nova versão.')) {
      return;
    }
    try {
      await templatesApi.publish(templateId, {
        title: selectedTemplate?.title,
        description: 'Revisão periódica de conformidade operacional',
      });
      alert('Nova versão publicada com sucesso!');
      loadTemplates();
      setSelectedTemplate(null);
    } catch (err) {
      alert('Erro ao publicar versão: ' + err.message);
    }
  };

  const columns = [
    {
      header: 'Título do Modelo',
      key: 'title',
      render: (val, row) => (
        <div>
          <strong style={{ color: '#f8fafc', display: 'block' }}>{val}</strong>
          <small style={{ color: '#94a3b8' }}>{row.description}</small>
        </div>
      ),
    },
    {
      header: 'Versão Ativa',
      key: 'versionNumber',
      render: (val) => (
        <span
          style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            fontWeight: 600,
            fontSize: '0.8rem',
          }}
        >
          v{val || 1}.0
        </span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val === 'ACTIVE' ? 'OK' : 'Desativado'} />,
    },
  ];

  return (
    <>
      <div className="page-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Modelos de Checklist & Versões</h1>
          <p>Catálogo central de checklists dinâmicos com controle de versões imutáveis.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewDrawerOpen(true)}
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
          <Plus size={18} />
          Novo Modelo
        </button>
      </div>

      <DataTable
        title="Checklists Cadastrados"
        columns={columns}
        data={templates}
        totalCount={templates.length}
        currentPage={1}
        onRowAction={(row) => handleSelectTemplate(row)}
      />

      {/* Drawer: Visualizar Versão Imutável do Checklist */}
      <ModalDrawer
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title="Checklist & Versão Imutável"
      >
        {selectedTemplate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
                  Versão Oficial: v{selectedTemplate.versionNumber || 1}.0
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  Imutável
                </span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>{selectedTemplate.title}</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.875rem' }}>{selectedTemplate.description}</p>
            </div>

            {/* Checklist items breakdown */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#cbd5e1', fontSize: '0.95rem' }}>
                Itens do Checklist
              </h4>

              {activeVersionDetails?.sections && activeVersionDetails.sections.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeVersionDetails.sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} style={{ backgroundColor: '#0f172a', borderRadius: '6px', padding: '0.75rem', border: '1px solid #334155' }}>
                      <strong style={{ color: '#38bdf8', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
                        {section.orderIndex + 1}. {section.title}
                      </strong>
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {section.items?.map((item, iIdx) => (
                          <li key={item.id || iIdx}>
                            {item.text} {item.required && <span style={{ color: '#ef4444' }}>*</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '6px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>1. Inspeção de integridade física e fixação</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>2. Checagem de temperatura, vibração e ruído</p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>3. Verificação de vazamentos e vedações</p>
                  <p style={{ margin: 0 }}>4. Teste de parada de emergência e intertravamento</p>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
              <button
                type="button"
                onClick={() => handlePublishNewVersion(selectedTemplate.id)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <ArrowUpRight size={18} />
                Publicar Nova Versão Imutável
              </button>
            </div>
          </div>
        )}
      </ModalDrawer>

      {/* Drawer: Criar Novo Modelo */}
      <ModalDrawer
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        title="Novo Modelo de Checklist"
      >
        <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Título do Modelo *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Checklist Trimestral de Compressores"
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
              Descrição Operacional *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o escopo e as normas aplicadas..."
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
              onClick={() => setIsNewDrawerOpen(false)}
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
              Salvar Modelo
            </button>
          </div>
        </form>
      </ModalDrawer>
    </>
  );
};

export default TemplatesPage;
