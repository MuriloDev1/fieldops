const quickItems = [
  { label: 'Bomba Submersa 04', detail: 'Falha crítica reportada', status: 'danger' },
  { label: 'Válvula de Pressão B', detail: 'Manutenção atrasada há 2 dias', status: 'warning' },
  { label: 'Relatório Diário', detail: 'Pendente aprovação do supervisor', status: 'info' },
];

const rows = [
  { local: 'Unidade de Extração Alpha', equipment: 'Bomba Submersa 04', date: '24 Out 2023, 08:30', status: 'Crítico' },
  { local: 'Refinaria Central', equipment: 'Válvula de Pressão B', date: '23 Out 2023, 14:15', status: 'Alta' },
  { local: 'Terminal Marítimo Sul', equipment: 'Correia Transportadora 2', date: '22 Out 2023, 09:45', status: 'Baixa' },
  { local: 'Planta de Processamento', equipment: 'Compressor Principal', date: '21 Out 2023, 11:20', status: 'Alta' },
  { local: 'Unidade de Extração Beta', equipment: 'Painel Elétrico Leste', date: '21 Out 2023, 16:00', status: 'Crítico' },
];

const navItems = ['Dashboard', 'Operations', 'Team Management', 'Analytics', 'Reports', 'Settings'];

function App() {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-logo">OpsControl Pro</div>
        </div>

        <nav className="side-nav" aria-label="Menu lateral">
          {navItems.map((item, index) => (
            <button
              key={item}
              className={`nav-item ${index === 0 ? 'active' : ''}`}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">
                {index === 0 && '▣'}
                {index === 1 && '◫'}
                {index === 2 && '◍'}
                {index === 3 && '▤'}
                {index === 4 && '▨'}
                {index === 5 && '⚙'}
              </span>
              {item}
            </button>
          ))}
        </nav>

        <div className="profile-card">
          <div className="avatar-circle">👤</div>
          <div>
            <div className="profile-name">Supervisor Profile</div>
            <div className="profile-role">Regional Supervisor</div>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="search-box">
            <span>⌕</span>
            <input type="text" placeholder="Search operations, teams, or reports..." />
          </div>

          <div className="topbar-actions">
            <button type="button" aria-label="Notificações">🔔</button>
            <button type="button" aria-label="Ajuda">?</button>
            <button type="button" aria-label="Perfil">👤</button>
          </div>
        </header>

        <section className="content">
          <div className="page-title-wrap">
            <h1>Dashboard</h1>
            <p>Visão geral operacional e acompanhamento de campo.</p>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-head">
                <span>Inspeções Concluídas</span>
                <span className="stat-icon blue">✓</span>
              </div>
              <div className="stat-value">1,284</div>
              <div className="stat-foot positive">+5.2% vs mês anterior</div>
            </article>

            <article className="stat-card">
              <div className="stat-head">
                <span>Taxa de Não Conformidade</span>
                <span className="stat-icon yellow">!</span>
              </div>
              <div className="stat-value">12.5%</div>
              <div className="stat-foot warning">Atenção requerida</div>
            </article>

            <article className="stat-card">
              <div className="stat-head">
                <span>Técnicos em Campo</span>
                <span className="stat-icon silver">◌</span>
              </div>
              <div className="stat-value">42</div>
              <div className="stat-foot positive">● Status ativo</div>
            </article>

            <article className="stat-card danger">
              <div className="stat-head">
                <span>Inspeções Atrasadas</span>
                <span className="stat-icon red">!</span>
              </div>
              <div className="stat-value red">15</div>
              <div className="stat-foot red">Ação imediata necessária</div>
            </article>
          </div>

          <div className="two-column">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Andamento Semanal</h2>
                </div>
                <button type="button" className="pill-button">7 dias ▾</button>
              </div>

              <div className="chart" aria-label="Gráfico semanal">
                <div className="y-axis">
                  <span>200</span>
                  <span>150</span>
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>

                <div className="chart-area">
                  <div className="grid-line" />
                  <div className="grid-line" />
                  <div className="grid-line" />
                  <div className="grid-line" />

                  <div className="bars">
                    {[65, 95, 72, 125, 105, 155, 142].map((value, index) => (
                      <div key={index} className="bar-column">
                        <div className="bar" style={{ height: `${(value / 200) * 100}%` }} />
                        <span>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel actions-panel">
              <div className="panel-header small-header">
                <div>
                  <h2>Ação Rápida</h2>
                </div>
                <button type="button" className="menu-button">⋮</button>
              </div>

              <div className="quick-list">
                {quickItems.map((item) => (
                  <div key={item.label} className="quick-item">
                    <div className={`quick-icon ${item.status}`} aria-hidden="true">
                      {item.status === 'danger' && '!'}
                      {item.status === 'warning' && '◔'}
                      {item.status === 'info' && '▣'}
                    </div>

                    <div className="quick-copy">
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </div>

                    <button type="button" className="link-button">Ver</button>
                  </div>
                ))}
              </div>

              <button type="button" className="primary-button">Atribuir Tarefas</button>
            </section>
          </div>

          <section className="panel table-panel">
            <div className="panel-header table-header">
              <div>
                <h2>Acompanhamento de Não Conformidades</h2>
              </div>

              <div className="filters">
                <button type="button" className="toolbar-button">Filtrar</button>
                <button type="button" className="toolbar-button">Exportar</button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Local</th>
                  <th>Equipamento</th>
                  <th>Data da inspeção</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.local}-${row.equipment}`}>
                    <td>{row.local}</td>
                    <td>{row.equipment}</td>
                    <td>{row.date}</td>
                    <td>
                      <span className={`status-badge ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="action-cell"><button type="button">Detalhes</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="table-footer">
              <span>Mostrando 1-5 de 24 registros</span>
              <div className="pagination">
                <button type="button">‹</button>
                <button type="button" className="active">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">›</button>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;