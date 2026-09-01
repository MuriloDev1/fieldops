import React, { useState } from "react";

import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  useWindowDimensions,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

/* =========================================================
   TIPOS
========================================================= */

type Tela =
  | "dashboard"
  | "inspecoes"
  | "equipamentos"
  | "perfil";

type StatusEquipamento =
  | "Ativo"
  | "Manutenção"
  | "Inativo";

interface Equipamento {
  id: string;
  nome: string;
  codigo: string;
  local: string;
  tipo: string;
  responsavel: string;
  status: StatusEquipamento;
}

interface Pergunta {
  id: number;
  texto: string;
  tipo: string;
  obrigatoria: boolean;
}

/* =========================================================
   DADOS
========================================================= */

const equipamentosIniciais: Equipamento[] = [
  {
    id: "1",
    nome: "Compressor Industrial 01",
    codigo: "EQP-001",
    local: "Refinaria Central",
    tipo: "Compressor",
    responsavel: "João Silva",
    status: "Ativo",
  },
  {
    id: "2",
    nome: "Gerador Diesel 02",
    codigo: "EQP-002",
    local: "Unidade Sul",
    tipo: "Gerador",
    responsavel: "Carlos Oliveira",
    status: "Ativo",
  },
  {
    id: "3",
    nome: "Bomba Submersa 04",
    codigo: "EQP-003",
    local: "Unidade Alpha",
    tipo: "Bomba",
    responsavel: "Maria Souza",
    status: "Manutenção",
  },
  {
    id: "4",
    nome: "Válvula de Pressão B",
    codigo: "EQP-004",
    local: "Refinaria Central",
    tipo: "Válvula",
    responsavel: "Ana Costa",
    status: "Ativo",
  },
  {
    id: "5",
    nome: "Painel Elétrico Leste",
    codigo: "EQP-005",
    local: "Unidade Beta",
    tipo: "Painel",
    responsavel: "Pedro Santos",
    status: "Inativo",
  },
];

const perguntasIniciais: Pergunta[] = [
  {
    id: 1,
    texto: "O equipamento está em boas condições?",
    tipo: "Sim / Não",
    obrigatoria: true,
  },
  {
    id: 2,
    texto: "Qual o nível de pressão?",
    tipo: "Múltipla escolha",
    obrigatoria: true,
  },
  {
    id: 3,
    texto: "Existe algum vazamento?",
    tipo: "Sim / Não",
    obrigatoria: false,
  },
];

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [tela, setTela] = useState<Tela>("dashboard");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#062B57"
      />

      {tela === "dashboard" && (
        <DashboardScreen navegar={setTela} />
      )}

      {tela === "inspecoes" && (
        <InspecoesScreen />
      )}

      {tela === "equipamentos" && (
        <EquipamentosScreen />
      )}

      {tela === "perfil" && (
        <PerfilScreen />
      )}

      <BottomNavigation
        telaAtual={tela}
        navegar={setTela}
      />
    </SafeAreaView>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerLogo}>
          OpsControlPro
        </Text>

        <Text style={styles.headerTitulo}>
          {titulo}
        </Text>

        {subtitulo && (
          <Text style={styles.headerSubtitulo}>
            {subtitulo}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.avatarHeader}>
        <MaterialIcons
          name="person"
          size={22}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function DashboardScreen({
  navegar,
}: {
  navegar: (tela: Tela) => void;
}) {
  const { width } = useWindowDimensions();

  const desktop = width >= 900;

  return (
    <View style={styles.flex}>
      <Header
        titulo="Dashboard"
        subtitulo="Visão geral operacional"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          desktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* TÍTULO */}

        <View style={styles.pageTitle}>
          <Text style={styles.pageTitleText}>
            Dashboard
          </Text>

          <Text style={styles.pageDescription}>
            Visão geral operacional e acompanhamento
            das atividades de campo.
          </Text>
        </View>

        {/* INDICADORES */}

        <View
          style={[
            styles.statsContainer,
            desktop && styles.statsContainerDesktop,
          ]}
        >
          <StatCard
            titulo="Inspeções Concluídas"
            valor="1.284"
            descricao="+5,2% vs mês anterior"
            icone="check-circle"
            tipo="success"
          />

          <StatCard
            titulo="Taxa de Não Conformidade"
            valor="12,5%"
            descricao="Atenção requerida"
            icone="warning"
            tipo="warning"
          />

          <StatCard
            titulo="Técnicos em Campo"
            valor="42"
            descricao="Status ativo"
            icone="people"
            tipo="info"
          />

          <StatCard
            titulo="Inspeções Atrasadas"
            valor="15"
            descricao="Ação necessária"
            icone="error"
            tipo="danger"
          />
        </View>

        {/* ANDAMENTO */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Andamento Semanal
              </Text>

              <Text style={styles.cardSubtitle}>
                Últimos 7 dias
              </Text>
            </View>

            <TouchableOpacity style={styles.periodButton}>
              <Text style={styles.periodText}>
                7 dias
              </Text>

              <MaterialIcons
                name="keyboard-arrow-down"
                size={18}
                color="#56667D"
              />
            </TouchableOpacity>
          </View>

          <WeeklyChart />
        </View>

        {/* AÇÕES RÁPIDAS */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Ações Rápidas
              </Text>

              <Text style={styles.cardSubtitle}>
                Atividades que precisam de atenção
              </Text>
            </View>
          </View>

          <QuickAction
            icon="error"
            title="Bomba Submersa 04"
            description="Falha crítica reportada - Unidade Alpha"
            type="danger"
          />

          <QuickAction
            icon="schedule"
            title="Válvula de Pressão B"
            description="Manutenção atrasada há 2 dias"
            type="warning"
          />

          <QuickAction
            icon="description"
            title="Relatório Diário"
            description="Pendente de aprovação do supervisor"
            type="info"
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navegar("inspecoes")}
          >
            <MaterialIcons
              name="assignment"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              Atribuir Tarefas
            </Text>
          </TouchableOpacity>
        </View>

        {/* NÃO CONFORMIDADES */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Não Conformidades
              </Text>

              <Text style={styles.cardSubtitle}>
                Acompanhamento das inspeções
              </Text>
            </View>

            <TouchableOpacity style={styles.filterButton}>
              <MaterialIcons
                name="filter-list"
                size={17}
                color="#50617A"
              />

              <Text style={styles.filterText}>
                Filtrar
              </Text>
            </TouchableOpacity>
          </View>

          <NonCompliance
            local="Unidade de Extração Alpha"
            equipamento="Bomba Submersa 04"
            status="Crítico"
          />

          <NonCompliance
            local="Refinaria Central"
            equipamento="Válvula de Pressão B"
            status="Alta"
          />

          <NonCompliance
            local="Terminal Marítimo Sul"
            equipamento="Correia Transportadora 2"
            status="Baixa"
          />

          <NonCompliance
            local="Planta de Processamento"
            equipamento="Compressor Principal"
            status="Alta"
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  titulo,
  valor,
  descricao,
  icone,
  tipo,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  icone: keyof typeof MaterialIcons.glyphMap;
  tipo: "success" | "warning" | "info" | "danger";
}) {
  return (
    <View
      style={[
        styles.statCard,
        tipo === "danger" && styles.statCardDanger,
      ]}
    >
      <View style={styles.statTop}>
        <Text style={styles.statTitle}>
          {titulo}
        </Text>

        <View
          style={[
            styles.statIcon,
            tipo === "success" && styles.iconSuccess,
            tipo === "warning" && styles.iconWarning,
            tipo === "info" && styles.iconInfo,
            tipo === "danger" && styles.iconDanger,
          ]}
        >
          <MaterialIcons
            name={icone}
            size={18}
            color={
              tipo === "success"
                ? "#1F6AB8"
                : tipo === "warning"
                ? "#D98A00"
                : tipo === "info"
                ? "#28639E"
                : "#D12D35"
            }
          />
        </View>
      </View>

      <Text
        style={[
          styles.statValue,
          tipo === "danger" && styles.statValueDanger,
        ]}
      >
        {valor}
      </Text>

      <Text
        style={[
          styles.statDescription,
          tipo === "success" && styles.successText,
          tipo === "warning" && styles.warningText,
          tipo === "info" && styles.infoText,
          tipo === "danger" && styles.dangerText,
        ]}
      >
        {descricao}
      </Text>
    </View>
  );
}

/* =========================================================
   GRÁFICO
========================================================= */

function WeeklyChart() {
  const valores = [
    65,
    95,
    72,
    125,
    105,
    155,
    142,
  ];

  const dias = [
    "Seg",
    "Ter",
    "Qua",
    "Qui",
    "Sex",
    "Sáb",
    "Dom",
  ];

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartLabels}>
        <Text style={styles.chartLabel}>200</Text>
        <Text style={styles.chartLabel}>150</Text>
        <Text style={styles.chartLabel}>100</Text>
        <Text style={styles.chartLabel}>50</Text>
        <Text style={styles.chartLabel}>0</Text>
      </View>

      <View style={styles.chart}>
        {[0, 25, 50, 75, 100].map(
          (position) => (
            <View
              key={position}
              style={[
                styles.chartGridLine,
                {
                  top: `${position}%`,
                },
              ]}
            />
          )
        )}

        <View style={styles.chartBars}>
          {valores.map(
            (valor, index) => (
              <View
                key={index}
                style={styles.barColumn}
              >
                <View
                  style={[
                    styles.bar,
                    {
                      height:
                        `${(valor / 200) * 100}%`,
                    },
                  ]}
                />

                <Text style={styles.barDay}>
                  {dias[index]}
                </Text>
              </View>
            )
          )}
        </View>
      </View>
    </View>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon,
  title,
  description,
  type,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  type: "danger" | "warning" | "info";
}) {
  return (
    <View style={styles.quickAction}>
      <View
        style={[
          styles.quickIcon,
          type === "danger" && styles.quickDanger,
          type === "warning" && styles.quickWarning,
          type === "info" && styles.quickInfo,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={19}
          color={
            type === "danger"
              ? "#D22F37"
              : type === "warning"
              ? "#DF8A00"
              : "#2E629A"
          }
        />
      </View>

      <View style={styles.quickContent}>
        <Text style={styles.quickTitle}>
          {title}
        </Text>

        <Text style={styles.quickDescription}>
          {description}
        </Text>
      </View>

      <TouchableOpacity>
        <Text style={styles.viewText}>
          Ver
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   NÃO CONFORMIDADE
========================================================= */

function NonCompliance({
  local,
  equipamento,
  status,
}: {
  local: string;
  equipamento: string;
  status: "Crítico" | "Alta" | "Baixa";
}) {
  return (
    <View style={styles.nonCompliance}>
      <View style={styles.nonTop}>
        <View style={styles.nonInfo}>
          <Text style={styles.nonLocal}>
            {local}
          </Text>

          <Text style={styles.nonEquipment}>
            {equipamento}
          </Text>
        </View>

        <StatusBadge status={status} />
      </View>

      <TouchableOpacity
        style={styles.detailsButton}
      >
        <Text style={styles.detailsText}>
          Ver detalhes
        </Text>

        <MaterialIcons
          name="chevron-right"
          size={18}
          color="#164878"
        />
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}: {
  status: "Crítico" | "Alta" | "Baixa";
}) {
  return (
    <View
      style={[
        styles.statusBadge,
        status === "Crítico" &&
          styles.statusCritical,
        status === "Alta" &&
          styles.statusHigh,
        status === "Baixa" &&
          styles.statusLow,
      ]}
    >
      <View
        style={[
          styles.statusDot,
          status === "Crítico" &&
            styles.dotCritical,
          status === "Alta" &&
            styles.dotHigh,
          status === "Baixa" &&
            styles.dotLow,
        ]}
      />

      <Text
        style={[
          styles.statusText,
          status === "Crítico" &&
            styles.textCritical,
          status === "Alta" &&
            styles.textHigh,
          status === "Baixa" &&
            styles.textLow,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

/* =========================================================
   INSPEÇÕES
========================================================= */

function InspecoesScreen() {
  const [nomeModelo, setNomeModelo] =
    useState(
      "Inspeção de Compressores Industriais"
    );

  const [perguntas, setPerguntas] =
    useState<Pergunta[]>(
      perguntasIniciais
    );

  const [mostrarTipos, setMostrarTipos] =
    useState(false);

  function adicionarPergunta() {
    const novaPergunta: Pergunta = {
      id: perguntas.length + 1,
      texto: "Nova pergunta de inspeção",
      tipo: "Sim / Não",
      obrigatoria: false,
    };

    setPerguntas([
      ...perguntas,
      novaPergunta,
    ]);
  }

  return (
    <View style={styles.flex}>
      <Header
        titulo="Inspeções"
        subtitulo="Construtor de modelos"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitleText}>
          Construtor de Inspeção
        </Text>

        <Text style={styles.pageDescription}>
          Crie e configure modelos de inspeção
          para sua equipe.
        </Text>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>
            Nome do modelo
          </Text>

          <TextInput
            value={nomeModelo}
            onChangeText={setNomeModelo}
            style={styles.input}
            placeholder="Digite o nome"
            placeholderTextColor="#9AA5B5"
          />
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() =>
              setMostrarTipos(!mostrarTipos)
            }
          >
            <View>
              <Text style={styles.cardTitle}>
                Tipos de Pergunta
              </Text>

              <Text style={styles.cardSubtitle}>
                Escolha o tipo de resposta
              </Text>
            </View>

            <MaterialIcons
              name={
                mostrarTipos
                  ? "keyboard-arrow-up"
                  : "keyboard-arrow-down"
              }
              size={23}
              color="#173C68"
            />
          </TouchableOpacity>

          {mostrarTipos && (
            <>
              <QuestionType
                icon="toggle-on"
                title="Sim / Não"
                description="Resposta binária"
              />

              <QuestionType
                icon="radio-button-checked"
                title="Múltipla escolha"
                description="Selecione uma opção"
              />

              <QuestionType
                icon="text-fields"
                title="Texto"
                description="Resposta livre"
              />

              <QuestionType
                icon="photo-camera"
                title="Foto"
                description="Registro fotográfico"
              />
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Perguntas
              </Text>

              <Text style={styles.cardSubtitle}>
                {perguntas.length} perguntas
                cadastradas
              </Text>
            </View>

            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {perguntas.length}
              </Text>
            </View>
          </View>

          {perguntas.map(
            (pergunta, index) => (
              <QuestionCard
                key={pergunta.id}
                numero={index + 1}
                pergunta={pergunta}
              />
            )
          )}

          <TouchableOpacity
            style={styles.addQuestion}
            onPress={adicionarPergunta}
          >
            <MaterialIcons
              name="add"
              size={20}
              color="#0B4A86"
            />

            <Text style={styles.addQuestionText}>
              Adicionar Pergunta
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
          >
            <MaterialIcons
              name="save"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.primaryButtonText}>
              Salvar Modelo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   TIPO DE PERGUNTA
========================================================= */

function QuestionType({
  icon,
  title,
  description,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <TouchableOpacity style={styles.questionType}>
      <View style={styles.questionTypeIcon}>
        <MaterialIcons
          name={icon}
          size={21}
          color="#15599A"
        />
      </View>

      <View>
        <Text style={styles.questionTypeTitle}>
          {title}
        </Text>

        <Text style={styles.questionTypeDescription}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   CARD DE PERGUNTA
========================================================= */

function QuestionCard({
  numero,
  pergunta,
}: {
  numero: number;
  pergunta: Pergunta;
}) {
  return (
    <View style={styles.questionCard}>
      <View style={styles.questionNumber}>
        <Text style={styles.questionNumberText}>
          {numero}
        </Text>
      </View>

      <View style={styles.questionContent}>
        <Text style={styles.questionText}>
          {pergunta.texto}
        </Text>

        <View style={styles.questionFooter}>
          <View style={styles.questionTag}>
            <Text style={styles.questionTagText}>
              {pergunta.tipo}
            </Text>
          </View>

          {pergunta.obrigatoria && (
            <Text style={styles.requiredText}>
              Obrigatória
            </Text>
          )}
        </View>
      </View>

      <MaterialIcons
        name="drag-handle"
        size={22}
        color="#9BA8B9"
      />
    </View>
  );
}

/* =========================================================
   EQUIPAMENTOS
========================================================= */

function EquipamentosScreen() {
  const [busca, setBusca] =
    useState("");

  const [
    equipamentoSelecionado,
    setEquipamentoSelecionado,
  ] =
    useState<Equipamento | null>(null);

  const equipamentos =
    equipamentosIniciais.filter(
      (item) =>
        item.nome
          .toLowerCase()
          .includes(busca.toLowerCase()) ||
        item.codigo
          .toLowerCase()
          .includes(busca.toLowerCase()) ||
        item.local
          .toLowerCase()
          .includes(busca.toLowerCase())
    );

  return (
    <View style={styles.flex}>
      <Header
        titulo="Equipamentos"
        subtitulo="Cadastro e acompanhamento"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitleText}>
              Equipamentos
            </Text>

            <Text style={styles.pageDescription}>
              Gerencie os equipamentos cadastrados.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addCircle}
          >
            <MaterialIcons
              name="add"
              size={25}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <MaterialIcons
            name="search"
            size={21}
            color="#7B8798"
          />

          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar equipamento..."
            placeholderTextColor="#8A96A8"
            style={styles.searchInput}
          />

          {busca.length > 0 && (
            <TouchableOpacity
              onPress={() => setBusca("")}
            >
              <MaterialIcons
                name="close"
                size={20}
                color="#7B8798"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={styles.activeFilter}
          >
            <MaterialIcons
              name="filter-list"
              size={17}
              color="#0B4B87"
            />

            <Text style={styles.activeFilterText}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.normalFilter}
          >
            <Text style={styles.normalFilterText}>
              Ativos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.normalFilter}
          >
            <Text style={styles.normalFilterText}>
              Manutenção
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.resultsText}>
          {equipamentos.length} equipamentos
        </Text>

        {equipamentos.map(
          (equipamento) => (
            <EquipmentCard
              key={equipamento.id}
              equipamento={equipamento}
              onPress={() =>
                setEquipamentoSelecionado(
                  equipamento
                )
              }
            />
          )
        )}
      </ScrollView>

      <Modal
        visible={
          equipamentoSelecionado !== null
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setEquipamentoSelecionado(null)
        }
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Detalhes do Equipamento
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setEquipamentoSelecionado(
                    null
                  )
                }
              >
                <MaterialIcons
                  name="close"
                  size={25}
                  color="#33445F"
                />
              </TouchableOpacity>
            </View>

            {equipamentoSelecionado && (
              <>
                <View style={styles.modalEquipmentIcon}>
                  <MaterialIcons
                    name="precision-manufacturing"
                    size={35}
                    color="#0B4B87"
                  />
                </View>

                <Text style={styles.modalEquipmentName}>
                  {equipamentoSelecionado.nome}
                </Text>

                <Text style={styles.modalEquipmentCode}>
                  {equipamentoSelecionado.codigo}
                </Text>

                <Detail
                  titulo="Local"
                  valor={
                    equipamentoSelecionado.local
                  }
                />

                <Detail
                  titulo="Tipo"
                  valor={
                    equipamentoSelecionado.tipo
                  }
                />

                <Detail
                  titulo="Responsável"
                  valor={
                    equipamentoSelecionado.responsavel
                  }
                />

                <Detail
                  titulo="Status"
                  valor={
                    equipamentoSelecionado.status
                  }
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    setEquipamentoSelecionado(
                      null
                    )
                  }
                >
                  <Text style={styles.primaryButtonText}>
                    Fechar
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   CARD EQUIPAMENTO
========================================================= */

function EquipmentCard({
  equipamento,
  onPress,
}: {
  equipamento: Equipamento;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.equipmentCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.equipmentTop}>
        <View style={styles.equipmentIcon}>
          <MaterialIcons
            name="precision-manufacturing"
            size={25}
            color="#0C4B86"
          />
        </View>

        <View style={styles.equipmentNameArea}>
          <Text style={styles.equipmentName}>
            {equipamento.nome}
          </Text>

          <Text style={styles.equipmentCode}>
            {equipamento.codigo}
          </Text>
        </View>

        <MaterialIcons
          name="more-vert"
          size={21}
          color="#708098"
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.equipmentInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            LOCAL
          </Text>

          <Text style={styles.infoValue}>
            {equipamento.local}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>
            TIPO
          </Text>

          <Text style={styles.infoValue}>
            {equipamento.tipo}
          </Text>
        </View>
      </View>

      <View style={styles.equipmentFooter}>
        <EquipmentStatus
          status={equipamento.status}
        />

        <Text style={styles.detailsEquipment}>
          Detalhes
        </Text>

        <MaterialIcons
          name="chevron-right"
          size={19}
          color="#174777"
        />
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   STATUS EQUIPAMENTO
========================================================= */

function EquipmentStatus({
  status,
}: {
  status: StatusEquipamento;
}) {
  return (
    <View
      style={[
        styles.equipmentStatus,
        status === "Ativo" &&
          styles.equipmentActive,
        status === "Manutenção" &&
          styles.equipmentMaintenance,
        status === "Inativo" &&
          styles.equipmentInactive,
      ]}
    >
      <View
        style={[
          styles.equipmentDot,
          status === "Ativo" &&
            styles.dotActive,
          status === "Manutenção" &&
            styles.dotMaintenance,
          status === "Inativo" &&
            styles.dotInactive,
        ]}
      />

      <Text
        style={[
          styles.equipmentStatusText,
          status === "Ativo" &&
            styles.textActive,
          status === "Manutenção" &&
            styles.textMaintenance,
          status === "Inativo" &&
            styles.textInactive,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

/* =========================================================
   DETAIL
========================================================= */

function Detail({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailTitle}>
        {titulo}
      </Text>

      <Text style={styles.detailValue}>
        {valor}
      </Text>
    </View>
  );
}

/* =========================================================
   PERFIL
========================================================= */

function PerfilScreen() {
  return (
    <View style={styles.flex}>
      <Header
        titulo="Perfil"
        subtitulo="Configurações do supervisor"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profile}>
          <View style={styles.profileAvatar}>
            <MaterialIcons
              name="person"
              size={55}
              color="#0B4B87"
            />
          </View>

          <Text style={styles.profileName}>
            Supervisor Profile
          </Text>

          <Text style={styles.profileRole}>
            Regional Supervisor
          </Text>
        </View>

        <View style={styles.card}>
          <ProfileItem
            icon="person-outline"
            title="Dados pessoais"
          />

          <ProfileItem
            icon="notifications-none"
            title="Notificações"
          />

          <ProfileItem
            icon="lock-outline"
            title="Segurança"
          />

          <ProfileItem
            icon="settings"
            title="Configurações"
          />

          <ProfileItem
            icon="help-outline"
            title="Ajuda"
          />
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <MaterialIcons
            name="logout"
            size={20}
            color="#C52C2C"
          />

          <Text style={styles.logoutText}>
            Sair da conta
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   PROFILE ITEM
========================================================= */

function ProfileItem({
  icon,
  title,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
}) {
  return (
    <TouchableOpacity style={styles.profileItem}>
      <MaterialIcons
        name={icon}
        size={22}
        color="#315A89"
      />

      <Text style={styles.profileItemText}>
        {title}
      </Text>

      <MaterialIcons
        name="chevron-right"
        size={22}
        color="#A0AABC"
      />
    </TouchableOpacity>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
========================================================= */

function BottomNavigation({
  telaAtual,
  navegar,
}: {
  telaAtual: Tela;
  navegar: (tela: Tela) => void;
}) {
  return (
    <View style={styles.bottomNavigation}>
      <NavItem
        icon="dashboard"
        title="Dashboard"
        active={telaAtual === "dashboard"}
        onPress={() =>
          navegar("dashboard")
        }
      />

      <NavItem
        icon="assignment"
        title="Inspeções"
        active={telaAtual === "inspecoes"}
        onPress={() =>
          navegar("inspecoes")
        }
      />

      <NavItem
        icon="precision-manufacturing"
        title="Equipamentos"
        active={telaAtual === "equipamentos"}
        onPress={() =>
          navegar("equipamentos")
        }
      />

      <NavItem
        icon="person"
        title="Perfil"
        active={telaAtual === "perfil"}
        onPress={() =>
          navegar("perfil")
        }
      />
    </View>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

function NavItem({
  icon,
  title,
  active,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.navIcon,
          active && styles.navIconActive,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={22}
          color={
            active
              ? "#0B4B87"
              : "#8190A5"
          }
        />
      </View>

      <Text
        style={[
          styles.navText,
          active && styles.navTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  flex: {
    flex: 1,
  },

  /* HEADER */

  header: {
    height: 76,
    backgroundColor: "#062B57",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLogo: {
    color: "#8DB7E5",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  headerTitulo: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 2,
  },

  headerSubtitulo: {
    color: "#AFC2D9",
    fontSize: 9,
    marginTop: 2,
  },

  avatarHeader: {
    width: 39,
    height: 39,
    borderRadius: 22,
    backgroundColor: "#123F70",
    alignItems: "center",
    justifyContent: "center",
  },

  /* SCROLL */

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  scrollContentDesktop: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
  },

  /* TÍTULO */

  pageTitle: {
    marginBottom: 17,
  },

  pageTitleText: {
    color: "#1E2734",
    fontSize: 24,
    fontWeight: "700",
  },

  pageDescription: {
    color: "#68788F",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },

  /* STATS */

  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  statsContainerDesktop: {
    flexWrap: "nowrap",
  },

  statCard: {
    width: "48.5%",
    minHeight: 130,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE4EB",
    borderRadius: 8,
    padding: 13,
    marginBottom: 11,
  },

  statCardDanger: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FFD5D5",
  },

  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  statTitle: {
    flex: 1,
    color: "#53637B",
    fontSize: 10,
    lineHeight: 14,
    paddingRight: 5,
  },

  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  iconSuccess: {
    backgroundColor: "#E9F1FB",
  },

  iconWarning: {
    backgroundColor: "#FFF2D9",
  },

  iconInfo: {
    backgroundColor: "#EAF1FB",
  },

  iconDanger: {
    backgroundColor: "#FBE1E1",
  },

  statValue: {
    color: "#202934",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 8,
  },

  statValueDanger: {
    color: "#C5262E",
  },

  statDescription: {
    fontSize: 9,
    marginTop: 3,
  },

  successText: {
    color: "#008F64",
  },

  warningText: {
    color: "#D88900",
  },

  infoText: {
    color: "#168C70",
  },

  dangerText: {
    color: "#D12B32",
  },

  /* CARD */

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE4EB",
    borderRadius: 8,
    marginBottom: 15,
    overflow: "hidden",
  },

  cardHeader: {
    minHeight: 61,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },

  cardTitle: {
    color: "#202934",
    fontSize: 14,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#748197",
    fontSize: 9,
    marginTop: 3,
  },

  /* GRÁFICO */

  periodButton: {
    borderWidth: 1,
    borderColor: "#D9E0E8",
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },

  periodText: {
    color: "#56667D",
    fontSize: 9,
  },

  chartContainer: {
    height: 230,
    paddingHorizontal: 14,
    paddingTop: 15,
    flexDirection: "row",
  },

  chartLabels: {
    width: 30,
    height: 170,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 6,
  },

  chartLabel: {
    color: "#738197",
    fontSize: 8,
  },

  chart: {
    flex: 1,
    height: 195,
    position: "relative",
  },

  chartGridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E9EDF2",
  },

  chartBars: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 175,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },

  barColumn: {
    height: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bar: {
    width: 18,
    maxHeight: 160,
    minHeight: 15,
    backgroundColor: "#1466B8",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  barDay: {
    color: "#64748B",
    fontSize: 8,
    marginTop: 7,
  },

  /* AÇÕES */

  quickAction: {
    minHeight: 67,
    paddingHorizontal: 13,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },

  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  quickDanger: {
    backgroundColor: "#FFE7E7",
  },

  quickWarning: {
    backgroundColor: "#FFF0D5",
  },

  quickInfo: {
    backgroundColor: "#EAF1FB",
  },

  quickContent: {
    flex: 1,
    marginLeft: 10,
  },

  quickTitle: {
    color: "#242D39",
    fontSize: 10,
    fontWeight: "700",
  },

  quickDescription: {
    color: "#68778E",
    fontSize: 8,
    marginTop: 3,
  },

  viewText: {
    color: "#123F70",
    fontSize: 9,
    fontWeight: "700",
  },

  primaryButton: {
    minHeight: 44,
    backgroundColor: "#062B57",
    borderRadius: 6,
    margin: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  /* FILTRO */

  filterButton: {
    borderWidth: 1,
    borderColor: "#DCE3EB",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  filterText: {
    color: "#536482",
    fontSize: 9,
  },

  /* NÃO CONFORMIDADE */

  nonCompliance: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EDF2",
  },

  nonTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  nonInfo: {
    flex: 1,
    paddingRight: 8,
  },

  nonLocal: {
    color: "#202833",
    fontSize: 10,
    fontWeight: "700",
  },

  nonEquipment: {
    color: "#66768F",
    fontSize: 9,
    marginTop: 3,
  },

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  detailsText: {
    color: "#174777",
    fontSize: 9,
    fontWeight: "600",
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statusCritical: {
    backgroundColor: "#FFF0F0",
  },

  statusHigh: {
    backgroundColor: "#FFF4DF",
  },

  statusLow: {
    backgroundColor: "#ECEFF3",
  },

  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  dotCritical: {
    backgroundColor: "#E23838",
  },

  dotHigh: {
    backgroundColor: "#E99A00",
  },

  dotLow: {
    backgroundColor: "#68768B",
  },

  statusText: {
    fontSize: 8,
    fontWeight: "600",
  },

  textCritical: {
    color: "#D12D2D",
  },

  textHigh: {
    color: "#D88700",
  },

  textLow: {
    color: "#59677E",
  },

  /* INSPEÇÕES */

  inputLabel: {
    color: "#45556C",
    fontSize: 10,
    fontWeight: "600",
    margin: 14,
    marginBottom: 7,
  },

  input: {
    height: 44,
    marginHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D7DEE8",
    borderRadius: 5,
    paddingHorizontal: 11,
    color: "#273345",
    fontSize: 11,
  },

  questionType: {
    minHeight: 60,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

  questionTypeIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#EDF4FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  questionTypeTitle: {
    color: "#263140",
    fontSize: 10,
    fontWeight: "700",
  },

  questionTypeDescription: {
    color: "#748197",
    fontSize: 8,
    marginTop: 2,
  },

  counter: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#EAF1FB",
    alignItems: "center",
    justifyContent: "center",
  },

  counterText: {
    color: "#14558E",
    fontSize: 10,
    fontWeight: "700",
  },

  questionCard: {
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },

  questionNumber: {
    width: 27,
    height: 27,
    borderRadius: 15,
    backgroundColor: "#092B55",
    alignItems: "center",
    justifyContent: "center",
  },

  questionNumberText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  questionContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 7,
  },

  questionText: {
    color: "#27303D",
    fontSize: 10,
    fontWeight: "600",
  },

  questionFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  questionTag: {
    backgroundColor: "#EDF2F8",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  questionTagText: {
    color: "#53647C",
    fontSize: 7,
  },

  requiredText: {
    color: "#D04A4A",
    fontSize: 7,
    marginLeft: 7,
  },

  addQuestion: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  addQuestionText: {
    color: "#0B4A86",
    fontSize: 10,
    fontWeight: "700",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  secondaryButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#D3DAE4",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: "#52627A",
    fontSize: 10,
    fontWeight: "600",
  },

  /* EQUIPAMENTOS */

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  addCircle: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#073263",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    height: 46,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE2EA",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    color: "#273345",
    fontSize: 10,
    marginLeft: 8,
  },

  filtersRow: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 15,
  },

  activeFilter: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 5,
    backgroundColor: "#EAF2FC",
    borderWidth: 1,
    borderColor: "#C8DDF3",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  activeFilterText: {
    color: "#0B4B87",
    fontSize: 9,
    fontWeight: "700",
  },

  normalFilter: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE3EA",
    alignItems: "center",
    justifyContent: "center",
  },

  normalFilterText: {
    color: "#66758D",
    fontSize: 9,
  },

  resultsText: {
    color: "#697991",
    fontSize: 9,
    marginBottom: 8,
  },

  equipmentCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE4EB",
    borderRadius: 7,
    padding: 12,
    marginBottom: 11,
  },

  equipmentTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  equipmentIcon: {
    width: 43,
    height: 43,
    borderRadius: 8,
    backgroundColor: "#EAF2FC",
    alignItems: "center",
    justifyContent: "center",
  },

  equipmentNameArea: {
    flex: 1,
    marginLeft: 10,
  },

  equipmentName: {
    color: "#222B38",
    fontSize: 11,
    fontWeight: "700",
  },

  equipmentCode: {
    color: "#6A7890",
    fontSize: 8,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDF0F4",
    marginVertical: 11,
  },

  equipmentInfo: {
    flexDirection: "row",
  },

  infoItem: {
    flex: 1,
  },

  infoLabel: {
    color: "#8A96A8",
    fontSize: 7,
    fontWeight: "700",
    marginBottom: 3,
  },

  infoValue: {
    color: "#45546C",
    fontSize: 9,
  },

  equipmentFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  equipmentStatus: {
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  equipmentActive: {
    backgroundColor: "#E6F7EF",
  },

  equipmentMaintenance: {
    backgroundColor: "#FFF1D9",
  },

  equipmentInactive: {
    backgroundColor: "#ECEEF2",
  },

  equipmentDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  dotActive: {
    backgroundColor: "#08A36A",
  },

  dotMaintenance: {
    backgroundColor: "#E99600",
  },

  dotInactive: {
    backgroundColor: "#68758A",
  },

  equipmentStatusText: {
    fontSize: 8,
    fontWeight: "600",
  },

  textActive: {
    color: "#00875B",
  },

  textMaintenance: {
    color: "#D38100",
  },

  textInactive: {
    color: "#657187",
  },

  detailsEquipment: {
    color: "#174777",
    fontSize: 9,
    fontWeight: "700",
    marginLeft: "auto",
  },

  /* MODAL */

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 30,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  modalTitle: {
    color: "#202936",
    fontSize: 16,
    fontWeight: "700",
  },

  modalEquipmentIcon: {
    width: 65,
    height: 65,
    borderRadius: 12,
    backgroundColor: "#EAF2FC",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  modalEquipmentName: {
    color: "#202A37",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },

  modalEquipmentCode: {
    color: "#728097",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 15,
  },

  detail: {
    borderTopWidth: 1,
    borderTopColor: "#EDF0F4",
    paddingVertical: 10,
  },

  detailTitle: {
    color: "#8995A7",
    fontSize: 8,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  detailValue: {
    color: "#354357",
    fontSize: 11,
    marginTop: 4,
  },

  /* PERFIL */

  profile: {
    alignItems: "center",
    paddingVertical: 25,
  },

  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#EAF2FC",
    alignItems: "center",
    justifyContent: "center",
  },

  profileName: {
    color: "#202A37",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  profileRole: {
    color: "#738198",
    fontSize: 10,
    marginTop: 4,
  },

  profileItem: {
    height: 58,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },

  profileItemText: {
    flex: 1,
    color: "#344257",
    fontSize: 11,
    marginLeft: 11,
  },

  logoutButton: {
    height: 46,
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD3D3",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  logoutText: {
    color: "#C52C2C",
    fontSize: 11,
    fontWeight: "700",
  },

  /* BARRA INFERIOR */

  bottomNavigation: {
    height: 68,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E1E6ED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  navItem: {
    flex: 1,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
  },

  navIcon: {
    width: 38,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  navIconActive: {
    backgroundColor: "#EAF2FC",
  },

  navText: {
    color: "#8190A5",
    fontSize: 8,
    marginTop: 2,
  },

  navTextActive: {
    color: "#0B4B87",
    fontWeight: "700",
  },
});