import mockAtividades from "./MockAtividades.json";

export const MAPA_CATEGORIA_BUSCA = {
  alimentacao: "Gastronomia",
  turismo: "Turismo",
  cultura: "Cultura",
  lazer: "Lazer",
  natureza: "__tag_natureza__",
  hospedagem: "__sem_atividades__",
};

const TITULOS_CATEGORIA_BUSCA = {
  alimentacao: "Gastronomia",
  turismo: "Turismo",
  cultura: "Cultura",
  lazer: "Lazer",
  natureza: "Natureza",
  hospedagem: "Hospedagem",
};

export function getTituloCategoriaBusca(categoriaBusca) {
  return TITULOS_CATEGORIA_BUSCA[categoriaBusca] ?? categoriaBusca;
}

const PERIODOS = {
  manha: { inicio: 6 * 60, fim: 12 * 60 },
  tarde: { inicio: 12 * 60, fim: 18 * 60 },
  noite: { inicio: 18 * 60, fim: 24 * 60 },
};

const TITULOS_HORARIO_BUSCA = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  aberto_agora: "Aberto agora",
  fim_semana: "Fim de semana",
  "24_horas": "24 horas",
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

function getIntervalosAbertura(horarios) {
  if (!horarios) return [[0, MINUTOS_DIA]];
  if (horarios["24h"]) return [[0, MINUTOS_DIA]];

  const abre = horaParaMinutos(horarios.abre);
  const fecha = horaParaMinutos(horarios.fecha);

  if (abre == null && fecha == null) return [[0, MINUTOS_DIA]];
  if (abre == null) return [[0, fecha ?? MINUTOS_DIA]];
  if (fecha == null) return [[abre, MINUTOS_DIA]];

  // fecha "00:00" com abertura noturna = fecha à meia-noite (ex.: 17:00–00:00)
  if (fecha === 0 && abre > 0) return [[abre, MINUTOS_DIA]];

  if (fecha > abre) return [[abre, fecha]];

  // Horário que cruza a meia-noite (ex.: 11:30–02:00)
  return [
    [abre, MINUTOS_DIA],
    [0, fecha],
  ];
}

function atividadeDisponivelNoPeriodo(horarios, periodoId) {
  const periodo = PERIODOS[periodoId];
  if (!periodo) return true;

  return getIntervalosAbertura(horarios).some(([inicio, fim]) =>
    intervalosSeIntersectam(inicio, fim, periodo.inicio, periodo.fim)
  );
}

function atividadeDisponivelNoIntervalo(horarios, inicioFiltro, fimFiltro) {
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

  return getIntervalosAbertura(horarios).some(([abreInicio, abreFim]) =>
    intervalosFiltro.some(([filtroInicio, filtroFim]) =>
      intervalosSeIntersectam(
        abreInicio,
        abreFim,
        filtroInicio,
        filtroFim
      )
    )
  );
}

function atividadeAbertaAgora(horarios) {
  const agora = new Date();
  const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();

  return getIntervalosAbertura(horarios).some(
    ([inicio, fim]) => minutosAtuais >= inicio && minutosAtuais < fim
  );
}

export function temFiltroHorario(horario) {
  if (!horario) return false;

  return Boolean(horario.start || horario.end || horario.period);
}

export function getTituloHorarioBusca(horario = {}) {
  const { start, end, period } = horario;

  if (start && end) return `Das ${start} às ${end}`;
  if (start) return `A partir das ${start}`;
  if (end) return `Até às ${end}`;
  if (period) return TITULOS_HORARIO_BUSCA[period] ?? "Horário";

  return "Horário";
}

function correspondePalavrasChave(atividade, palavrasChave) {
  const termo = palavrasChave?.trim().toLowerCase();
  if (!termo) return true;

  const campos = [
    atividade.titulo,
    atividade.descricao,
    atividade.categoria,
    ...(atividade.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return campos.includes(termo);
}

function correspondeCategoria(atividade, categoriaBusca) {
  if (!categoriaBusca) return true;

  const mapeamento = MAPA_CATEGORIA_BUSCA[categoriaBusca];

  if (mapeamento === "__sem_atividades__") return false;
  if (mapeamento === "__tag_natureza__") {
    return (atividade.tags ?? []).some((tag) =>
      tag.toLowerCase().includes("natureza")
    );
  }

  return atividade.categoria === mapeamento;
}

function correspondeHorario(atividade, horario) {
  if (!temFiltroHorario(horario)) return true;

  const { start, end, period } = horario;
  const horarios = atividade.horarios;

  if (period === "24_horas" && !horarios?.["24h"]) return false;

  if (period === "aberto_agora" && !atividadeAbertaAgora(horarios)) {
    return false;
  }

  // O mock não possui dias da semana; considera todas as atividades disponíveis.
  if (period === "fim_semana") return true;

  if (period && ["manha", "tarde", "noite"].includes(period)) {
    if (!atividadeDisponivelNoPeriodo(horarios, period)) return false;
  }

  if (start || end) {
    if (!atividadeDisponivelNoIntervalo(horarios, start, end)) return false;
  }

  return true;
}

export function getAllAtividades() {
  return mockAtividades.activities;
}

export function getAtividadesPopulares() {
  return mockAtividades.activities;
}

export function getAtividadesDestaques() {
  return mockAtividades.activities.filter((atividade) => atividade.destaque);
}

export function getCategoriasAtividades() {
  const categorias = new Set(
    mockAtividades.activities.map((atividade) => atividade.categoria)
  );

  return Array.from(categorias);
}

export function groupAtividadesPorCategoria(atividades) {
  return atividades.reduce((grupos, atividade) => {
    const categoria = atividade.categoria;
    if (!grupos[categoria]) grupos[categoria] = [];
    grupos[categoria].push(atividade);
    return grupos;
  }, {});
}

export function filtrarAtividades(filtros = {}) {
  const { categoria, horario, palavrasChave } = filtros;

  return mockAtividades.activities.filter(
    (atividade) =>
      correspondeCategoria(atividade, categoria) &&
      correspondeHorario(atividade, horario) &&
      correspondePalavrasChave(atividade, palavrasChave)
  );
}

export function getAtividadeById(id) {
  if (id == null) return undefined;

  return mockAtividades.activities.find( 
    (atividade) => String(atividade.id) === String(id)
  );
}

export function getImagemAtividade(atividade) {
  if (!atividade) return null;

  if (atividade.imagem) return atividade.imagem;
  if (atividade.thumbnail) return atividade.thumbnail;
  if (atividade.imagens?.length) return atividade.imagens[0];

  const mock = getAtividadeById(atividade.atividadeId);
  if (!mock) return null;

  return mock.thumbnail ?? mock.imagens?.[0] ?? null;
}

export function formatLocalizacao(endereco) {
  if (!endereco) return "";

  const { bairro, cidade, estado } = endereco;
  const partePrincipal = [bairro, cidade].filter(Boolean).join(", ");

  return estado ? `${partePrincipal} - ${estado}` : partePrincipal;
}

export function formatEnderecoCompleto(endereco) {
  if (!endereco) return "";

  const { rua, bairro, cidade } = endereco;
  const local = [bairro, cidade].filter(Boolean).join(", ");

  if (rua && local) return `${rua} - ${local}`;
  return rua || local;
}

export function formatHorarios(horarios) {
  if (!horarios) return "";

  if (horarios["24h"]) return "Aberto 24h";

  const { abre, fecha } = horarios;
  if (abre && fecha) return `Abre ${abre} - Fecha ${fecha}`;
  if (abre) return `Abre ${abre}`;
  if (fecha) return `Fecha ${fecha}`;

  return "";
}

export function formatNota(nota) {
  if (nota == null) return "—";

  return Number(nota).toFixed(1).replace(".", ",");
}
