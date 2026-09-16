import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path } from "react-native-svg";

const API_URL = "http://localhost:3000";

const OFFLINE_INSPECTIONS_STORAGE_KEY = "@fieldops/inspecoes-pendentes-offline";


/* =========================================================
   ASSINATURA COMPATÍVEL COM WEB E MOBILE
   Não usa WebView. Funciona no Expo Web e no Android/iOS.
========================================================= */
interface SignaturePadProps {
  onOK: (data: string) => void;
  onEmpty: () => void;
}

function SignaturePad({ onOK, onEmpty }: SignaturePadProps) {
  const [strokes, setStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const [padWidth, setPadWidth] = useState(600);
  const [padHeight, setPadHeight] = useState(260);

  const buildPath = (points: { x: number; y: number }[]) => {
    if (!points.length) return "";
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
    }

    return points.reduce((path, point, index) => {
      return index === 0
        ? `M ${point.x} ${point.y}`
        : `${path} L ${point.x} ${point.y}`;
    }, "");
  };

  const criarImagemAssinatura = () => {
    const todosOsTraços = [...strokes, currentStroke].filter(
      (stroke) => stroke.length > 0
    );

    if (!todosOsTraços.length) {
      onEmpty();
      return;
    }

    const paths = todosOsTraços
      .map(
        (stroke) =>
          `<path d="${buildPath(stroke)}" fill="none" stroke="#111827" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`
      )
      .join("");

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${padWidth}" height="${padHeight}" viewBox="0 0 ${padWidth} ${padHeight}">
<rect width="100%" height="100%" fill="white"/>
${paths}
</svg>`;

    onOK(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        const initialPoint = { x: gestureState.x0, y: gestureState.y0 };
        currentStrokeRef.current = [initialPoint];
        setCurrentStroke([initialPoint]);
      },
      onPanResponderMove: (_, gestureState) => {
        const nextPoint = { x: gestureState.moveX, y: gestureState.moveY };
        currentStrokeRef.current = [...currentStrokeRef.current, nextPoint];
        setCurrentStroke([...currentStrokeRef.current]);
      },
      onPanResponderRelease: () => {
        const finishedStroke = currentStrokeRef.current;
        if (finishedStroke.length > 0) {
          setStrokes((previous) => [...previous, finishedStroke]);
        }
        currentStrokeRef.current = [];
        setCurrentStroke([]);
      },
      onPanResponderTerminate: () => {
        const finishedStroke = currentStrokeRef.current;
        if (finishedStroke.length > 0) {
          setStrokes((previous) => [...previous, finishedStroke]);
        }
        currentStrokeRef.current = [];
        setCurrentStroke([]);
      },
    })
  ).current;

  const limpar = () => {
    setStrokes([]);
    currentStrokeRef.current = [];
    setCurrentStroke([]);
  };

  const todosOsTraços = [...strokes, currentStroke].filter(
    (stroke) => stroke.length > 0
  );

  return (
    <View style={styles.signaturePadRoot}>
      <View
        style={styles.signatureDrawingArea}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width > 0) setPadWidth(width);
          if (height > 0) setPadHeight(height);
        }}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${padWidth} ${padHeight}`}>
          <Path d={`M 0 ${padHeight - 22} L ${padWidth} ${padHeight - 22}`} stroke="#CBD5E1" strokeWidth="1" />
          {todosOsTraços.map((stroke, index) => (
            <Path
              key={index}
              d={buildPath(stroke)}
              fill="none"
              stroke="#111827"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
        {todosOsTraços.length === 0 && (
          <View pointerEvents="none" style={styles.signatureHintOverlay}>
            <Text style={styles.signatureHint}>Desenhe sua assinatura aqui</Text>
          </View>
        )}
      </View>

      <View style={styles.signaturePadActions}>
        <TouchableOpacity style={styles.signatureClearButton} onPress={limpar}>
          <MaterialIcons name="delete-outline" size={19} color="#52627A" />
          <Text style={styles.signatureClearButtonText}>Limpar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signatureConfirmButton} onPress={criarImagemAssinatura}>
          <MaterialIcons name="check" size={19} color="#FFFFFF" />
          <Text style={styles.signatureConfirmButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  descricao?: string;
  status: StatusEquipamento;
}

interface Pergunta {
  id: string;
  texto: string;
  tipo: string;
  obrigatoria: boolean;
}

interface InspecaoSalva {
  id: string;
  titulo: string;
  equipamentoId: string;
  equipamentoNome: string;
  equipamentoCodigo: string;
  tecnico: string;
  status: "CONCLUIDA";
  reviewStatus: "PENDENTE" | "APROVADA" | "REPROVADA";
  revisadoPor?: string;
  observacaoRevisao?: string;
  dataRevisao?: string;
  situacaoFinal?: "APROVADA" | "REPROVADA" | "PENDENTE";
  dataEncerramento?: string;
  equipamentoStatusFinal?: StatusEquipamento;
  respostas: Record<string, string>;
  perguntas?: Pergunta[];
  observacao: string;
  naoConformidades?: string[];
  dataConclusao: string;
  fotos?: Record<string, string>;
  assinatura?: string;
}

interface InspecaoPendenteOffline extends InspecaoSalva {
  perguntas: Pergunta[];
  fotoOcorrencia?: string | null;
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
    id: "local-1",
    texto: "O equipamento está em boas condições?",
    tipo: "Sim / Não",
    obrigatoria: true,
  },
  {
    id: "local-2",
    texto: "Qual o nível de pressão?",
    tipo: "Múltipla escolha",
    obrigatoria: true,
  },
  {
    id: "local-3",
    texto: "Existe algum vazamento?",
    tipo: "Sim / Não",
    obrigatoria: false,
  },
];

/* =========================================================
   APP
========================================================= */

interface UsuarioLogado {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [tela, setTela] = useState<Tela>("dashboard");
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [token, setToken] = useState("");
  const [inspecoesSalvas, setInspecoesSalvas] = useState<InspecaoSalva[]>([]);
  const [online, setOnline] = useState(false);
  const [inspecoesPendentesOffline, setInspecoesPendentesOffline] =
    useState<InspecaoPendenteOffline[]>([]);
  useEffect(() => {
    let ativo = true;
    let intervalo: ReturnType<typeof setInterval> | null = null;

    const atualizarPeloNetInfo = (state: {
      isConnected: boolean | null;
      isInternetReachable: boolean | null | undefined;
    }) => {
      const conectado =
        state.isConnected === true &&
        state.isInternetReachable !== false;

      if (ativo) setOnline(conectado);
    };

    const unsubscribeNetInfo = NetInfo.addEventListener(atualizarPeloNetInfo);
    NetInfo.fetch().then(atualizarPeloNetInfo);

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const definirOnline = () => { if (ativo) setOnline(true); };
      const definirOffline = () => { if (ativo) setOnline(false); };

      window.addEventListener("online", definirOnline);
      window.addEventListener("offline", definirOffline);

      const verificarInternetNoWeb = async () => {
        if (!ativo) return;
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          setOnline(false);
          return;
        }
        try {
          await fetch("https://www.google.com/generate_204", {
            method: "HEAD", mode: "no-cors", cache: "no-store",
          });
          if (ativo) setOnline(true);
        } catch {
          if (ativo) setOnline(false);
        }
      };

      verificarInternetNoWeb();
      intervalo = setInterval(verificarInternetNoWeb, 3000);

      return () => {
        ativo = false;
        unsubscribeNetInfo();
        window.removeEventListener("online", definirOnline);
        window.removeEventListener("offline", definirOffline);
        if (intervalo) clearInterval(intervalo);
      };
    }

    return () => {
      ativo = false;
      unsubscribeNetInfo();
      if (intervalo) clearInterval(intervalo);
    };
  }, []);

  // ETAPA 7.2 — Recupera a fila offline salva no aparelho ao abrir o app.
  useEffect(() => {
    let ativo = true;

    const carregarInspecoesPendentesOffline = async () => {
      try {
        const dados = await AsyncStorage.getItem(OFFLINE_INSPECTIONS_STORAGE_KEY);
        if (!dados || !ativo) return;

        const fila: InspecaoPendenteOffline[] = JSON.parse(dados);
        if (Array.isArray(fila)) {
          setInspecoesPendentesOffline(fila);
          setInspecoesSalvas((atual) => {
            const mapa = new Map(atual.map((item) => [item.id, item]));
            fila.forEach((item) => { if (!mapa.has(item.id)) mapa.set(item.id, item); });
            return Array.from(mapa.values());
          });
        }
      } catch (error) {
        console.error("Erro ao recuperar inspeções pendentes offline:", error);
      }
    };

    carregarInspecoesPendentesOffline();
    return () => { ativo = false; };
  }, []);

  // ETAPA 7.2 — Persiste a fila offline no aparelho.
  useEffect(() => {
    const salvarFilaOffline = async () => {
      try {
        if (inspecoesPendentesOffline.length === 0) {
          await AsyncStorage.removeItem(OFFLINE_INSPECTIONS_STORAGE_KEY);
          return;
        }
        await AsyncStorage.setItem(
          OFFLINE_INSPECTIONS_STORAGE_KEY,
          JSON.stringify(inspecoesPendentesOffline)
        );
      } catch (error) {
        console.error("Erro ao salvar inspeções pendentes offline:", error);
      }
    };
    salvarFilaOffline();
  }, [inspecoesPendentesOffline]);

  useEffect(() => {
    if (!autenticado) {
      return;
    }

    async function carregarInspecoesDoBanco() {
      try {
        const response = await fetch(`${API_URL}/inspections`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Não foi possível carregar o histórico de inspeções."
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Resposta inválida ao carregar as inspeções.");
        }

        const inspecoesConcluidas: InspecaoSalva[] = data
          .filter((item: any) => item?.status === "COMPLETED")
          .map((item: any) => ({
            id: String(item.id),
            titulo: String(item.title || "Inspeção"),
            equipamentoId: String(item.equipmentId || item.equipment?.id || ""),
            equipamentoNome: String(
              item.equipment?.name || "Equipamento não identificado"
            ),
            equipamentoCodigo: String(
              item.equipment?.code || "Sem código"
            ),
            tecnico: String(
              item.responsible?.name || "Técnico não identificado"
            ),
            status: "CONCLUIDA",
            reviewStatus:
              item.reviewStatus === "APPROVED" || item.reviewStatus === "APROVADA"
                ? "APROVADA"
                : item.reviewStatus === "REJECTED" || item.reviewStatus === "REPROVADA"
                ? "REPROVADA"
                : "PENDENTE",
            revisadoPor: String(item.reviewer?.name || item.reviewedBy?.name || ""),
            observacaoRevisao: String(item.reviewObservation || item.reviewNote || ""),
            dataRevisao: String(item.reviewedAt || item.reviewDate || item.reviewed_at || "") || undefined,
            situacaoFinal:
              item.reviewStatus === "APPROVED" || item.reviewStatus === "APROVADA"
                ? "APROVADA"
                : item.reviewStatus === "REJECTED" || item.reviewStatus === "REPROVADA"
                ? "REPROVADA"
                : "PENDENTE",
            dataEncerramento: String(
              item.reviewedAt || item.reviewDate || item.reviewed_at || item.updatedAt || item.createdAt || ""
            ),
            equipamentoStatusFinal:
              item.reviewStatus === "APPROVED" || item.reviewStatus === "APROVADA"
                ? "Ativo"
                : item.reviewStatus === "REJECTED" || item.reviewStatus === "REPROVADA"
                ? "Manutenção"
                : undefined,
            respostas: Array.isArray(item.answers)
              ? item.answers.reduce((acc: Record<string, string>, answer: any, index: number) => {
                  const key = String(
                    answer.questionId ||
                      answer.question?.id ||
                      answer.question?.title ||
                      `resposta-${index + 1}`
                  );
                  acc[key] = String(answer.value ?? answer.answer ?? "");
                  return acc;
                }, {})
              : {},
            perguntas: Array.isArray(item.questions)
              ? item.questions.map((question: any, index: number) => ({
                  id: String(question.id || `question-${index + 1}`),
                  texto: String(question.title || question.text || `Pergunta ${index + 1}`),
                  tipo: String(question.type || "Resposta"),
                  obrigatoria: Boolean(question.required),
                }))
              : [],
            observacao: String(item.description || ""),
            dataConclusao: String(item.updatedAt || item.createdAt),
            fotos: Array.isArray(item.answers)
              ? item.answers.reduce((acc: Record<string, string>, answer: any) => {
                  const key = String(answer.questionId || answer.question?.id || "");
                  const url = String(answer.photoUrl || answer.photo || answer.evidenceUrl || "");
                  if (key && url) acc[key] = url;
                  return acc;
                }, {})
              : {},
            assinatura: Array.isArray(item.answers)
              ? String(
                  item.answers.find((answer: any) =>
                    answer.signatureUrl || answer.signature
                  )?.signatureUrl ||
                    item.answers.find((answer: any) =>
                      answer.signatureUrl || answer.signature
                    )?.signature ||
                    ""
                ) || undefined
              : undefined,
            naoConformidades: Array.isArray(item.answers)
              ? item.answers
                  .filter((answer: any) =>
                    String(answer.value ?? answer.answer ?? "").trim().toLowerCase() === "não" ||
                    String(answer.value ?? answer.answer ?? "").trim().toLowerCase() === "nao"
                  )
                  .map((answer: any) =>
                    String(answer.question?.title || answer.question?.text || "Não conformidade identificada")
                  )
              : [],
          }));

        setInspecoesSalvas(inspecoesConcluidas);
      } catch (error) {
        console.error("Erro ao carregar histórico de inspeções:", error);
      }
    }

    carregarInspecoesDoBanco();
  }, [autenticado]);

  useEffect(() => {
    if (!autenticado || !online || inspecoesPendentesOffline.length === 0) {
      return;
    }

    let cancelado = false;

    async function sincronizarInspecoesPendentes() {
      const pendentes = [...inspecoesPendentesOffline];

      for (const pendente of pendentes) {
        try {
          const perguntasParaBackend = pendente.perguntas.map((pergunta, index) => ({
            type:
              pergunta.tipo === "Sim / Não"
                ? "COMPLIANCE"
                : pergunta.tipo === "Múltipla escolha"
                ? "MULTIPLE_CHOICE"
                : pergunta.tipo === "Foto"
                ? "PHOTO"
                : "SHORT_TEXT",
            title: pergunta.texto,
            required: pergunta.obrigatoria,
            order: index + 1,
          }));

          const criarResponse = await fetch(`${API_URL}/inspections`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: pendente.titulo,
              description: pendente.observacao || "Inspeção realizada pelo aplicativo OpsControl.",
              equipmentId: pendente.equipamentoId,
              responsibleId: usuario?.id || null,
              questions: perguntasParaBackend,
            }),
          });

          const criarData = await criarResponse.json();
          if (!criarResponse.ok) {
            throw new Error(criarData?.message || "Não foi possível sincronizar a inspeção.");
          }

          const perguntasBanco = Array.isArray(criarData.questions)
            ? criarData.questions
            : [];

          for (let index = 0; index < pendente.perguntas.length; index += 1) {
            const pergunta = pendente.perguntas[index];
            const resposta = pendente.respostas[pergunta.id];

            if (!resposta) {
              continue;
            }

            const perguntaBanco = perguntasBanco[index];
            const questionId = String(perguntaBanco?.id || pergunta.id);

            const respostaResponse = await fetch(
              `${API_URL}/inspections/${String(criarData.id)}/answers`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  questionId,
                  userId: usuario?.id || null,
                  value: String(resposta),
                  observation: pendente.observacao || null,
                  photoUrl: pendente.fotos?.[pergunta.id] || pendente.fotoOcorrencia || null,
                  signatureUrl: index === 0 ? pendente.assinatura || null : null,
                }),
              }
            );

            const respostaData = await respostaResponse.json();
            if (!respostaResponse.ok) {
              throw new Error(
                respostaData?.message || `Falha ao sincronizar a resposta ${questionId}.`
              );
            }
          }

          const finalizarResponse = await fetch(
            `${API_URL}/inspections/${String(criarData.id)}/complete`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: usuario?.id || null,
                observation: pendente.observacao || null,
              }),
            }
          );

          if (!finalizarResponse.ok) {
            const finalizarData = await finalizarResponse.json();
            throw new Error(
              finalizarData?.message || "Falha ao concluir a sincronização."
            );
          }

          if (!cancelado) {
            setInspecoesSalvas((listaAtual) => [
              { ...pendente, id: String(criarData.id) },
              ...listaAtual.filter((item) => item.id !== pendente.id),
            ]);
            setInspecoesPendentesOffline((listaAtual) =>
              listaAtual.filter((item) => item.id !== pendente.id)
            );
          }

          console.log("Inspeção offline sincronizada:", pendente.id);
        } catch (error) {
          console.error("Falha na sincronização da inspeção offline:", error);
          break;
        }
      }
    }

    sincronizarInspecoesPendentes();

    return () => {
      cancelado = true;
    };
  }, [autenticado, online, inspecoesPendentesOffline, usuario]);

  function realizarLogin(usuarioRecebido: UsuarioLogado, tokenRecebido: string) {
    setUsuario(usuarioRecebido);
    setToken(tokenRecebido);
    setAutenticado(true);
    setTela("dashboard");
  }

  function sair() {
    setToken("");
    setUsuario(null);
    setAutenticado(false);
    setTela("dashboard");
  }

  if (!autenticado) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#062B57"
        />
        <LoginScreen onLogin={realizarLogin} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#062B57"
      />

      {!online && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="cloud-off" size={20} color="#FFFFFF" />
          <View style={styles.offlineBannerContent}>
            <Text style={styles.offlineBannerTitle}>Modo offline</Text>
            <Text style={styles.offlineBannerText}>
              Sem conexão. A inspeção poderá ser concluída e sincronizada quando a internet voltar.
            </Text>
          </View>
        </View>
      )}

      {online && inspecoesPendentesOffline.length > 0 && (
        <View style={styles.syncBanner}>
          <MaterialIcons name="sync" size={20} color="#0B4B87" />
          <Text style={styles.syncBannerText}>
            Sincronizando {inspecoesPendentesOffline.length} inspeção(ões) pendente(s)...
          </Text>
        </View>
      )}

      <View style={styles.mainContent}>
      {tela === "dashboard" && (
        <DashboardScreen navegar={setTela} />
      )}

      {tela === "inspecoes" && (
        <InspecoesScreen
          usuario={usuario}
          online={online}
          inspecoesSalvas={inspecoesSalvas}
          setInspecoesSalvas={setInspecoesSalvas}
          setInspecoesPendentesOffline={setInspecoesPendentesOffline}
        />
      )}

      {tela === "equipamentos" && (
        <EquipamentosScreen />
      )}

      {tela === "perfil" && (
        <PerfilScreen
          usuario={usuario}
          onLogout={sair}
          inspecoesSalvas={inspecoesSalvas}
          online={online}
        />
      )}

      </View>

      <BottomNavigation
        telaAtual={tela}
        navegar={setTela}
      />
    </SafeAreaView>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function LoginScreen({
  onLogin,
}: {
  onLogin: (usuario: UsuarioLogado, token: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data?.message || "E-mail ou senha inválidos.");
        return;
      }

      if (!data?.token || !data?.user) {
        setErro("A API não retornou os dados de autenticação.");
        return;
      }

      onLogin(data.user, data.token);
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      setErro(
        "Não foi possível conectar ao servidor. Verifique se o backend está funcionando na porta 3000."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.loginContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.loginContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loginBrand}>
          <View style={styles.loginLogo}>
            <MaterialIcons name="engineering" size={42} color="#FFFFFF" />
          </View>

          <Text style={styles.loginBrandName}>OpsControl</Text>

          <Text style={styles.loginBrandSubtitle}>
            Gestão de inspeções em campo
          </Text>
        </View>

        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>Bem-vindo</Text>

          <Text style={styles.loginDescription}>
            Entre para acessar o sistema OpsControl.
          </Text>

          <Text style={styles.loginLabel}>E-mail</Text>

          <View style={styles.loginInputContainer}>
            <MaterialIcons name="email" size={20} color="#718198" />

            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.loginInput}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#9AA5B5"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!carregando}
            />
          </View>

          <Text style={styles.loginLabel}>Senha</Text>

          <View style={styles.loginInputContainer}>
            <MaterialIcons name="lock" size={20} color="#718198" />

            <TextInput
              value={senha}
              onChangeText={setSenha}
              style={styles.loginInput}
              placeholder="Digite sua senha"
              placeholderTextColor="#9AA5B5"
              secureTextEntry={!mostrarSenha}
              editable={!carregando}
              onSubmitEditing={entrar}
            />

            <TouchableOpacity
              onPress={() => setMostrarSenha(!mostrarSenha)}
              disabled={carregando}
            >
              <MaterialIcons
                name={mostrarSenha ? "visibility-off" : "visibility"}
                size={20}
                color="#718198"
              />
            </TouchableOpacity>
          </View>

          {erro !== "" && (
            <View style={styles.loginError}>
              <MaterialIcons name="error-outline" size={18} color="#C52C2C" />
              <Text style={styles.loginErrorText}>{erro}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, carregando && { opacity: 0.7 }]}
            onPress={entrar}
            activeOpacity={0.85}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Entrar</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() =>
              setErro(
                "Entre em contato com o administrador para redefinir sua senha."
              )
            }
            disabled={carregando}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.loginFooter}>
          OpsControl • Gestão operacional
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
          OpsControl
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
  const scrollRef = useRef<ScrollView | null>(null);

  const [dashboard, setDashboard] = useState({
    equipamentosTotal: 0,
    equipamentosAtivos: 0,
    equipamentosManutencao: 0,
    equipamentosInativos: 0,
    inspecoesTotal: 0,
    inspecoesConcluidas: 0,
    inspecoesAndamento: 0,
    inspecoesCanceladas: 0,
  });

  const [carregandoDashboard, setCarregandoDashboard] = useState(true);
  const [erroDashboard, setErroDashboard] = useState("");

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setCarregandoDashboard(true);
        setErroDashboard("");

        const [equipamentosResponse, inspecoesResponse] =
          await Promise.all([
            fetch(`${API_URL}/equipments`),
            fetch(`${API_URL}/inspections`),
          ]);

        if (!equipamentosResponse.ok) {
          throw new Error("Não foi possível carregar os equipamentos.");
        }

        if (!inspecoesResponse.ok) {
          throw new Error("Não foi possível carregar as inspeções.");
        }

        const equipamentosData = await equipamentosResponse.json();
        const inspecoesData = await inspecoesResponse.json();

        const equipamentos = Array.isArray(equipamentosData)
          ? equipamentosData
          : [];

        const inspecoes = Array.isArray(inspecoesData)
          ? inspecoesData
          : [];

        setDashboard({
          equipamentosTotal: equipamentos.length,
          equipamentosAtivos: equipamentos.filter(
            (item: { status?: string }) => item.status === "ACTIVE"
          ).length,
          equipamentosManutencao: equipamentos.filter(
            (item: { status?: string }) => item.status === "MAINTENANCE"
          ).length,
          equipamentosInativos: equipamentos.filter(
            (item: { status?: string }) => item.status === "INACTIVE"
          ).length,
          inspecoesTotal: inspecoes.length,
          inspecoesConcluidas: inspecoes.filter(
            (item: { status?: string }) => item.status === "COMPLETED"
          ).length,
          inspecoesAndamento: inspecoes.filter(
            (item: { status?: string }) => item.status === "IN_PROGRESS"
          ).length,
          inspecoesCanceladas: inspecoes.filter(
            (item: { status?: string }) => item.status === "CANCELLED"
          ).length,
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        setErroDashboard(
          "Não foi possível carregar os dados reais do banco."
        );
      } finally {
        setCarregandoDashboard(false);
      }
    }

    carregarDashboard();
  }, []);

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
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
        ref={scrollRef}
        scrollEventThrottle={16}
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
            valor={carregandoDashboard ? "..." : String(dashboard.inspecoesConcluidas)}
            descricao={`${dashboard.inspecoesTotal} inspeções cadastradas`}
            icone="check-circle"
            tipo="success"
          />

          <StatCard
            titulo="Equipamentos Ativos"
            valor={carregandoDashboard ? "..." : String(dashboard.equipamentosAtivos)}
            descricao={`${dashboard.equipamentosTotal} equipamentos cadastrados`}
            icone="precision-manufacturing"
            tipo="info"
          />

          <StatCard
            titulo="Em Manutenção"
            valor={carregandoDashboard ? "..." : String(dashboard.equipamentosManutencao)}
            descricao={`${dashboard.equipamentosInativos} inativos`}
            icone="build"
            tipo="warning"
          />

          <StatCard
            titulo="Inspeções em Andamento"
            valor={carregandoDashboard ? "..." : String(dashboard.inspecoesAndamento)}
            descricao={`${dashboard.inspecoesCanceladas} canceladas`}
            icone="schedule"
            tipo="danger"
          />
        </View>

        {erroDashboard ? (
          <View style={styles.dashboardError}>
            <MaterialIcons name="error-outline" size={20} color="#C52C2C" />
            <Text style={styles.dashboardErrorText}>{erroDashboard}</Text>
          </View>
        ) : null}

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

      <FloatingScrollButtons scrollRef={scrollRef} />
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
   BOTÕES DE ROLAGEM
========================================================= */

function FloatingScrollButtons({
  scrollRef,
}: {
  scrollRef: React.MutableRefObject<ScrollView | null>;
}) {
  return (
    <View style={styles.scrollButtonsContainer} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.scrollButton}
        onPress={() =>
          scrollRef.current?.scrollTo({
            y: 0,
            animated: true,
          })
        }
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="keyboard-arrow-up"
          size={26}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.scrollButton}
        onPress={() =>
          scrollRef.current?.scrollToEnd({
            animated: true,
          })
        }
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="keyboard-arrow-down"
          size={26}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
}

/* =========================================================
   INSPEÇÕES
========================================================= */

function InspecoesScreen({
  usuario,
  online,
  inspecoesSalvas,
  setInspecoesSalvas,
  setInspecoesPendentesOffline,
}: {
  usuario: UsuarioLogado | null;
  online: boolean;
  inspecoesSalvas: InspecaoSalva[];
  setInspecoesSalvas: React.Dispatch<React.SetStateAction<InspecaoSalva[]>>;
  setInspecoesPendentesOffline: React.Dispatch<React.SetStateAction<InspecaoPendenteOffline[]>>;
}) {
  const [nomeModelo, setNomeModelo] = useState(
    "Inspeção de Compressores Industriais"
  );

  const [perguntas, setPerguntas] = useState<Pergunta[]>(
    perguntasIniciais
  );

  const [mostrarTipos, setMostrarTipos] = useState(false);

  const [modoExecucao, setModoExecucao] = useState(false);

  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const [inspecaoIniciada, setInspecaoIniciada] = useState(false);

  const [inspecaoId, setInspecaoId] = useState<string | null>(null);

  const [criandoInspecao, setCriandoInspecao] = useState(false);

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(
    equipamentosIniciais
  );

  const [carregandoEquipamentos, setCarregandoEquipamentos] = useState(false);

  const [erroEquipamentos, setErroEquipamentos] = useState("");

  const [respostas, setRespostas] = useState<Record<string, string>>({});

  const [observacao, setObservacao] = useState("");
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [fotoOcorrencia, setFotoOcorrencia] = useState<string | null>(null);
  const [selecionandoFoto, setSelecionandoFoto] = useState(false);
  const [assinatura, setAssinatura] = useState<string | null>(null);
  const [assinaturaModal, setAssinaturaModal] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  // ETAPA 8 — estados da revisão e aprovação da inspeção.
  const [inspecaoEmRevisao, setInspecaoEmRevisao] =
    useState<InspecaoSalva | null>(null);
  const [modalRevisao, setModalRevisao] = useState(false);
  const [observacaoRevisao, setObservacaoRevisao] = useState("");
  const [processandoRevisao, setProcessandoRevisao] = useState(false);

  useEffect(() => {
    async function carregarEquipamentos() {
      try {
        setCarregandoEquipamentos(true);
        setErroEquipamentos("");

        const response = await fetch(`${API_URL}/equipments`);

        if (!response.ok) {
          throw new Error("Não foi possível carregar os equipamentos.");
        }

        const data = await response.json();

        const equipamentosFormatados: Equipamento[] = data.map(
          (equipamento: {
            id: string;
            name: string;
            code: string;
            location: string;
            status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
          }) => ({
            id: equipamento.id,
            nome: equipamento.name,
            codigo: equipamento.code,
            local: equipamento.location,
            tipo: "Equipamento industrial",
            responsavel: "",
            status:
              equipamento.status === "ACTIVE"
                ? "Ativo"
                : equipamento.status === "MAINTENANCE"
                ? "Manutenção"
                : "Inativo",
          })
        );

        setEquipamentos(equipamentosFormatados);
      } catch (error) {
        console.error("Erro ao carregar equipamentos:", error);
        setErroEquipamentos(
          "Não foi possível carregar os equipamentos do servidor."
        );
        setEquipamentos(equipamentosIniciais);
      } finally {
        setCarregandoEquipamentos(false);
      }
    }

    carregarEquipamentos();
  }, []);

  function adicionarPergunta() {
    const novaPergunta: Pergunta = {
      id: `local-${Date.now()}`,
      texto: "Nova pergunta de inspeção",
      tipo: "Sim / Não",
      obrigatoria: false,
    };

    setPerguntas([...perguntas, novaPergunta]);
  }

  function selecionarEquipamento(equipamento: Equipamento) {
    setEquipamentoSelecionado(equipamento);
    setInspecaoIniciada(false);
    setRespostas({});
    setObservacao("");
    setFotos({});
    setFotoOcorrencia(null);
  }

  async function iniciarInspecao() {
    if (!equipamentoSelecionado) {
      alert("Selecione um equipamento antes de iniciar a inspeção.");
      return;
    }

    if (!online) {
      setInspecaoId(`offline-${Date.now()}`);
      setInspecaoIniciada(true);
      alert(
        "Você está offline. A inspeção foi iniciada localmente e será sincronizada quando a conexão voltar."
      );
      return;
    }

    try {
      setCriandoInspecao(true);

      const perguntasParaBackend = perguntas.map((pergunta, index) => ({
        type:
          pergunta.tipo === "Sim / Não"
            ? "COMPLIANCE"
            : pergunta.tipo === "Múltipla escolha"
            ? "MULTIPLE_CHOICE"
            : pergunta.tipo === "Foto"
            ? "PHOTO"
            : "SHORT_TEXT",
        title: pergunta.texto,
        required: pergunta.obrigatoria,
        order: index + 1,
      }));

      const response = await fetch(`${API_URL}/inspections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: nomeModelo,
          description: "Inspeção realizada pelo aplicativo OpsControl.",
          equipmentId: equipamentoSelecionado.id,
          responsibleId: usuario?.id || null,
          questions: perguntasParaBackend,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Não foi possível criar a inspeção."
        );
      }

      setInspecaoId(String(data.id));

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        const perguntasDoBanco: Pergunta[] = data.questions.map(
          (pergunta: any) => ({
            id: String(pergunta.id),
            texto: String(pergunta.title),
            tipo:
              pergunta.type === "MULTIPLE_CHOICE"
                ? "Múltipla escolha"
                : pergunta.type === "PHOTO"
                ? "Foto"
                : pergunta.type === "PARAGRAPH"
                ? "Texto"
                : "Sim / Não",
            obrigatoria: Boolean(pergunta.required),
          })
        );

        setPerguntas(perguntasDoBanco);
      }

      setInspecaoIniciada(true);

      console.log("Inspeção criada com perguntas do PostgreSQL:", data);
    } catch (error) {
      console.error("Erro ao iniciar inspeção:", error);
      alert(
        "Não foi possível iniciar a inspeção. Verifique se o backend está funcionando."
      );
    } finally {
      setCriandoInspecao(false);
    }
  }

  function responderPergunta(id: string, resposta: string) {
    setRespostas((estadoAtual) => ({
      ...estadoAtual,
      [id]: resposta,
    }));
  }

  async function adicionarFoto(questionId?: string) {
    try {
      setSelecionandoFoto(true);

      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissao.granted) {
        alert("Permissão para acessar as fotos não foi concedida.");
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (resultado.canceled || !resultado.assets?.[0]?.uri) {
        return;
      }

      const uri = resultado.assets[0].uri;

      if (questionId) {
        setFotos((estadoAtual) => ({
          ...estadoAtual,
          [questionId]: uri,
        }));
      } else {
        setFotoOcorrencia(uri);
      }
    } catch (error) {
      console.error("Erro ao selecionar foto:", error);
      alert("Não foi possível adicionar a foto.");
    } finally {
      setSelecionandoFoto(false);
    }
  }

  function removerFoto(questionId?: string) {
    if (questionId) {
      setFotos((estadoAtual) => {
        const novoEstado = { ...estadoAtual };
        delete novoEstado[questionId];
        return novoEstado;
      });
    } else {
      setFotoOcorrencia(null);
    }
  }

  function abrirAssinatura() {
    setAssinaturaModal(true);
  }

  function assinaturaConfirmada(data: string) {
    setAssinatura(data);
    setAssinaturaModal(false);
  }

  function limparAssinatura() {
    setAssinatura(null);
  }

  async function finalizarInspecao() {
    const perguntasObrigatorias = perguntas.filter(
      (pergunta) => pergunta.obrigatoria
    );

    const faltando = perguntasObrigatorias.some(
      (pergunta) => !respostas[pergunta.id]
    );

    if (faltando) {
      alert("Responda todas as perguntas obrigatórias antes de finalizar.");
      return;
    }

    if (!assinatura) {
      alert("Faça e confirme a assinatura do técnico antes de finalizar.");
      return;
    }

    if (!inspecaoId || !equipamentoSelecionado) {
      alert("Não foi possível identificar a inspeção atual.");
      return;
    }

    if (!online || inspecaoId.startsWith("offline-")) {
      const novaInspecaoOffline: InspecaoPendenteOffline = {
        id: inspecaoId,
        titulo: nomeModelo,
        equipamentoId: equipamentoSelecionado.id,
        equipamentoNome: equipamentoSelecionado.nome,
        equipamentoCodigo: equipamentoSelecionado.codigo,
        tecnico: usuario?.name || "Técnico não identificado",
        status: "CONCLUIDA",
        reviewStatus: "PENDENTE",
        respostas: { ...respostas },
        observacao,
        dataConclusao: new Date().toISOString(),
        fotos: { ...fotos },
        assinatura,
        perguntas: [...perguntas],
        fotoOcorrencia,
      };

      setInspecoesSalvas((listaAtual) => [
        novaInspecaoOffline,
        ...listaAtual.filter((item) => item.id !== novaInspecaoOffline.id),
      ]);

      setInspecoesPendentesOffline((listaAtual) => {
        const existe = listaAtual.some(
          (item) => item.id === novaInspecaoOffline.id
        );
        if (existe) return listaAtual;
        return [novaInspecaoOffline, ...listaAtual];
      });

      alert(
        "Inspeção concluída offline. Ela foi guardada no aplicativo e será sincronizada automaticamente quando a conexão voltar."
      );

      setModoExecucao(false);
      setInspecaoIniciada(false);
      setEquipamentoSelecionado(null);
      setInspecaoId(null);
      setRespostas({});
      setObservacao("");
      setFotos({});
      setFotoOcorrencia(null);
      setAssinatura(null);
      setAssinaturaModal(false);
      return;
    }

    try {
      const respostasBackend = perguntas
        .filter((pergunta) => respostas[pergunta.id])
        .map((pergunta, index) => ({
          questionId: String(pergunta.id),
          value: String(respostas[pergunta.id]),
          observation: observacao || null,
          photoUrl: fotos[pergunta.id] || fotoOcorrencia || null,
          signatureUrl: index === 0 ? assinatura : null,
        }));

      // O backend recebe UMA resposta por requisição.
      // Enviamos cada resposta individualmente para /answers.
      for (const resposta of respostasBackend) {
        const respostaResponse = await fetch(
          `${API_URL}/inspections/${inspecaoId}/answers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questionId: resposta.questionId,
              userId: usuario?.id || null,
              value: resposta.value,
              observation: resposta.observation,
              photoUrl: resposta.photoUrl,
              signatureUrl: resposta.signatureUrl,
            }),
          }
        );

        const respostaData = await respostaResponse.json();

        if (!respostaResponse.ok) {
          throw new Error(
            respostaData?.error ||
              respostaData?.message ||
              `Não foi possível salvar a resposta da pergunta ${resposta.questionId}.`
          );
        }
      }

      const finalizarResponse = await fetch(
        `${API_URL}/inspections/${inspecaoId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: usuario?.id || null,
            observation: observacao || null,
          }),
        }
      );

      const finalizarData = await finalizarResponse.json();

      if (!finalizarResponse.ok) {
        throw new Error(
          finalizarData?.message ||
            "Não foi possível finalizar a inspeção."
        );
      }

      const novaInspecao: InspecaoSalva = {
        id: inspecaoId,
        titulo: nomeModelo,
        equipamentoId: equipamentoSelecionado.id,
        equipamentoNome: equipamentoSelecionado.nome,
        equipamentoCodigo: equipamentoSelecionado.codigo,
        tecnico: usuario?.name || "Técnico não identificado",
        status: "CONCLUIDA",
        reviewStatus: "PENDENTE",
        respostas: { ...respostas },
        observacao,
        dataConclusao: new Date().toISOString(),
        fotos: { ...fotos },
        assinatura,
      };

      setInspecoesSalvas((listaAtual) => [
        novaInspecao,
        ...listaAtual.filter((item) => item.id !== novaInspecao.id),
      ]);

      alert(
        `Inspeção salva com sucesso para ${equipamentoSelecionado.nome}.`
      );

      setModoExecucao(false);
      setInspecaoIniciada(false);
      setEquipamentoSelecionado(null);
      setInspecaoId(null);
      setRespostas({});
      setObservacao("");
      setFotos({});
      setFotoOcorrencia(null);
      setAssinatura(null);
      setAssinaturaModal(false);
    } catch (error) {
      console.error("Erro ao finalizar inspeção:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a inspeção."
      );
    }
  }

  function traduzirStatusFinal(inspecao: InspecaoSalva) {
    if (inspecao.reviewStatus === "APROVADA") return "APROVADA";
    if (inspecao.reviewStatus === "REPROVADA") return "REPROVADA";
    return "PENDENTE";
  }

  async function atualizarEquipamentoAposRevisao(
    inspecao: InspecaoSalva,
    decisao: "APROVADA" | "REPROVADA"
  ) {
    // ETAPA 10 — fechamento operacional:
    // inspeção aprovada libera o equipamento; inspeção reprovada
    // direciona o equipamento para manutenção.
    const novoStatus: StatusEquipamento =
      decisao === "APROVADA" ? "Ativo" : "Manutenção";

    try {
      const response = await fetch(
        `${API_URL}/equipments/${inspecao.equipamentoId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status:
              novoStatus === "Ativo"
                ? "ACTIVE"
                : novoStatus === "Manutenção"
                ? "MAINTENANCE"
                : "INACTIVE",
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data?.message ||
            "A revisão foi registrada, mas não foi possível atualizar o equipamento."
        );
      }

      return novoStatus;
    } catch (error) {
      console.error("Erro ao atualizar equipamento após revisão:", error);
      throw error;
    }
  }

  async function abrirRevisao(inspecao: InspecaoSalva) {
    setInspecaoEmRevisao(inspecao);
    setObservacaoRevisao(inspecao.observacaoRevisao || "");
    setModalRevisao(true);
  }

  async function concluirRevisao(decisao: "APROVADA" | "REPROVADA") {
    if (!inspecaoEmRevisao) return;

    if (decisao === "REPROVADA" && !observacaoRevisao.trim()) {
      alert("Informe a justificativa da reprovação.");
      return;
    }

    setProcessandoRevisao(true);

    const atualizada: InspecaoSalva = {
      ...inspecaoEmRevisao,
      reviewStatus: decisao,
      revisadoPor: usuario?.name || "Responsável pela revisão",
      observacaoRevisao: observacaoRevisao.trim(),
      dataRevisao: new Date().toISOString(),
      situacaoFinal: decisao,
      dataEncerramento: new Date().toISOString(),
      equipamentoStatusFinal:
        decisao === "APROVADA" ? "Ativo" : "Manutenção",
    };

    try {
      // ETAPA 8 — tenta persistir a revisão no backend.
      const response = await fetch(
        `${API_URL}/inspections/${inspecaoEmRevisao.id}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: decisao === "APROVADA" ? "APPROVED" : "REJECTED",
            reviewerId: usuario?.id || null,
            observation: observacaoRevisao.trim() || null,
          }),
        }
      );

      if (!response.ok && response.status !== 404 && response.status !== 405) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Não foi possível registrar a revisão.");
      }

      // ETAPA 10 — fecha o fluxo operacional atualizando o equipamento.
      let equipamentoStatusFinal: StatusEquipamento =
        decisao === "APROVADA" ? "Ativo" : "Manutenção";

      try {
        equipamentoStatusFinal = await atualizarEquipamentoAposRevisao(
          atualizada,
          decisao
        );
      } catch (errorEquipamento) {
        console.warn(
          "Revisão registrada, mas o status do equipamento não foi atualizado:",
          errorEquipamento
        );
        alert(
          "A revisão foi registrada. Não foi possível atualizar o status do equipamento automaticamente."
        );
      }

      const atualizadaFinal: InspecaoSalva = {
        ...atualizada,
        equipamentoStatusFinal,
      };

      // Mantém a atualização local mesmo em uma API que ainda não possua a rota /review.
      setInspecoesSalvas((lista) =>
        lista.map((item) => (item.id === atualizadaFinal.id ? atualizadaFinal : item))
      );

      setModalRevisao(false);
      setInspecaoEmRevisao(null);
      setObservacaoRevisao("");

      alert(
        decisao === "APROVADA"
          ? "Inspeção aprovada com sucesso."
          : "Inspeção reprovada. A justificativa foi registrada."
      );
    } catch (error) {
      console.error("Erro na revisão da inspeção:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a revisão."
      );
    } finally {
      setProcessandoRevisao(false);
    }
  }

  if (modoExecucao) {
    return (
      <View style={styles.flex}>
        <Header
          titulo="Inspeções"
          subtitulo="Execução de inspeções"
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 260, flexGrow: 1 },
          ]}
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
          ref={scrollRef}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          alwaysBounceVertical={true}
          bounces={true}
          directionalLockEnabled={true}
        >
          <View style={styles.executionHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setModoExecucao(false);
                setInspecaoIniciada(false);
                setEquipamentoSelecionado(null);
              }}
            >
              <MaterialIcons
                name="arrow-back"
                size={20}
                color="#0B4B87"
              />

              <Text style={styles.backButtonText}>
                Voltar
              </Text>
            </TouchableOpacity>

            <View>
              <Text style={styles.pageTitleText}>
                Executar Inspeção
              </Text>

              <Text style={styles.pageDescription}>
                Registre as condições do equipamento em campo.
              </Text>
            </View>
          </View>

          {!equipamentoSelecionado && (
            <View style={styles.card}>
              <View style={styles.executionTitle}>
                <MaterialIcons
                  name="precision-manufacturing"
                  size={22}
                  color="#0B4B87"
                />

                <View style={styles.executionTitleContent}>
                  <Text style={styles.cardTitle}>
                    Selecione o equipamento
                  </Text>

                  <Text style={styles.cardSubtitle}>
                    Escolha o equipamento que será inspecionado.
                  </Text>
                </View>
              </View>

              {equipamentos.map((equipamento) => (
                <TouchableOpacity
                  key={equipamento.id}
                  style={styles.executionEquipment}
                  onPress={() => selecionarEquipamento(equipamento)}
                  activeOpacity={0.8}
                >
                  <View style={styles.executionEquipmentIcon}>
                    <MaterialIcons
                      name="precision-manufacturing"
                      size={22}
                      color="#0B4B87"
                    />
                  </View>

                  <View style={styles.executionEquipmentContent}>
                    <Text style={styles.executionEquipmentName}>
                      {equipamento.nome}
                    </Text>

                    <Text style={styles.executionEquipmentCode}>
                      {equipamento.codigo} • {equipamento.local}
                    </Text>

                    <EquipmentStatus status={equipamento.status} />
                  </View>

                  <MaterialIcons
                    name="chevron-right"
                    size={23}
                    color="#7C899B"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {equipamentoSelecionado && !inspecaoIniciada && (
            <>
              <View style={styles.card}>
                <View style={styles.selectedEquipment}>
                  <View style={styles.selectedEquipmentIcon}>
                    <MaterialIcons
                      name="precision-manufacturing"
                      size={30}
                      color="#0B4B87"
                    />
                  </View>

                  <View style={styles.selectedEquipmentContent}>
                    <Text style={styles.selectedEquipmentLabel}>
                      EQUIPAMENTO SELECIONADO
                    </Text>

                    <Text style={styles.selectedEquipmentName}>
                      {equipamentoSelecionado.nome}
                    </Text>

                    <Text style={styles.selectedEquipmentDetails}>
                      {equipamentoSelecionado.codigo} •{" "}
                      {equipamentoSelecionado.local}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Modelo de inspeção
                </Text>

                <Text style={styles.cardSubtitle}>
                  Checklist que será utilizado nesta inspeção.
                </Text>

                <View style={styles.templatePreview}>
                  <MaterialIcons
                    name="assignment"
                    size={25}
                    color="#0B4B87"
                  />

                  <View style={styles.templatePreviewContent}>
                    <Text style={styles.templatePreviewTitle}>
                      {nomeModelo}
                    </Text>

                    <Text style={styles.templatePreviewText}>
                      {perguntas.length} perguntas •{" "}
                      {perguntas.filter((item) => item.obrigatoria).length}{" "}
                      obrigatórias
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    criandoInspecao && { opacity: 0.7 },
                  ]}
                  onPress={iniciarInspecao}
                  disabled={criandoInspecao}
                >
                  {criandoInspecao ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="play-arrow"
                        size={20}
                        color="#FFFFFF"
                      />

                      <Text style={styles.primaryButtonText}>
                        Iniciar Inspeção
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          {equipamentoSelecionado && inspecaoIniciada && (
            <>
              <View style={styles.inspectionProgressCard}>
                <View>
                  <Text style={styles.inspectionProgressTitle}>
                    {equipamentoSelecionado.nome}
                  </Text>

                  <Text style={styles.inspectionProgressText}>
                    {nomeModelo}
                  </Text>
                </View>

                <View style={styles.inspectionProgressBadge}>
                  <Text style={styles.inspectionProgressBadgeText}>
                    Em andamento
                  </Text>
                </View>
              </View>

              {perguntas.map((pergunta, index) => {
                const resposta = respostas[pergunta.id];

                return (
                  <View
                    key={pergunta.id}
                    style={styles.executionQuestionCard}
                  >
                    <View style={styles.executionQuestionHeader}>
                      <View style={styles.questionNumber}>
                        <Text style={styles.questionNumberText}>
                          {index + 1}
                        </Text>
                      </View>

                      <View style={styles.executionQuestionContent}>
                        <Text style={styles.executionQuestionText}>
                          {pergunta.texto}
                        </Text>

                        {pergunta.obrigatoria && (
                          <Text style={styles.executionRequired}>
                            Obrigatória
                          </Text>
                        )}
                      </View>
                    </View>

                    {pergunta.tipo === "Sim / Não" && (
                      <View style={styles.answerRow}>
                        <TouchableOpacity
                          style={[
                            styles.answerButton,
                            resposta === "Sim" &&
                              styles.answerButtonSelected,
                          ]}
                          onPress={() =>
                            responderPergunta(pergunta.id, "Sim")
                          }
                        >
                          <MaterialIcons
                            name="check"
                            size={19}
                            color={
                              resposta === "Sim"
                                ? "#FFFFFF"
                                : "#16845F"
                            }
                          />

                          <Text
                            style={[
                              styles.answerButtonText,
                              resposta === "Sim" &&
                                styles.answerButtonTextSelected,
                            ]}
                          >
                            Sim
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.answerButton,
                            resposta === "Não" &&
                              styles.answerButtonNoSelected,
                          ]}
                          onPress={() =>
                            responderPergunta(pergunta.id, "Não")
                          }
                        >
                          <MaterialIcons
                            name="close"
                            size={19}
                            color={
                              resposta === "Não"
                                ? "#FFFFFF"
                                : "#C93434"
                            }
                          />

                          <Text
                            style={[
                              styles.answerButtonText,
                              resposta === "Não" &&
                                styles.answerButtonTextSelected,
                            ]}
                          >
                            Não
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {pergunta.tipo === "Múltipla escolha" && (
                      <View style={styles.choiceColumn}>
                        {["Baixa", "Normal", "Alta"].map((opcao) => (
                          <TouchableOpacity
                            key={opcao}
                            style={[
                              styles.choiceButton,
                              resposta === opcao &&
                                styles.choiceButtonSelected,
                            ]}
                            onPress={() =>
                              responderPergunta(pergunta.id, opcao)
                            }
                          >
                            <View
                              style={[
                                styles.choiceCircle,
                                resposta === opcao &&
                                  styles.choiceCircleSelected,
                              ]}
                            />

                            <Text
                              style={[
                                styles.choiceText,
                                resposta === opcao &&
                                  styles.choiceTextSelected,
                              ]}
                            >
                              {opcao}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {pergunta.tipo === "Texto" && (
                      <TextInput
                        style={styles.executionInput}
                        placeholder="Digite a resposta..."
                        placeholderTextColor="#9AA5B5"
                        value={resposta || ""}
                        onChangeText={(valor) =>
                          responderPergunta(pergunta.id, valor)
                        }
                        multiline
                      />
                    )}

                    {pergunta.tipo === "Foto" && (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.photoButton,
                            selecionandoFoto && { opacity: 0.6 },
                          ]}
                          onPress={() => adicionarFoto(pergunta.id)}
                          disabled={selecionandoFoto}
                        >
                          <MaterialIcons
                            name="photo-camera"
                            size={22}
                            color="#0B4B87"
                          />

                          <Text style={styles.photoButtonText}>
                            {selecionandoFoto
                              ? "Selecionando foto..."
                              : fotos[pergunta.id]
                              ? "Trocar evidência fotográfica"
                              : "Adicionar evidência fotográfica"}
                          </Text>
                        </TouchableOpacity>

                        {fotos[pergunta.id] && (
                          <View style={styles.photoPreview}>
                            <Image
                              source={{ uri: fotos[pergunta.id] }}
                              style={styles.photoThumbnail}
                            />
                            <Text style={styles.photoPreviewText}>
                              Evidência adicionada com sucesso.
                            </Text>
                            <TouchableOpacity
                              onPress={() => removerFoto(pergunta.id)}
                            >
                              <MaterialIcons
                                name="delete-outline"
                                size={20}
                                color="#C93434"
                              />
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                );
              })}

              {Object.values(respostas).includes("Não") && (
                <View style={styles.nonConformityCard}>
                  <View style={styles.nonConformityHeader}>
                    <MaterialIcons
                      name="warning"
                      size={23}
                      color="#C52C2C"
                    />

                    <View style={styles.nonConformityHeaderContent}>
                      <Text style={styles.nonConformityTitle}>
                        Não conformidade identificada
                      </Text>

                      <Text style={styles.nonConformitySubtitle}>
                        Registre uma observação para esta ocorrência.
                      </Text>
                    </View>
                  </View>

                  <TextInput
                    style={styles.observationInput}
                    placeholder="Descreva o problema encontrado..."
                    placeholderTextColor="#9AA5B5"
                    value={observacao}
                    onChangeText={setObservacao}
                    multiline
                    numberOfLines={4}
                  />

                  <TouchableOpacity
                    style={[
                      styles.photoButton,
                      selecionandoFoto && { opacity: 0.6 },
                    ]}
                    onPress={() => adicionarFoto()}
                    disabled={selecionandoFoto}
                  >
                    <MaterialIcons
                      name="add-a-photo"
                      size={21}
                      color="#0B4B87"
                    />

                    <Text style={styles.photoButtonText}>
                      {selecionandoFoto
                        ? "Selecionando foto..."
                        : fotoOcorrencia
                        ? "Trocar foto da ocorrência"
                        : "Adicionar foto da ocorrência"}
                    </Text>
                  </TouchableOpacity>

                  {fotoOcorrencia && (
                    <View style={styles.photoPreview}>
                      <Image
                        source={{ uri: fotoOcorrencia }}
                        style={styles.photoThumbnail}
                      />
                      <Text style={styles.photoPreviewText}>
                        Foto da ocorrência adicionada com sucesso.
                      </Text>
                      <TouchableOpacity onPress={() => removerFoto()}>
                        <MaterialIcons
                          name="delete-outline"
                          size={20}
                          color="#C93434"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.signatureCard}>
                <View style={styles.signatureHeader}>
                  <View style={styles.signatureIcon}>
                    <MaterialIcons name="draw" size={22} color="#0B4B87" />
                  </View>

                  <View style={styles.signatureHeaderContent}>
                    <Text style={styles.signatureTitle}>Assinatura do técnico</Text>
                    <Text style={styles.signatureSubtitle}>
                      Assine para confirmar a realização da inspeção.
                    </Text>
                  </View>
                </View>

                {assinatura ? (
                  <View style={styles.signatureConfirmed}>
                    <Image
                      source={{ uri: assinatura }}
                      style={styles.signatureImage}
                      resizeMode="contain"
                    />
                    <View style={styles.signatureConfirmedFooter}>
                      <View style={styles.signatureStatus}>
                        <MaterialIcons name="check-circle" size={18} color="#16845F" />
                        <Text style={styles.signatureStatusText}>Assinatura confirmada</Text>
                      </View>
                      <TouchableOpacity onPress={limparAssinatura}>
                        <Text style={styles.signatureClearText}>Refazer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.signatureButton}
                    onPress={abrirAssinatura}
                  >
                    <MaterialIcons name="draw" size={21} color="#FFFFFF" />
                    <Text style={styles.signatureButtonText}>Assinar na tela</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Modal
                visible={assinaturaModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setAssinaturaModal(false)}
              >
                <View style={styles.signatureModalOverlay}>
                  <View style={styles.signatureModal}>
                    <View style={styles.signatureModalHeader}>
                      <View>
                        <Text style={styles.signatureModalTitle}>Assinatura do técnico</Text>
                        <Text style={styles.signatureModalSubtitle}>Desenhe sua assinatura abaixo.</Text>
                      </View>
                      <TouchableOpacity onPress={() => setAssinaturaModal(false)}>
                        <MaterialIcons name="close" size={24} color="#52627A" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.signatureCanvasContainer}>
                      <SignaturePad
                        onOK={assinaturaConfirmada}
                        onEmpty={() => alert("Faça a assinatura antes de confirmar.")}
                      />
                    </View>
                  </View>
                </View>
              </Modal>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setInspecaoIniciada(false);
                    setRespostas({});
                    setObservacao("");
                  }}
                >
                  <Text style={styles.secondaryText}>
                    Voltar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButtonExecution}
                  onPress={finalizarInspecao}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.primaryButtonText}>
                    Finalizar Inspeção
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>

        <FloatingScrollButtons scrollRef={scrollRef} />
      </View>
    );
  }

  const perguntasRevisao = inspecaoEmRevisao?.perguntas || [];
  const respostasRevisao = inspecaoEmRevisao?.respostas || {};
  const fotosRevisao = inspecaoEmRevisao?.fotos || {};
  const perguntasComNaoConformidade = perguntasRevisao.filter((pergunta) => {
    const resposta = respostasRevisao[pergunta.id];
    return typeof resposta === "string" && ["não", "nao"].includes(resposta.trim().toLowerCase());
  });

  // ETAPA 10 — indicadores finais para o encerramento do fluxo.
  const totalInspecoesFinais = inspecoesSalvas.length;
  const totalPendentes = inspecoesSalvas.filter(
    (item) => item.reviewStatus === "PENDENTE"
  ).length;
  const totalAprovadas = inspecoesSalvas.filter(
    (item) => item.reviewStatus === "APROVADA"
  ).length;
  const totalReprovadas = inspecoesSalvas.filter(
    (item) => item.reviewStatus === "REPROVADA"
  ).length;

  return (
    <View style={styles.flex}>
      <Header
        titulo="Inspeções"
        subtitulo="Construtor de modelos"
      />

      <Modal
        visible={modalRevisao}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!processandoRevisao) {
            setModalRevisao(false);
            setInspecaoEmRevisao(null);
          }
        }}
      >
        <View style={styles.reviewModalOverlay}>
          <View style={styles.reviewModal}>
            <View style={styles.reviewModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewModalTitle}>Revisão da inspeção</Text>
                <Text style={styles.reviewModalSubtitle}>
                  Validação final do resultado apresentado pelo técnico.
                </Text>
              </View>
              <TouchableOpacity
                disabled={processandoRevisao}
                onPress={() => {
                  setModalRevisao(false);
                  setInspecaoEmRevisao(null);
                }}
              >
                <MaterialIcons name="close" size={25} color="#52627A" />
              </TouchableOpacity>
            </View>

            {inspecaoEmRevisao && (
              <ScrollView
                style={styles.reviewModalScroll}
                contentContainerStyle={{ paddingBottom: 8 }}
                showsVerticalScrollIndicator={true}
              >
                <View style={styles.reviewInfoCard}>
                  <Text style={styles.reviewInfoTitle}>
                    {inspecaoEmRevisao.titulo}
                  </Text>
                  <Text style={styles.reviewInfoText}>
                    Equipamento: {inspecaoEmRevisao.equipamentoNome}
                  </Text>
                  <Text style={styles.reviewInfoText}>
                    Código: {inspecaoEmRevisao.equipamentoCodigo}
                  </Text>
                  <Text style={styles.reviewInfoText}>
                    Técnico: {inspecaoEmRevisao.tecnico}
                  </Text>
                  <Text style={styles.reviewInfoText}>
                    Conclusão: {new Date(inspecaoEmRevisao.dataConclusao).toLocaleString("pt-BR")}
                  </Text>
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Resultado da inspeção</Text>
                  <View style={styles.reviewResultRow}>
                    <View style={styles.reviewResultIcon}>
                      <MaterialIcons name="fact-check" size={22} color="#0B4B87" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reviewResultTitle}>Inspeção concluída</Text>
                      <Text style={styles.reviewResultText}>
                        O técnico finalizou o checklist e enviou os dados para revisão.
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Observação do técnico</Text>
                  <View style={styles.reviewObservationBox}>
                    <Text style={styles.reviewObservationText}>
                      {inspecaoEmRevisao.observacao || "Nenhuma observação informada."}
                    </Text>
                  </View>
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Respostas do checklist</Text>
                  {perguntasRevisao.length === 0 ? (
                    <View style={styles.reviewEmptyBox}>
                      <MaterialIcons name="info-outline" size={20} color="#7A889A" />
                      <Text style={styles.reviewEmptyText}>
                        As respostas detalhadas não estão disponíveis neste registro.
                      </Text>
                    </View>
                  ) : (
                    perguntasRevisao.map((pergunta, index) => {
                      const resposta = respostasRevisao[pergunta.id] || "Não respondida";
                      const possuiFoto = Boolean(fotosRevisao[pergunta.id]);
                      return (
                        <View key={`${pergunta.id}-${index}`} style={styles.reviewAnswerCard}>
                          <View style={styles.reviewAnswerHeader}>
                            <Text style={styles.reviewAnswerNumber}>
                              {index + 1}
                            </Text>
                            <Text style={styles.reviewAnswerQuestion}>
                              {pergunta.texto}
                            </Text>
                          </View>
                          <View style={styles.reviewAnswerValueRow}>
                            <MaterialIcons
                              name={
                                ["não", "nao"].includes(resposta.trim().toLowerCase())
                                  ? "cancel"
                                  : resposta === "Não respondida"
                                  ? "help-outline"
                                  : "check-circle"
                              }
                              size={18}
                              color={
                                ["não", "nao"].includes(resposta.trim().toLowerCase())
                                  ? "#C92D3A"
                                  : resposta === "Não respondida"
                                  ? "#D88900"
                                  : "#16845F"
                              }
                            />
                            <Text style={styles.reviewAnswerValue}>{resposta}</Text>
                          </View>
                          {possuiFoto && (
                            <View style={styles.reviewEvidenceLabel}>
                              <MaterialIcons name="photo-camera" size={15} color="#0B4B87" />
                              <Text style={styles.reviewEvidenceLabelText}>Evidência fotográfica anexada</Text>
                            </View>
                          )}
                        </View>
                      );
                    })
                  )}
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Não conformidades</Text>
                  {perguntasComNaoConformidade.length === 0 &&
                  (inspecaoEmRevisao.naoConformidades || []).length === 0 ? (
                    <View style={styles.reviewSuccessBox}>
                      <MaterialIcons name="verified" size={21} color="#16845F" />
                      <Text style={styles.reviewSuccessText}>
                        Nenhuma não conformidade identificada nas respostas registradas.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.reviewNonComplianceBox}>
                      <MaterialIcons name="warning" size={21} color="#C92D3A" />
                      <View style={{ flex: 1 }}>
                        {(inspecaoEmRevisao.naoConformidades || []).map((item, index) => (
                          <Text key={`nc-${index}`} style={styles.reviewNonComplianceText}>
                            • {item}
                          </Text>
                        ))}
                        {perguntasComNaoConformidade.map((pergunta, index) => (
                          <Text key={`nc-q-${pergunta.id}-${index}`} style={styles.reviewNonComplianceText}>
                            • {pergunta.texto}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Evidências fotográficas</Text>
                  {Object.keys(fotosRevisao).length === 0 ? (
                    <View style={styles.reviewEmptyBox}>
                      <MaterialIcons name="photo-library" size={20} color="#7A889A" />
                      <Text style={styles.reviewEmptyText}>Nenhuma foto de evidência registrada.</Text>
                    </View>
                  ) : (
                    <View style={styles.reviewPhotosGrid}>
                      {Object.entries(fotosRevisao).map(([questionId, uri]) => (
                        <View key={questionId} style={styles.reviewPhotoCard}>
                          <Image source={{ uri: String(uri) }} style={styles.reviewPhoto} resizeMode="cover" />
                          <Text style={styles.reviewPhotoCaption} numberOfLines={2}>
                            {perguntasRevisao.find((pergunta) => pergunta.id === questionId)?.texto || "Evidência"}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Assinatura do técnico</Text>
                  {inspecaoEmRevisao.assinatura ? (
                    <View style={styles.reviewSignatureCard}>
                      <Image
                        source={{ uri: inspecaoEmRevisao.assinatura }}
                        style={styles.reviewSignatureImage}
                        resizeMode="contain"
                      />
                      <View style={styles.reviewEvidenceLabel}>
                        <MaterialIcons name="draw" size={15} color="#0B4B87" />
                        <Text style={styles.reviewEvidenceLabelText}>Assinatura registrada na conclusão</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.reviewEmptyBox}>
                      <MaterialIcons name="draw" size={20} color="#7A889A" />
                      <Text style={styles.reviewEmptyText}>Nenhuma assinatura registrada.</Text>
                    </View>
                  )}
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionTitle}>Decisão da revisão</Text>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Observação da revisão ou justificativa da reprovação"
                    placeholderTextColor="#8B98AA"
                    value={observacaoRevisao}
                    onChangeText={setObservacaoRevisao}
                    multiline
                    textAlignVertical="top"
                    editable={!processandoRevisao}
                  />
                </View>

                {inspecaoEmRevisao.reviewStatus !== "PENDENTE" && (
                  <View style={styles.previousReviewBox}>
                    <Text style={styles.previousReviewTitle}>Histórico da revisão</Text>
                    <Text style={styles.previousReviewText}>
                      Status: {inspecaoEmRevisao.reviewStatus === "APROVADA" ? "Aprovada" : "Reprovada"}
                    </Text>
                    {inspecaoEmRevisao.revisadoPor ? (
                      <Text style={styles.previousReviewText}>
                        Responsável: {inspecaoEmRevisao.revisadoPor}
                      </Text>
                    ) : null}
                    {inspecaoEmRevisao.dataRevisao ? (
                      <Text style={styles.previousReviewText}>
                        Data da revisão: {new Date(inspecaoEmRevisao.dataRevisao).toLocaleString("pt-BR")}
                      </Text>
                    ) : null}
                    <Text style={styles.previousReviewText}>
                      Observação: {inspecaoEmRevisao.observacaoRevisao || "Nenhuma observação registrada."}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.reviewModalButtons}>
              <TouchableOpacity
                style={styles.rejectReviewButton}
                disabled={processandoRevisao}
                onPress={() => concluirRevisao("REPROVADA")}
                activeOpacity={0.8}
              >
                {processandoRevisao ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={19} color="#FFFFFF" />
                    <Text style={styles.reviewActionText}>Reprovar</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.approveReviewButton}
                disabled={processandoRevisao}
                onPress={() => concluirRevisao("APROVADA")}
                activeOpacity={0.8}
              >
                {processandoRevisao ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={19} color="#FFFFFF" />
                    <Text style={styles.reviewActionText}>Aprovar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
        ref={scrollRef}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        alwaysBounceVertical={true}
        bounces={true}
        directionalLockEnabled={true}
      >
        {inspecoesSalvas.length > 0 && (
          <View style={styles.finalFlowCard}>
            <View style={styles.finalFlowHeader}>
              <View style={styles.finalFlowIcon}>
                <MaterialIcons name="task-alt" size={22} color="#0B4B87" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.finalFlowTitle}>Fechamento do fluxo</Text>
                <Text style={styles.finalFlowSubtitle}>
                  Resumo das inspeções concluídas e revisadas.
                </Text>
              </View>
            </View>

            <View style={styles.finalFlowStats}>
              <View style={styles.finalFlowStat}>
                <Text style={styles.finalFlowStatValue}>{totalInspecoesFinais}</Text>
                <Text style={styles.finalFlowStatLabel}>Total</Text>
              </View>
              <View style={styles.finalFlowStat}>
                <Text style={styles.finalFlowStatValue}>{totalPendentes}</Text>
                <Text style={styles.finalFlowStatLabel}>Pendentes</Text>
              </View>
              <View style={styles.finalFlowStat}>
                <Text style={styles.finalFlowStatValue}>{totalAprovadas}</Text>
                <Text style={styles.finalFlowStatLabel}>Aprovadas</Text>
              </View>
              <View style={styles.finalFlowStat}>
                <Text style={styles.finalFlowStatValue}>{totalReprovadas}</Text>
                <Text style={styles.finalFlowStatLabel}>Reprovadas</Text>
              </View>
            </View>

            <View style={styles.finalFlowMessage}>
              <MaterialIcons
                name={totalPendentes === 0 ? "verified" : "pending-actions"}
                size={18}
                color={totalPendentes === 0 ? "#16845F" : "#D88900"}
              />
              <Text style={styles.finalFlowMessageText}>
                {totalPendentes === 0
                  ? "Todas as inspeções deste histórico possuem decisão de revisão."
                  : `${totalPendentes} inspeção${totalPendentes > 1 ? "ões" : ""} aguardando revisão.`}
              </Text>
            </View>
          </View>
        )}

        {inspecoesSalvas.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>
                  Histórico de Inspeções
                </Text>
                <Text style={styles.cardSubtitle}>
                  Inspeções finalizadas e salvas no banco de dados
                </Text>
              </View>

              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  {inspecoesSalvas.length}
                </Text>
              </View>
            </View>

            {inspecoesSalvas.map((inspecao) => (
              <View key={inspecao.id} style={styles.savedInspectionCard}>
                <View style={styles.savedInspectionIcon}>
                  <MaterialIcons
                    name="check-circle"
                    size={22}
                    color="#16845F"
                  />
                </View>

                <View style={styles.savedInspectionContent}>
                  <Text style={styles.savedInspectionTitle}>
                    {inspecao.titulo}
                  </Text>

                  <Text style={styles.savedInspectionEquipment}>
                    {inspecao.equipamentoNome} • {inspecao.equipamentoCodigo}
                  </Text>

                  <Text style={styles.savedInspectionMeta}>
                    Técnico: {inspecao.tecnico}
                  </Text>

                  <Text style={styles.savedInspectionMeta}>
                    Concluída em{" "}
                    {new Date(inspecao.dataConclusao).toLocaleString("pt-BR")}
                  </Text>

                  {inspecao.reviewStatus !== "PENDENTE" && (
                    <Text style={styles.savedInspectionMeta}>
                      Revisada em{" "}
                      {inspecao.dataRevisao
                        ? new Date(inspecao.dataRevisao).toLocaleString("pt-BR")
                        : "data não informada"}
                    </Text>
                  )}

                  {inspecao.situacaoFinal !== "PENDENTE" && (
                    <Text style={styles.savedInspectionMeta}>
                      Situação final: {inspecao.situacaoFinal === "APROVADA" ? "Aprovada" : "Reprovada"}
                    </Text>
                  )}

                  {inspecao.equipamentoStatusFinal && (
                    <Text style={styles.savedInspectionMeta}>
                      Equipamento após revisão: {inspecao.equipamentoStatusFinal}
                    </Text>
                  )}
                </View>

                <View style={styles.savedInspectionActions}>
                  <View
                    style={[
                      styles.reviewBadge,
                      inspecao.reviewStatus === "APROVADA"
                        ? styles.reviewBadgeApproved
                        : inspecao.reviewStatus === "REPROVADA"
                        ? styles.reviewBadgeRejected
                        : styles.reviewBadgePending,
                    ]}
                  >
                    <Text style={styles.reviewBadgeText}>
                      {inspecao.reviewStatus === "APROVADA"
                        ? "Aprovada"
                        : inspecao.reviewStatus === "REPROVADA"
                        ? "Reprovada"
                        : "Pendente de revisão"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => abrirRevisao(inspecao)}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={
                        inspecao.reviewStatus === "PENDENTE"
                          ? "rate-review"
                          : "visibility"
                      }
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.reviewButtonText}>
                      {inspecao.reviewStatus === "PENDENTE"
                        ? "Revisar"
                        : "Ver revisão"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.pageTitleText}>
          Construtor de Inspeção
        </Text>

        <Text style={styles.pageDescription}>
          Crie e configure modelos de inspeção para sua equipe.
        </Text>

        <TouchableOpacity
          style={styles.executeInspectionButton}
          onPress={() => setModoExecucao(true)}
        >
          <View style={styles.executeInspectionIcon}>
            <MaterialIcons
              name="play-arrow"
              size={23}
              color="#0B4B87"
            />
          </View>

          <View style={styles.executeInspectionContent}>
            <Text style={styles.executeInspectionTitle}>
              Executar Inspeção
            </Text>

            <Text style={styles.executeInspectionDescription}>
              Selecione um equipamento e execute o checklist em campo.
            </Text>
          </View>

          <MaterialIcons
            name="chevron-right"
            size={24}
            color="#7A889A"
          />
        </TouchableOpacity>

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
            onPress={() => setMostrarTipos(!mostrarTipos)}
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
                {perguntas.length} perguntas cadastradas
              </Text>
            </View>

            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {perguntas.length}
              </Text>
            </View>
          </View>

          {perguntas.map((pergunta, index) => (
            <QuestionCard
              key={pergunta.id}
              numero={index + 1}
              pergunta={pergunta}
            />
          ))}

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
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>
              Cancelar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton}>
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

      <FloatingScrollButtons scrollRef={scrollRef} />
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
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"Todos" | StatusEquipamento>("Todos");
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);
  const [modalForm, setModalForm] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [nome, setNome] = useState("");
  const [codigo, setCodigo] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [status, setStatus] = useState<StatusEquipamento>("Ativo");

  async function carregarEquipamentos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await fetch(`${API_URL}/equipments`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Não foi possível carregar os equipamentos."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida ao carregar os equipamentos.");
      }

      const lista: Equipamento[] = data.map((item: any) => ({
        id: String(item.id),
        nome: String(item.name || "Equipamento sem nome"),
        codigo: String(item.code || "Sem código"),
        local: String(item.location || "Não informado"),
        tipo: "Equipamento",
        responsavel: "Não informado",
        descricao:
          item.description === null || item.description === undefined
            ? ""
            : String(item.description),
        status:
          item.status === "MAINTENANCE"
            ? "Manutenção"
            : item.status === "INACTIVE"
            ? "Inativo"
            : "Ativo",
      }));

      setEquipamentos(lista);
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os equipamentos."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  function limparFormulario() {
    setNome("");
    setCodigo("");
    setLocal("");
    setDescricao("");
    setStatus("Ativo");
    setEditandoId(null);
  }

  function abrirNovoEquipamento() {
    limparFormulario();
    setEquipamentoSelecionado(null);
    setModalForm(true);
  }

  function abrirEdicao(equipamento: Equipamento) {
    setEquipamentoSelecionado(null);
    setEditandoId(equipamento.id);
    setNome(equipamento.nome);
    setCodigo(equipamento.codigo);
    setLocal(equipamento.local);
    setDescricao(equipamento.descricao || "");
    setStatus(equipamento.status);
    setModalForm(true);
  }

  function fecharFormulario() {
    if (salvando) return;
    setModalForm(false);
    limparFormulario();
  }

  function statusParaBackend(valor: StatusEquipamento) {
    if (valor === "Manutenção") return "MAINTENANCE";
    if (valor === "Inativo") return "INACTIVE";
    return "ACTIVE";
  }

  async function salvarEquipamento() {
    if (!nome.trim()) {
      alert("Informe o nome do equipamento.");
      return;
    }

    if (!codigo.trim()) {
      alert("Informe o código do equipamento.");
      return;
    }

    if (!local.trim()) {
      alert("Informe a localização do equipamento.");
      return;
    }

    try {
      setSalvando(true);

      const body = {
        name: nome.trim(),
        code: codigo.trim().toUpperCase(),
        location: local.trim(),
        description: descricao.trim() || null,
        status: statusParaBackend(status),
      };

      const response = await fetch(
        editandoId
          ? `${API_URL}/equipments/${editandoId}`
          : `${API_URL}/equipments`,
        {
          method: editandoId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            (editandoId
              ? "Não foi possível atualizar o equipamento."
              : "Não foi possível cadastrar o equipamento.")
        );
      }

      setModalForm(false);
      limparFormulario();
      await carregarEquipamentos();

      alert(
        editandoId
          ? "Equipamento atualizado com sucesso."
          : "Equipamento cadastrado com sucesso."
      );
    } catch (error) {
      console.error("Erro ao salvar equipamento:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o equipamento."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(
    equipamento: Equipamento,
    novoStatus: StatusEquipamento
  ) {
    try {
      const response = await fetch(
        `${API_URL}/equipments/${equipamento.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: statusParaBackend(novoStatus),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Não foi possível alterar o status."
        );
      }

      setEquipamentos((lista) =>
        lista.map((item) =>
          item.id === equipamento.id
            ? { ...item, status: novoStatus }
            : item
        )
      );

      setEquipamentoSelecionado((atual) =>
        atual && atual.id === equipamento.id
          ? { ...atual, status: novoStatus }
          : atual
      );

      const mensagem =
        novoStatus === "Inativo"
          ? "Equipamento inativado com sucesso."
          : novoStatus === "Manutenção"
          ? "Equipamento colocado em manutenção."
          : "Equipamento ativado com sucesso.";

      alert(mensagem);
    } catch (error) {
      console.error("Erro ao alterar status do equipamento:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do equipamento."
      );
    }
  }

  const equipamentosFiltrados = equipamentos.filter((item) => {
    const termo = busca.trim().toLowerCase();

    const correspondeBusca =
      !termo ||
      item.nome.toLowerCase().includes(termo) ||
      item.codigo.toLowerCase().includes(termo) ||
      item.local.toLowerCase().includes(termo);

    const correspondeFiltro =
      filtro === "Todos" || item.status === filtro;

    return correspondeBusca && correspondeFiltro;
  });

  return (
    <View style={styles.flex}>
      <Header
        titulo="Equipamentos"
        subtitulo="Cadastro e acompanhamento"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.pageTitleText}>Equipamentos</Text>
            <Text style={styles.pageDescription}>
              Cadastre, edite e acompanhe os equipamentos.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addCircle}
            onPress={abrirNovoEquipamento}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={25} color="#FFFFFF" />
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
            placeholder="Buscar por nome, código ou local..."
            placeholderTextColor="#8A96A8"
            style={styles.searchInput}
          />

          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca("")}>
              <MaterialIcons
                name="close"
                size={20}
                color="#7B8798"
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 4 }}
        >
          <View style={styles.filtersRow}>
            <TouchableOpacity
              style={filtro === "Todos" ? styles.activeFilter : styles.normalFilter}
              onPress={() => setFiltro("Todos")}
            >
              {filtro === "Todos" && (
                <MaterialIcons
                  name="filter-list"
                  size={17}
                  color="#0B4B87"
                />
              )}
              <Text
                style={
                  filtro === "Todos"
                    ? styles.activeFilterText
                    : styles.normalFilterText
                }
              >
                Todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={filtro === "Ativo" ? styles.activeFilter : styles.normalFilter}
              onPress={() => setFiltro("Ativo")}
            >
              <Text
                style={
                  filtro === "Ativo"
                    ? styles.activeFilterText
                    : styles.normalFilterText
                }
              >
                Ativos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                filtro === "Manutenção"
                  ? styles.activeFilter
                  : styles.normalFilter
              }
              onPress={() => setFiltro("Manutenção")}
            >
              <Text
                style={
                  filtro === "Manutenção"
                    ? styles.activeFilterText
                    : styles.normalFilterText
                }
              >
                Manutenção
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                filtro === "Inativo"
                  ? styles.activeFilter
                  : styles.normalFilter
              }
              onPress={() => setFiltro("Inativo")}
            >
              <Text
                style={
                  filtro === "Inativo"
                    ? styles.activeFilterText
                    : styles.normalFilterText
                }
              >
                Inativos
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {erro !== "" && (
          <View
            style={{
              backgroundColor: "#FFF3F3",
              borderWidth: 1,
              borderColor: "#FFD1D1",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name="error-outline"
              size={20}
              color="#C52C2C"
            />
            <Text
              style={{
                flex: 1,
                color: "#A52C2C",
                fontSize: 12,
                marginLeft: 8,
              }}
            >
              {erro}
            </Text>
            <TouchableOpacity onPress={carregarEquipamentos}>
              <Text
                style={{
                  color: "#0B4B87",
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={styles.resultsText}>
            {equipamentosFiltrados.length} equipamento(s)
          </Text>

          <TouchableOpacity
            onPress={carregarEquipamentos}
            disabled={carregando}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <MaterialIcons
              name="refresh"
              size={17}
              color="#0B4B87"
            />
            <Text
              style={{
                color: "#0B4B87",
                fontSize: 10,
                fontWeight: "700",
              }}
            >
              Atualizar
            </Text>
          </TouchableOpacity>
        </View>

        {carregando ? (
          <View style={{ paddingVertical: 45, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0B4B87" />
            <Text
              style={{
                color: "#718097",
                fontSize: 12,
                marginTop: 10,
              }}
            >
              Carregando equipamentos...
            </Text>
          </View>
        ) : equipamentosFiltrados.length === 0 ? (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#DEE4EB",
              borderRadius: 8,
              padding: 28,
              alignItems: "center",
            }}
          >
            <MaterialIcons
              name="precision-manufacturing"
              size={42}
              color="#AAB6C6"
            />
            <Text
              style={{
                color: "#45546C",
                fontSize: 13,
                fontWeight: "700",
                marginTop: 10,
              }}
            >
              Nenhum equipamento encontrado
            </Text>
            <Text
              style={{
                color: "#8190A5",
                fontSize: 10,
                textAlign: "center",
                marginTop: 5,
              }}
            >
              Ajuste a busca ou cadastre um novo equipamento.
            </Text>
          </View>
        ) : (
          equipamentosFiltrados.map((equipamento) => (
            <EquipmentCard
              key={equipamento.id}
              equipamento={equipamento}
              onPress={() => setEquipamentoSelecionado(equipamento)}
            />
          ))
        )}
      </ScrollView>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      <Modal
        visible={modalForm}
        transparent
        animationType="slide"
        onRequestClose={fecharFormulario}
      >
        <KeyboardAvoidingView
          style={styles.modalBackground}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 20,
              paddingBottom: 24,
              maxHeight: "92%",
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {editandoId
                      ? "Editar equipamento"
                      : "Novo equipamento"}
                  </Text>
                  <Text
                    style={{
                      color: "#7A889B",
                      fontSize: 10,
                      marginTop: 3,
                    }}
                  >
                    Os campos com * são obrigatórios.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={fecharFormulario}
                  disabled={salvando}
                >
                  <MaterialIcons
                    name="close"
                    size={25}
                    color="#33445F"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput
                value={nome}
                onChangeText={setNome}
                style={styles.input}
                placeholder="Ex.: Compressor de Ar Industrial"
                placeholderTextColor="#9AA5B5"
                editable={!salvando}
              />

              <Text style={styles.inputLabel}>Código *</Text>
              <TextInput
                value={codigo}
                onChangeText={setCodigo}
                style={styles.input}
                placeholder="Ex.: COMP-002"
                placeholderTextColor="#9AA5B5"
                autoCapitalize="characters"
                editable={!salvando}
              />

              <Text style={styles.inputLabel}>Localização *</Text>
              <TextInput
                value={local}
                onChangeText={setLocal}
                style={styles.input}
                placeholder="Ex.: Setor de Produção"
                placeholderTextColor="#9AA5B5"
                editable={!salvando}
              />

              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                value={descricao}
                onChangeText={setDescricao}
                style={[styles.executionInput, { marginHorizontal: 14 }]}
                placeholder="Descreva a finalidade ou características do equipamento..."
                placeholderTextColor="#9AA5B5"
                multiline
                editable={!salvando}
              />

              <Text style={styles.inputLabel}>Status</Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  paddingHorizontal: 14,
                  marginBottom: 18,
                }}
              >
                {(["Ativo", "Manutenção", "Inativo"] as StatusEquipamento[]).map(
                  (item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => setStatus(item)}
                      disabled={salvando}
                      style={{
                        flex: 1,
                        minHeight: 42,
                        borderWidth: 1,
                        borderColor:
                          status === item ? "#AFCDEB" : "#D8E1EB",
                        borderRadius: 6,
                        backgroundColor:
                          status === item ? "#EAF2FC" : "#FFFFFF",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color:
                            status === item ? "#0B4B87" : "#59677E",
                          fontSize: 10,
                          fontWeight:
                            status === item ? "700" : "500",
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={fecharFormulario}
                  disabled={salvando}
                >
                  <Text style={styles.secondaryText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, margin: 0 }]}
                  onPress={salvarEquipamento}
                  disabled={salvando}
                >
                  {salvando ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialIcons
                        name="save"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.primaryButtonText}>
                        {editandoId ? "Salvar alterações" : "Cadastrar"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL DE DETALHES */}
      <Modal
        visible={equipamentoSelecionado !== null && !modalForm}
        transparent
        animationType="slide"
        onRequestClose={() => setEquipamentoSelecionado(null)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Detalhes do Equipamento
              </Text>

              <TouchableOpacity
                onPress={() => setEquipamentoSelecionado(null)}
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
                  titulo="Localização"
                  valor={equipamentoSelecionado.local}
                />

                <Detail
                  titulo="Descrição"
                  valor={
                    equipamentoSelecionado.descricao ||
                    "Nenhuma descrição informada."
                  }
                />

                <Detail
                  titulo="Status"
                  valor={equipamentoSelecionado.status}
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => abrirEdicao(equipamentoSelecionado)}
                >
                  <MaterialIcons
                    name="edit"
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={styles.primaryButtonText}>
                    Editar equipamento
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    marginHorizontal: 12,
                    marginBottom: 10,
                  }}
                >
                  {equipamentoSelecionado.status !== "Ativo" && (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        minHeight: 42,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: "#BFE4D2",
                        backgroundColor: "#F1FBF6",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        alterarStatus(equipamentoSelecionado, "Ativo")
                      }
                    >
                      <Text
                        style={{
                          color: "#16845F",
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        Ativar
                      </Text>
                    </TouchableOpacity>
                  )}

                  {equipamentoSelecionado.status !== "Manutenção" && (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        minHeight: 42,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: "#F1D6A4",
                        backgroundColor: "#FFF9ED",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        alterarStatus(
                          equipamentoSelecionado,
                          "Manutenção"
                        )
                      }
                    >
                      <Text
                        style={{
                          color: "#D38100",
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        Manutenção
                      </Text>
                    </TouchableOpacity>
                  )}

                  {equipamentoSelecionado.status !== "Inativo" && (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        minHeight: 42,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: "#E1E4EA",
                        backgroundColor: "#F5F6F8",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        alterarStatus(
                          equipamentoSelecionado,
                          "Inativo"
                        )
                      }
                    >
                      <Text
                        style={{
                          color: "#657187",
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        Inativar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.secondaryButton, { marginHorizontal: 12 }]}
                  onPress={() => setEquipamentoSelecionado(null)}
                >
                  <Text style={styles.secondaryText}>Fechar</Text>
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

interface NotificacaoApp {
  id: string;
  titulo: string;
  mensagem: string;
  data: string;
  tipo: "INSPECAO" | "REVISAO" | "SINCRONIZACAO" | "SISTEMA";
  lida: boolean;
}

function PerfilScreen({
  usuario,
  onLogout,
  inspecoesSalvas,
  online,
}: {
  usuario: UsuarioLogado | null;
  onLogout: () => void;
  inspecoesSalvas: InspecaoSalva[];
  online: boolean;
}) {
  const [modalPerfil, setModalPerfil] = useState<string | null>(null);
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);
  const [notificacoes, setNotificacoes] = useState<NotificacaoApp[]>([]);

  useEffect(() => {
    let ativo = true;

    const carregarPreferencia = async () => {
      try {
        const valor = await AsyncStorage.getItem("@opscontrol/notificacoes-ativas");
        if (ativo && valor !== null) {
          setNotificacoesAtivas(valor === "true");
        }
      } catch (error) {
        console.error("Erro ao carregar preferência de notificações:", error);
      }
    };

    carregarPreferencia();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    const gerarNotificacoes = async () => {
      try {
        const salvas = await AsyncStorage.getItem("@opscontrol/notificacoes");
        const existentes: NotificacaoApp[] = salvas ? JSON.parse(salvas) : [];
        const mapa = new Map(existentes.map((item) => [item.id, item]));

        inspecoesSalvas.forEach((inspecao) => {
          if (inspecao.reviewStatus === "PENDENTE") {
            const id = `revisao-${inspecao.id}`;
            if (!mapa.has(id)) {
              mapa.set(id, {
                id,
                titulo: "Inspeção pendente de revisão",
                mensagem: `${inspecao.titulo} • ${inspecao.equipamentoNome}`,
                data: inspecao.dataConclusao || new Date().toISOString(),
                tipo: "REVISAO",
                lida: false,
              });
            }
          }
        });

        const filaOffline = inspecoesSalvas.filter((item) => item.reviewStatus === "PENDENTE").length;
        if (!online && filaOffline > 0) {
          const id = "modo-offline-inspecoes";
          if (!mapa.has(id)) {
            mapa.set(id, {
              id,
              titulo: "Modo offline ativo",
              mensagem: `${filaOffline} inspeção(ões) aguardando processamento/sincronização.`,
              data: new Date().toISOString(),
              tipo: "SINCRONIZACAO",
              lida: false,
            });
          }
        }

        const lista = Array.from(mapa.values())
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
          .slice(0, 30);
        setNotificacoes(lista);
        await AsyncStorage.setItem("@opscontrol/notificacoes", JSON.stringify(lista));
      } catch (error) {
        console.error("Erro ao atualizar notificações:", error);
      }
    };

    gerarNotificacoes();
  }, [inspecoesSalvas, online]);

  async function alternarNotificacoes() {
    const novoValor = !notificacoesAtivas;
    setNotificacoesAtivas(novoValor);
    try {
      await AsyncStorage.setItem("@opscontrol/notificacoes-ativas", String(novoValor));
    } catch (error) {
      console.error("Erro ao salvar preferência de notificações:", error);
    }
  }

  async function marcarTodasComoLidas() {
    const atualizadas = notificacoes.map((item) => ({ ...item, lida: true }));
    setNotificacoes(atualizadas);
    try {
      await AsyncStorage.setItem("@opscontrol/notificacoes", JSON.stringify(atualizadas));
    } catch (error) {
      console.error("Erro ao salvar notificações:", error);
    }
  }

  function abrirOpcao(titulo: string) {
    setModalPerfil(titulo);
  }

  function fecharOpcao() {
    setModalPerfil(null);
  }

  const renderConteudoModal = () => {
    switch (modalPerfil) {
      case "Dados pessoais":
        return (
          <>
            <View style={styles.profileModalInfoRow}>
              <MaterialIcons name="person" size={20} color="#0B4B87" />
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>Nome</Text>
                <Text style={styles.profileModalValue}>{usuario?.name || "Usuário"}</Text>
              </View>
            </View>
            <View style={styles.profileModalInfoRow}>
              <MaterialIcons name="email" size={20} color="#0B4B87" />
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>E-mail</Text>
                <Text style={styles.profileModalValue}>{usuario?.email || "Não informado"}</Text>
              </View>
            </View>
            <View style={styles.profileModalInfoRow}>
              <MaterialIcons name="badge" size={20} color="#0B4B87" />
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>Perfil de acesso</Text>
                <Text style={styles.profileModalValue}>{usuario?.role || "TECHNICIAN"}</Text>
              </View>
            </View>
          </>
        );

      case "Notificações":
        return (
          <>
            <View style={styles.profileSettingRow}>
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>Notificações do OpsControl</Text>
                <Text style={styles.profileModalHelp}>
                  Receba avisos sobre inspeções pendentes, revisões e sincronização.
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.profileToggle,
                  notificacoesAtivas && styles.profileToggleActive,
                ]}
                onPress={alternarNotificacoes}
              >
                <View
                  style={[
                    styles.profileToggleThumb,
                    notificacoesAtivas && styles.profileToggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.notificationSummary}>
              <MaterialIcons name="notifications-active" size={22} color="#0B4B87" />
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>Central de notificações</Text>
                <Text style={styles.profileModalHelp}>
                  {notificacoes.filter((item) => !item.lida).length} aviso(s) não lido(s)
                </Text>
              </View>
              {notificacoes.length > 0 && (
                <TouchableOpacity onPress={marcarTodasComoLidas}>
                  <Text style={styles.notificationMarkRead}>Marcar como lidas</Text>
                </TouchableOpacity>
              )}
            </View>

            {!notificacoesAtivas && (
              <View style={styles.notificationDisabledBox}>
                <MaterialIcons name="notifications-off" size={22} color="#B7791F" />
                <Text style={styles.profileModalHelp}>
                  As notificações estão desativadas. A central continuará disponível para consulta.
                </Text>
              </View>
            )}

            {notificacoes.length === 0 ? (
              <View style={styles.notificationEmpty}>
                <MaterialIcons name="notifications-none" size={38} color="#A0AABC" />
                <Text style={styles.notificationEmptyTitle}>Nenhuma notificação</Text>
                <Text style={styles.profileModalHelp}>Tudo certo por enquanto.</Text>
              </View>
            ) : (
              notificacoes.map((item) => (
                <View key={item.id} style={[styles.notificationItem, !item.lida && styles.notificationItemUnread]}>
                  <View style={styles.notificationIcon}>
                    <MaterialIcons
                      name={item.tipo === "REVISAO" ? "fact-check" : item.tipo === "SINCRONIZACAO" ? "sync" : "notifications"}
                      size={19}
                      color="#0B4B87"
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{item.titulo}</Text>
                    <Text style={styles.notificationMessage}>{item.mensagem}</Text>
                    <Text style={styles.notificationDate}>
                      {new Date(item.data).toLocaleString("pt-BR")}
                    </Text>
                  </View>
                  {!item.lida && <View style={styles.notificationUnreadDot} />}
                </View>
              ))
            )}
          </>
        );

      case "Segurança":
        return (
          <>
            <View style={styles.profileSecurityBox}>
              <MaterialIcons name="verified-user" size={28} color="#16845F" />
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>Sessão protegida</Text>
                <Text style={styles.profileModalHelp}>
                  Sua conta está autenticada pelo OpsControl.
                </Text>
              </View>
            </View>
            <Text style={styles.profileModalHelp}>
              Para encerrar o acesso neste dispositivo, use o botão “Sair da conta”.
            </Text>
          </>
        );

      case "Configurações":
        return (
          <>
            <View style={styles.profileModalInfoRow}>
              <MaterialIcons name="language" size={20} color="#0B4B87" />
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>Idioma</Text>
                <Text style={styles.profileModalValue}>Português (Brasil)</Text>
              </View>
            </View>
            <View style={styles.profileModalInfoRow}>
              <MaterialIcons name="cloud" size={20} color="#0B4B87" />
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>Sincronização</Text>
                <Text style={styles.profileModalValue}>Automática quando houver conexão</Text>
              </View>
            </View>
            <View style={styles.profileModalInfoRow}>
              <MaterialIcons name="offline-bolt" size={20} color="#0B4B87" />
              <View style={styles.profileModalInfoContent}>
                <Text style={styles.profileModalLabel}>Modo offline</Text>
                <Text style={styles.profileModalValue}>Ativo para inspeções pendentes</Text>
              </View>
            </View>
          </>
        );

      case "Ajuda":
        return (
          <>
            <View style={styles.profileHelpBox}>
              <MaterialIcons name="help-outline" size={30} color="#0B4B87" />
              <Text style={styles.profileModalLabel}>Como usar o OpsControl</Text>
              <Text style={styles.profileModalHelp}>
                Acesse Inspeções para executar checklists, registre evidências e conclua a inspeção.
                Quando a conexão voltar, os dados pendentes serão sincronizados.
              </Text>
            </View>
            <Text style={styles.profileModalVersion}>OpsControl • Gestão de inspeções em campo</Text>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.flex}>
      <Header
        titulo="Perfil"
        subtitulo="Configurações do supervisor"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
            {usuario?.name || "Usuário"}
          </Text>

          <Text style={styles.profileRole}>
            {usuario?.role || "TECHNICIAN"}
          </Text>

          <Text style={{ color: "#738198", fontSize: 12, marginTop: 4 }}>
            {usuario?.email || ""}
          </Text>
        </View>

        <View style={styles.card}>
          <ProfileItem
            icon="person-outline"
            title="Dados pessoais"
            onPress={() => abrirOpcao("Dados pessoais")}
          />

          <ProfileItem
            icon="notifications-none"
            title="Notificações"
            onPress={() => abrirOpcao("Notificações")}
          />

          <ProfileItem
            icon="lock-outline"
            title="Segurança"
            onPress={() => abrirOpcao("Segurança")}
          />

          <ProfileItem
            icon="settings"
            title="Configurações"
            onPress={() => abrirOpcao("Configurações")}
          />

          <ProfileItem
            icon="help-outline"
            title="Ajuda"
            onPress={() => abrirOpcao("Ajuda")}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
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

      <Modal
        visible={modalPerfil !== null}
        transparent
        animationType="slide"
        onRequestClose={fecharOpcao}
      >
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModalCard}>
            <View style={styles.profileModalHeader}>
              <View style={styles.profileModalTitleArea}>
                <Text style={styles.profileModalTitle}>{modalPerfil}</Text>
                <Text style={styles.profileModalSubtitle}>OpsControl</Text>
              </View>

              <TouchableOpacity
                style={styles.profileModalClose}
                onPress={fecharOpcao}
              >
                <MaterialIcons name="close" size={22} color="#65748A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.profileModalScroll}
              contentContainerStyle={styles.profileModalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {renderConteudoModal()}

              <TouchableOpacity
                style={styles.profileModalButton}
                onPress={fecharOpcao}
              >
                <Text style={styles.profileModalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   PROFILE ITEM
========================================================= */

function ProfileItem({
  icon,
  title,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
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

  /* LOGIN */

  loginContainer: {
    flex: 1,
    backgroundColor: "#062B57",
  },

  loginContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 35,
  },

  loginBrand: {
    alignItems: "center",
    marginBottom: 25,
  },

  loginLogo: {
    width: 78,
    height: 78,
    borderRadius: 20,
    backgroundColor: "#123F70",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  loginBrandName: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  loginBrandSubtitle: {
    color: "#B8CBE0",
    fontSize: 13,
    marginTop: 5,
  },

  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
    width: "100%",
    maxWidth: 470,
    alignSelf: "center",
  },

  loginTitle: {
    color: "#202A37",
    fontSize: 25,
    fontWeight: "700",
  },

  loginDescription: {
    color: "#718096",
    fontSize: 13,
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 20,
  },

  loginLabel: {
    color: "#40516A",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 9,
  },

  loginInputContainer: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D7DEE8",
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },

  loginInput: {
    flex: 1,
    height: "100%",
    color: "#273345",
    fontSize: 13,
    marginLeft: 9,
  },

  loginError: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFD3D3",
    borderRadius: 6,
    padding: 9,
    marginTop: 13,
    gap: 7,
  },

  loginErrorText: {
    flex: 1,
    color: "#C52C2C",
    fontSize: 10,
    lineHeight: 14,
  },

  loginButton: {
    height: 48,
    backgroundColor: "#062B57",
    borderRadius: 7,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  forgotButton: {
    alignItems: "center",
    marginTop: 16,
  },

  forgotText: {
    color: "#0B4B87",
    fontSize: 12,
    fontWeight: "600",
  },

  loginFooter: {
    color: "#9EB4CC",
    fontSize: 10,
    textAlign: "center",
    marginTop: 22,
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
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  headerTitulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
  },

  headerSubtitulo: {
    color: "#AFC2D9",
    fontSize: 10,
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

  /* CONEXÃO */

  offlineBanner: {
    minHeight: 62,
    backgroundColor: "#C93434",
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  offlineBannerContent: {
    flex: 1,
  },

  offlineBannerTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  offlineBannerText: {
    color: "#FFFFFF",
    opacity: 0.92,
    fontSize: 10,
    lineHeight: 12,
    marginTop: 2,
  },

  syncBanner: {
    minHeight: 45,
    backgroundColor: "#EAF2FC",
    borderBottomWidth: 1,
    borderBottomColor: "#C9DDF3",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  syncBannerText: {
    flex: 1,
    color: "#0B4B87",
    fontSize: 10,
    fontWeight: "600",
  },

  /* ÁREA PRINCIPAL ACIMA DA NAVEGAÇÃO */

  mainContent: {
    flex: 1,
    minHeight: 0,
    overflow: "visible",
  },

  /* SCROLL */

  scroll: {
    flex: 1,
    minHeight: 0,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 220,
    flexGrow: 1,
  },

  scrollContentDesktop: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
  },

  scrollButtonsContainer: {
    position: "absolute",
    right: 12,
    bottom: 82,
    alignItems: "center",
    gap: 8,
    zIndex: 100,
    elevation: 8,
  },

  scrollButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0B4B87",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    elevation: 7,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: "#000000",
  },

  /* TÍTULO */

  pageTitle: {
    marginBottom: 17,
  },

  pageTitleText: {
    color: "#1E2734",
    fontSize: 28,
    fontWeight: "700",
  },

  pageDescription: {
    color: "#68788F",
    fontSize: 13,
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
    fontSize: 12,
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
    fontSize: 30,
    fontWeight: "700",
    marginTop: 8,
  },

  statValueDanger: {
    color: "#C5262E",
  },

  statDescription: {
    fontSize: 10,
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

  dashboardError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F3C5C5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  dashboardErrorText: {
    flex: 1,
    color: "#A52828",
    fontSize: 15,
    lineHeight: 19,
  },

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
    fontSize: 16,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#748197",
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 12,
    fontWeight: "700",
  },

  quickDescription: {
    color: "#68778E",
    fontSize: 10,
    marginTop: 3,
  },

  viewText: {
    color: "#123F70",
    fontSize: 10,
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
    fontSize: 12,
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
    fontSize: 10,
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
    fontSize: 12,
    fontWeight: "700",
  },

  nonEquipment: {
    color: "#66768F",
    fontSize: 10,
    marginTop: 3,
  },

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  detailsText: {
    color: "#174777",
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 12,
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
    fontSize: 13,
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
    fontSize: 12,
    fontWeight: "700",
  },

  questionTypeDescription: {
    color: "#748197",
    fontSize: 10,
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
    fontSize: 12,
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
    fontSize: 12,
    fontWeight: "700",
  },

  questionContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 7,
  },

  questionText: {
    color: "#27303D",
    fontSize: 12,
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
    fontSize: 10,
  },

  requiredText: {
    color: "#D04A4A",
    fontSize: 10,
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
    fontSize: 12,
    fontWeight: "700",
  },

  signatureCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D8E1EC",
    borderRadius: 8,
    padding: 14,
    marginBottom: 15,
  },

  signatureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  signatureIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EAF2FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  signatureHeaderContent: { flex: 1 },
  signatureTitle: { color: "#173C68", fontSize: 14, fontWeight: "700" },
  signatureSubtitle: { color: "#718198", fontSize: 10, marginTop: 3 },

  signatureButton: {
    minHeight: 45,
    backgroundColor: "#062B57",
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  signatureButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  signatureConfirmed: {
    borderWidth: 1,
    borderColor: "#CBE8D9",
    borderRadius: 7,
    overflow: "hidden",
    backgroundColor: "#F8FCFA",
  },

  signatureImage: { width: "100%", height: 110, backgroundColor: "#FFFFFF" },

  signatureConfirmedFooter: {
    minHeight: 40,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  signatureStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  signatureStatusText: { color: "#16845F", fontSize: 10, fontWeight: "700" },
  signatureClearText: { color: "#C52C2C", fontSize: 10, fontWeight: "700" },

  signaturePadRoot: {
    flex: 1,
    minHeight: 300,
  },

  signatureDrawingArea: {
    flex: 1,
    minHeight: 230,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D3DAE4",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },

  signatureHintOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  signatureHint: {
    color: "#94A3B8",
    fontSize: 15,
  },

  signaturePadActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },

  signatureClearButton: {
    minWidth: 105,
    height: 42,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#D3DAE4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#FFFFFF",
  },

  signatureClearButtonText: {
    color: "#52627A",
    fontSize: 15,
    fontWeight: "600",
  },

  signatureConfirmButton: {
    minWidth: 120,
    height: 42,
    borderRadius: 7,
    backgroundColor: "#062B57",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  signatureConfirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  signatureModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 18,
  },

  signatureModal: {
    height: "78%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
  },

  signatureModalHeader: {
    minHeight: 65,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5EAF0",
  },

  signatureModalTitle: { color: "#173C68", fontSize: 15, fontWeight: "700" },
  signatureModalSubtitle: { color: "#718198", fontSize: 10, marginTop: 3 },

  signatureCanvasContainer: { flex: 1, backgroundColor: "#FFFFFF" },

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
    fontSize: 12,
    fontWeight: "600",
  },

  /* EXECUÇÃO DE INSPEÇÃO */

  executeInspectionButton: {
    backgroundColor: "#EAF2FC",
    borderWidth: 1,
    borderColor: "#C9DDF3",
    borderRadius: 8,
    minHeight: 72,
    paddingHorizontal: 13,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  executeInspectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  executeInspectionContent: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  executeInspectionTitle: {
    color: "#163E69",
    fontSize: 14,
    fontWeight: "700",
  },

  executeInspectionDescription: {
    color: "#61738B",
    fontSize: 10,
    lineHeight: 13,
    marginTop: 3,
  },

  executionHeader: {
    marginBottom: 15,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 10,
  },

  backButtonText: {
    color: "#0B4B87",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },

  executionTitle: {
    minHeight: 61,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },

  executionTitleContent: {
    marginLeft: 10,
  },

  executionEquipment: {
    minHeight: 78,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F4",
  },

  executionEquipmentIcon: {
    width: 43,
    height: 43,
    borderRadius: 9,
    backgroundColor: "#EAF2FC",
    alignItems: "center",
    justifyContent: "center",
  },

  executionEquipmentContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  executionEquipmentName: {
    color: "#27303D",
    fontSize: 13,
    fontWeight: "700",
  },

  executionEquipmentCode: {
    color: "#718097",
    fontSize: 10,
    marginTop: 3,
    marginBottom: 5,
  },

  selectedEquipment: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedEquipmentIcon: {
    width: 58,
    height: 58,
    borderRadius: 11,
    backgroundColor: "#EAF2FC",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedEquipmentContent: {
    flex: 1,
    marginLeft: 12,
  },

  selectedEquipmentLabel: {
    color: "#8A96A8",
    fontSize: 10,
    fontWeight: "700",
  },

  selectedEquipmentName: {
    color: "#202A37",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },

  selectedEquipmentDetails: {
    color: "#718097",
    fontSize: 10,
    marginTop: 3,
  },

  templatePreview: {
    margin: 13,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DCE4ED",
    borderRadius: 7,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  templatePreviewContent: {
    flex: 1,
    marginLeft: 10,
  },

  templatePreviewTitle: {
    color: "#293444",
    fontSize: 12,
    fontWeight: "700",
  },

  templatePreviewText: {
    color: "#748197",
    fontSize: 10,
    marginTop: 4,
  },

  inspectionProgressCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE4ED",
    borderRadius: 8,
    padding: 13,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inspectionProgressTitle: {
    color: "#202A37",
    fontSize: 14,
    fontWeight: "700",
  },

  inspectionProgressText: {
    color: "#718097",
    fontSize: 10,
    marginTop: 3,
  },

  inspectionProgressBadge: {
    backgroundColor: "#E6F7EF",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  inspectionProgressBadgeText: {
    color: "#00875B",
    fontSize: 10,
    fontWeight: "700",
  },

  executionQuestionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEE4EB",
    borderRadius: 8,
    marginBottom: 12,
    padding: 13,
  },

  executionQuestionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  executionQuestionContent: {
    flex: 1,
    marginLeft: 10,
  },

  executionQuestionText: {
    color: "#27303D",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
  },

  executionRequired: {
    color: "#D04A4A",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
  },

  answerRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 13,
  },

  answerButton: {
    flex: 1,
    height: 43,
    borderWidth: 1,
    borderColor: "#D8E1EB",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  answerButtonSelected: {
    backgroundColor: "#16845F",
    borderColor: "#16845F",
  },

  answerButtonNoSelected: {
    backgroundColor: "#C93434",
    borderColor: "#C93434",
  },

  answerButtonText: {
    color: "#43536A",
    fontSize: 12,
    fontWeight: "700",
  },

  answerButtonTextSelected: {
    color: "#FFFFFF",
  },

  choiceColumn: {
    marginTop: 12,
    gap: 7,
  },

  choiceButton: {
    minHeight: 39,
    borderWidth: 1,
    borderColor: "#D8E1EB",
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  choiceButtonSelected: {
    backgroundColor: "#EAF2FC",
    borderColor: "#AFCDEB",
  },

  choiceCircle: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A4B0BF",
  },

  choiceCircleSelected: {
    borderWidth: 4,
    borderColor: "#0B4B87",
  },

  choiceText: {
    color: "#4A596F",
    fontSize: 10,
    marginLeft: 8,
  },

  choiceTextSelected: {
    color: "#0B4B87",
    fontWeight: "700",
  },

  executionInput: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#D7DEE8",
    borderRadius: 6,
    paddingHorizontal: 11,
    paddingVertical: 10,
    color: "#273345",
    fontSize: 12,
    textAlignVertical: "top",
    marginTop: 12,
  },

  photoButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#C9DDF3",
    borderRadius: 6,
    backgroundColor: "#F5F9FD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 12,
  },

  photoButtonText: {
    color: "#0B4B87",
    fontSize: 10,
    fontWeight: "700",
  },

  photoPreview: {
    minHeight: 40,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#F0F8F4",
    borderWidth: 1,
    borderColor: "#CBE8D9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  photoThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 6,
    marginRight: 9,
  },

  photoPreviewText: {
    flex: 1,
    color: "#23724F",
    fontSize: 10,
    fontWeight: "600",
    marginRight: 8,
  },

  nonConformityCard: {
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#FFD5D5",
    borderRadius: 8,
    marginBottom: 12,
    padding: 13,
  },

  nonConformityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  nonConformityHeaderContent: {
    flex: 1,
    marginLeft: 9,
  },

  nonConformityTitle: {
    color: "#B72B2B",
    fontSize: 13,
    fontWeight: "700",
  },

  nonConformitySubtitle: {
    color: "#7C6870",
    fontSize: 10,
    lineHeight: 13,
    marginTop: 3,
  },

  observationInput: {
    minHeight: 90,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7CACA",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: "#273345",
    fontSize: 12,
    textAlignVertical: "top",
    marginTop: 12,
  },

  primaryButtonExecution: {
    flex: 1,
    minHeight: 44,
    backgroundColor: "#062B57",
    borderRadius: 6,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
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
    fontSize: 12,
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
    fontSize: 10,
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
    fontSize: 10,
  },

  resultsText: {
    color: "#697991",
    fontSize: 10,
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
    fontSize: 13,
    fontWeight: "700",
  },

  equipmentCode: {
    color: "#6A7890",
    fontSize: 10,
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
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 3,
  },

  infoValue: {
    color: "#45546C",
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 18,
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
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },

  modalEquipmentCode: {
    color: "#728097",
    fontSize: 12,
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
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  detailValue: {
    color: "#354357",
    fontSize: 13,
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
    fontSize: 21,
    fontWeight: "700",
    marginTop: 12,
  },

  profileRole: {
    color: "#738198",
    fontSize: 12,
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
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: "700",
  },

  /* BARRA INFERIOR */

  savedInspectionActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    marginLeft: 8,
  },
  reviewBadge: {
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    maxWidth: 125,
  },
  reviewBadgePending: {
    backgroundColor: "#FFF3D6",
  },
  reviewBadgeApproved: {
    backgroundColor: "#DDF5EA",
  },
  reviewBadgeRejected: {
    backgroundColor: "#FDE3E5",
  },
  reviewBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#40516A",
    textAlign: "center",
  },
  reviewButton: {
    minHeight: 36,
    borderRadius: 9,
    backgroundColor: "#0B4B87",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  reviewEmptyBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E1E6ED",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
  },
  reviewEmptyText: {
    flex: 1,
    color: "#6B7B91",
    fontSize: 14,
    lineHeight: 18,
  },
  reviewAnswerCard: {
    borderWidth: 1,
    borderColor: "#E1E6ED",
    borderRadius: 10,
    padding: 11,
    marginBottom: 8,
    backgroundColor: "#FBFCFE",
  },
  reviewAnswerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  reviewAnswerNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EAF2FC",
    color: "#0B4B87",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "800",
    fontSize: 13,
  },
  reviewAnswerQuestion: {
    flex: 1,
    color: "#24415F",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  reviewAnswerValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
  },
  reviewAnswerValue: {
    flex: 1,
    color: "#465A73",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewEvidenceLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  reviewEvidenceLabelText: {
    color: "#0B4B87",
    fontSize: 13,
    fontWeight: "700",
  },
  reviewSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#CFEBDD",
    backgroundColor: "#F1FAF5",
    borderRadius: 10,
    padding: 12,
  },
  reviewSuccessText: {
    flex: 1,
    color: "#166A4F",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  reviewNonComplianceBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderWidth: 1,
    borderColor: "#F0C9CD",
    backgroundColor: "#FFF6F6",
    borderRadius: 10,
    padding: 12,
  },
  reviewNonComplianceText: {
    color: "#8C2D35",
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 2,
  },
  reviewPhotosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reviewPhotoCard: {
    width: "47%",
    borderWidth: 1,
    borderColor: "#E1E6ED",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  reviewPhoto: {
    width: "100%",
    height: 120,
    backgroundColor: "#EEF2F6",
  },
  reviewPhotoCaption: {
    color: "#42556D",
    fontSize: 12,
    lineHeight: 14,
    padding: 8,
    minHeight: 30,
  },
  reviewSignatureCard: {
    borderWidth: 1,
    borderColor: "#E1E6ED",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  reviewSignatureImage: {
    width: "100%",
    height: 130,
    backgroundColor: "#FBFCFE",
    borderRadius: 8,
  },
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 24, 42, 0.55)",
    justifyContent: "center",
    padding: 18,
  },
  reviewModal: {
    maxHeight: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
  },
  reviewModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E7ECF2",
  },
  reviewModalTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#18324D",
  },
  reviewModalSubtitle: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 19,
    color: "#6B7A90",
  },
  reviewModalScroll: {
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  finalFlowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE6F0",
    padding: 15,
    marginBottom: 16,
  },
  finalFlowHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  finalFlowIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF2FC",
    marginRight: 10,
  },
  finalFlowTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#18324D",
  },
  finalFlowSubtitle: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 17,
    color: "#6B7A90",
  },
  finalFlowStats: {
    flexDirection: "row",
    marginTop: 14,
    gap: 8,
  },
  finalFlowStat: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: "center",
  },
  finalFlowStatValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#173C68",
  },
  finalFlowStatLabel: {
    marginTop: 2,
    fontSize: 12,
    color: "#718198",
  },
  finalFlowMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E8EDF3",
    gap: 7,
  },
  finalFlowMessageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 17,
    color: "#52627A",
  },

  reviewInfoCard: {
    backgroundColor: "#F3F7FB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  reviewInfoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#18324D",
    marginBottom: 6,
  },
  reviewInfoText: {
    fontSize: 15,
    color: "#52627A",
    marginTop: 3,
  },
  reviewSection: {
    marginBottom: 14,
  },
  reviewSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#18324D",
    marginBottom: 8,
  },
  reviewResultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E3EAF2",
    borderRadius: 12,
    padding: 12,
  },
  reviewResultIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E7F0F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  reviewResultTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#18324D",
  },
  reviewResultText: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 17,
    color: "#6B7A90",
  },
  reviewObservationBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E3EAF2",
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
  },
  reviewObservationText: {
    fontSize: 15,
    lineHeight: 19,
    color: "#52627A",
  },
  reviewInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#18324D",
    backgroundColor: "#FFFFFF",
  },
  previousReviewBox: {
    backgroundColor: "#F3F7FB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  previousReviewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#18324D",
    marginBottom: 5,
  },
  previousReviewText: {
    fontSize: 14,
    color: "#52627A",
    marginTop: 2,
  },
  reviewModalButtons: {
    flexDirection: "row",
    gap: 10,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: "#E7ECF2",
  },
  rejectReviewButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#C92D3A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  approveReviewButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: "#16845F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  reviewActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  savedInspectionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E1E6ED",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#FAFCFE",
  },

  savedInspectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E8F6F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  savedInspectionContent: {
    flex: 1,
    paddingRight: 8,
  },

  savedInspectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#173C68",
    marginBottom: 4,
  },

  savedInspectionEquipment: {
    fontSize: 15,
    fontWeight: "600",
    color: "#42556D",
    marginBottom: 4,
  },

  savedInspectionMeta: {
    fontSize: 13,
    color: "#7A889A",
    marginTop: 2,
  },

  savedInspectionStatus: {
    backgroundColor: "#E8F6F0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  savedInspectionStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16845F",
  },

  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(6, 43, 87, 0.45)",
    justifyContent: "flex-end",
  },

  profileModalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "78%",
    paddingBottom: 24,
  },

  profileModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF1",
  },

  profileModalTitleArea: {
    flex: 1,
  },

  profileModalTitle: {
    color: "#173C68",
    fontSize: 21,
    fontWeight: "800",
  },

  profileModalSubtitle: {
    color: "#7A889A",
    fontSize: 13,
    marginTop: 3,
  },

  profileModalClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F2F5F8",
    alignItems: "center",
    justifyContent: "center",
  },

  profileModalScroll: {
    paddingHorizontal: 20,
  },

  profileModalScrollContent: {
    paddingTop: 18,
    paddingBottom: 10,
  },

  profileModalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

  profileModalInfoContent: {
    flex: 1,
    marginLeft: 12,
  },

  profileModalLabel: {
    color: "#173C68",
    fontSize: 15,
    fontWeight: "700",
  },

  profileModalValue: {
    color: "#5D6C80",
    fontSize: 15,
    marginTop: 3,
  },

  profileModalHelp: {
    color: "#6F7D90",
    fontSize: 14,
    lineHeight: 18,
    marginTop: 5,
  },

  profileSettingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  profileToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D8DEE7",
    padding: 3,
    justifyContent: "center",
  },

  profileToggleActive: {
    backgroundColor: "#0B4B87",
  },

  profileToggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },

  profileToggleThumbActive: {
    alignSelf: "flex-end",
  },

  profileSecurityBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF8F4",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  profileHelpBox: {
    backgroundColor: "#F2F6FB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  notificationSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F4F7FB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  notificationMarkRead: {
    color: "#0B4B87",
    fontSize: 13,
    fontWeight: "700",
  },

  notificationDisabledBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF8E8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  notificationEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },

  notificationEmptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#42556D",
    marginTop: 8,
    marginBottom: 3,
  },

  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6ED",
    borderRadius: 12,
    padding: 11,
    marginBottom: 8,
  },

  notificationItemUnread: {
    backgroundColor: "#F4F8FD",
    borderColor: "#C9DBEE",
  },

  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF2FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  notificationContent: {
    flex: 1,
    paddingRight: 5,
  },

  notificationTitle: {
    color: "#173C68",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  notificationMessage: {
    color: "#52627A",
    fontSize: 13,
    lineHeight: 16,
  },

  notificationDate: {
    color: "#8A96A7",
    fontSize: 10,
    marginTop: 4,
  },

  notificationUnreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#0B4B87",
    marginTop: 5,
  },

  profileModalVersion: {
    textAlign: "center",
    color: "#8A96A7",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },

  profileModalButton: {
    marginTop: 20,
    backgroundColor: "#0B4B87",
    borderRadius: 12,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  profileModalButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

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
    fontSize: 10,
    marginTop: 2,
  },

  navTextActive: {
    color: "#0B4B87",
    fontWeight: "700",
  },
});
