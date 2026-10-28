import mockPlanos from "./MockPlanos.json";
import { MAPA_CATEGORIA_BUSCA, getAtividadeById } from "../atividades/atividades";

const PERIODOS = {
  manha: { inicio: 6 * 60, fim: 12 * 60 },
  tarde: { inicio: 12 * 60, fim: 18 * 60 },
  noite: { inicio: 18 * 60, fim: 24 * 60 },
};

const HORARIO_DO_DIA_POR_PERIODO = {
  manha: ["Manhã"],
  tarde: ["Tarde"],
  noite: ["Noite"],
};

const MINUTOS_DIA = 24 * 60;

function horaParaMinutos(hora) {
  if (!hora) return null;

  const partes = hora.trim().split(":");
  if (partes.length !== 2) return null;

  const h = Number(partes[0]);
  const m = Number(partes[1]);

  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;

  return h * 60 + m;
}

function intervalosSeIntersectam(inicioA, fimA, inicioB, fimB) {
  return inicioA < fimB && fimA > inicioB;
}

function getIntervalosSlot(slotInicio, slotFim) {
  const abre = horaParaMinutos(slotInicio);
  const fecha = horaParaMinutos(slotFim);

  if (abre == null && fecha == null) return [[0, MINUTOS_DIA]];
  if (abre == null) return [[0, fecha ?? MINUTOS_DIA]];
  if (fecha == null) return [[abre, MINUTOS_DIA]];

  if (fecha === 0 && abre > 0) return [[abre, MINUTOS_DIA]];
  if (fecha > abre) return [[abre, fecha]];

  return [
    [abre, MINUTOS_DIA],
    [0, fecha],
  ];
}

function slotDisponivelNoPeriodo(slotInicio, slotFim, periodoId) {
  const periodo = PERIODOS[periodoId];
  if (!periodo) return true;

  return getIntervalosSlot(slotInicio, slotFim).some(([inicio, fim]) =>
    intervalosSeIntersectam(inicio, fim, periodo.inicio, periodo.fim)
  );
}

function slotDisponivelNoIntervalo(slotInicio, slotFim, inicioFiltro, fimFiltro) {
  if (!inicioFiltro && !fimFiltro) return true;

  const inicio = inicioFiltro ? horaParaMinutos(inicioFiltro) : 0;
  const fim = fimFiltro ? horaParaMinutos(fimFiltro) : MINUTOS_DIA;

  if (inicio == null || fim == null) return false;

  const intervalosFiltro =
    fim > inicio
      ? [[inicio, fim]]
      : [
          [inicio, MINUTOS_DIA],
          [0, fim],
        ];

  return getIntervalosSlot(slotInicio, slotFim).some(([abreInicio, abreFim]) =>
    intervalosFiltro.some(([filtroInicio, filtroFim]) =>
      intervalosSeIntersectam(abreInicio, abreFim, filtroInicio, filtroFim)
    )
  );
}

function slotAbertoAgora(slotInicio, slotFim) {
  const agora = new Date();
  const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();

  return getIntervalosSlot(slotInicio, slotFim).some(
    ([inicio, fim]) => minutosAtuais >= inicio && minutosAtuais < fim
  );
}

function correspondePalavrasChave(plano, palavrasChave) {
  const termo = palavrasChave?.trim().toLowerCase();
  if (!termo) return true;

  const campos = [
    plano.titulo,
    plano.descricao,
    plano.horarioDoDia,
    plano.pessoas,
    plano.duracao,
    ...(plano.categorias ?? []),
    ...(plano.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return campos.includes(termo);
}

function correspondeCategoria(plano, categoriaBusca) {
  if (!categoriaBusca) return true;

  const mapeamento = MAPA_CATEGORIA_BUSCA[categoriaBusca];

  if (mapeamento === "__sem_atividades__") return false;
  if (mapeamento === "__tag_natureza__") {
    return (plano.tags ?? []).some((tag) =>
      tag.toLowerCase().includes("natureza")
    );
  }

  return (plano.categorias ?? []).some(
    (categoria) => categoria.toLowerCase() === mapeamento.toLowerCase()
  );
}

function timelineCorrespondePeriodo(plano, periodoId) {
  return (plano.atividadesTimeline ?? []).some((entrada) =>
    slotDisponivelNoPeriodo(entrada.slotInicio, entrada.slotFim, periodoId)
  );
}

function correspondeHorario(plano, horario) {
  if (!horario) return true;

  const { start, end, period } = horario;
  const temFiltro = Boolean(start || end || period);
  if (!temFiltro) return true;

  if (period === "24_horas") return false;
  if (period === "fim_semana") return true;

  if (period === "aberto_agora") {
    return (plano.atividadesTimeline ?? []).some((entrada) =>
      slotAbertoAgora(entrada.slotInicio, entrada.slotFim)
    );
  }

  if (period && ["manha", "tarde", "noite"].includes(period)) {
    const horariosDoDia = HORARIO_DO_DIA_POR_PERIODO[period] ?? [];

    if (plano.horarioDoDia === "Dia Inteiro") return true;
    if (horariosDoDia.includes(plano.horarioDoDia)) return true;
    if (timelineCorrespondePeriodo(plano, period)) return true;

    return false;
  }

  if (start || end) {
    return (plano.atividadesTimeline ?? []).some((entrada) =>
      slotDisponivelNoIntervalo(
        entrada.slotInicio,
        entrada.slotFim,
        start,
        end
      )
    );
  }

  return true;
}

export function getAllPlanos() {
  return mockPlanos.planos;
}

export function getCategoriasPlanos() {
  const categorias = new Set();

  mockPlanos.planos.forEach((plano) => {
    (plano.categorias ?? []).forEach((categoria) => categorias.add(categoria));
  });

  return Array.from(categorias);
}

export function filtrarPlanos(filtros = {}) {
  const { categoria, horario, palavrasChave } = filtros;

  return mockPlanos.planos.filter(
    (plano) =>
      correspondeCategoria(plano, categoria) &&
      correspondeHorario(plano, horario) &&
      correspondePalavrasChave(plano, palavrasChave)
  );
}

export function getPlanosPopularesIds() {
  return mockPlanos.planos.map((plano) => plano.id);
}

export function getPlanoById(id) {
  if (id == null) return undefined;

  return mockPlanos.planos.find(  // ✅ era "plans"
    (plano) => String(plano.id) === String(id)
  );
}

export function formatPlanoResumo(plano) {
  if (!plano) return "";

  const { pessoas, horarioDoDia, duracao } = plano;
  return [pessoas, horarioDoDia, duracao].filter(Boolean).join(" · ");
}

export function getPlanosByAtividadeId(atividadeId) {
  if (atividadeId == null) return [];

  return mockPlanos.planos.filter((plano) =>
    plano.atividadesTimeline?.some(
      (entrada) => String(entrada.atividadeId) === String(atividadeId)
    )
  );
}

export function formatPlanoHorarioAtividade(plano, atividadeId) {
  if (!plano) return "";

  const entrada = plano.atividadesTimeline?.find(
    (item) => String(item.atividadeId) === String(atividadeId)
  );

  if (entrada?.slotInicio && entrada?.slotFim) {
    return `Plano ${plano.pessoas?.toLowerCase() ?? ""} - ${entrada.slotInicio} às ${entrada.slotFim}`.trim();
  }

  return formatPlanoResumo(plano);
}

const MAPA_TURNO = {
  Manhã: "Manhã",
  Tarde: "Tarde",
  Noite: "Noite",
  "Dia Inteiro": "Dia todo",
};

const MAPA_PESSOAS = {
  Individual: "Individualmente",
  Casal: "Dupla",
  Família: "Em grupo",
  Amigos: "Em grupo",
};

function horaParaSlot(hora) {
  const minutos = horaParaMinutos(hora);
  if (minutos == null) return 0;
  return Math.floor(minutos / 30);
}

function duracaoEmSlots(slotInicio, slotFim) {
  const inicio = horaParaSlot(slotInicio);
  const fim = horaParaSlot(slotFim);
  return Math.max(1, fim - inicio);
}

export function planoMockParaContexto(planoId) {
  const mock = getPlanoById(planoId);
  if (!mock) return null;

  const plano = {
    titulo: mock.titulo ?? "",
    descricao: mock.descricao ?? "",
    criador: mock.criador ?? "",
    turno: MAPA_TURNO[mock.horarioDoDia] ?? mock.horarioDoDia ?? "",
    tamanhoGrupo: MAPA_PESSOAS[mock.pessoas] ?? mock.pessoas ?? "",
    local: "",
    preco: mock.preco ?? "",
    tags: [...(mock.tags ?? [])],
    fotoCapa: null,
    fotoCapaUrl: mock.thumbnail ?? "",
    fotoLocal: null,
    fotoLocalUrl: "",
    comentario: "",
    avaliacao: 5,
    publicado: true,
    dataCriacao: mock.dataCriacao ? new Date(mock.dataCriacao) : new Date(),
  };

  const atividades = (mock.atividadesTimeline ?? []).map((entrada, index) => {
    const atividadeMock = getAtividadeById(entrada.atividadeId) ?? {};

    return {
      ...atividadeMock,
      atividadeId: entrada.atividadeId,
      id: `plano-${planoId}-act-${entrada.atividadeId}-${index}`,
      titulo: entrada.tituloResumido || atividadeMock.titulo || "Atividade",
      slot: horaParaSlot(entrada.slotInicio),
      duration: duracaoEmSlots(entrada.slotInicio, entrada.slotFim),
      comentario: entrada.comentarioAutor ?? "",
      avaliacao: entrada.avaliacaoAutor ?? 5,
    };
  });

  return { plano, atividades };
}