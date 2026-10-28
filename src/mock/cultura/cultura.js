import mockCultura from "./MockCultura.json";
import {
  filtrarAtividades,
  getAtividadeById,
  MAPA_CATEGORIA_BUSCA,
  temFiltroHorario,
} from "../atividades/atividades";

const CATEGORIAS_CULTURAIS = ["História", "Tradição", "Música", "Artesanato"];

function getAtividadesVinculadas(item) {
  return (item.atividadeIds ?? [])
    .map((atividadeId) => getAtividadeById(atividadeId))
    .filter(Boolean);
}

function correspondePalavrasChave(item, palavrasChave) {
  const termo = palavrasChave?.trim().toLowerCase();
  if (!termo) return true;

  const campos = [item.title, item.category, item.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return campos.includes(termo);
}

function correspondeCategoria(item, categoriaBusca) {
  if (!categoriaBusca) return true;

  const mapeamento = MAPA_CATEGORIA_BUSCA[categoriaBusca];
  const atividades = getAtividadesVinculadas(item);

  if (mapeamento === "__sem_atividades__") return false;

  if (mapeamento === "__tag_natureza__") {
    const texto = [item.title, item.description, item.category]
      .join(" ")
      .toLowerCase();

    if (texto.includes("natureza")) return true;

    return atividades.some((atividade) =>
      (atividade.tags ?? []).some((tag) =>
        tag.toLowerCase().includes("natureza")
      )
    );
  }

  if (mapeamento === "Gastronomia" && item.category === "Gastronomia") {
    return true;
  }

  if (mapeamento === "Cultura") {
    if (CATEGORIAS_CULTURAIS.includes(item.category)) return true;

    return atividades.some((atividade) => atividade.categoria === "Cultura");
  }

  if (item.category === mapeamento) return true;

  return atividades.some((atividade) => atividade.categoria === mapeamento);
}

function correspondeHorario(item, horario) {
  if (!temFiltroHorario(horario)) return true;

  const atividadesFiltradas = filtrarAtividades({ horario });
  const idsFiltrados = new Set(atividadesFiltradas.map((atividade) => atividade.id));

  return (item.atividadeIds ?? []).some((atividadeId) =>
    idsFiltrados.has(atividadeId)
  );
}

export function getAllCultura() {
  return mockCultura.cultura;
}

export function filtrarCultura(filtros = {}) {
  const { categoria, horario, palavrasChave } = filtros;

  return mockCultura.cultura.filter(
    (item) =>
      correspondeCategoria(item, categoria) &&
      correspondeHorario(item, horario) &&
      correspondePalavrasChave(item, palavrasChave)
  );
}

export function getCulturaById(id) {
  if (id == null) return undefined;

  return mockCultura.cultura.find(
    (item) => String(item.id) === String(id)
  );
}

export function getAtividadesByCulturaId(culturaId) {
  const cultura = getCulturaById(culturaId);
  if (!cultura?.atividadeIds?.length) return [];

  return cultura.atividadeIds
    .map((atividadeId) => getAtividadeById(atividadeId))
    .filter(Boolean);
}

export function getLugaresByCulturaId(culturaId) {
  return getAtividadesByCulturaId(culturaId);
}

export function formatLocalizacao(endereco) {
  if (!endereco) return "";

  const { bairro, cidade, estado } = endereco;
  const partePrincipal = [bairro, cidade].filter(Boolean).join(", ");

  return estado ? `${partePrincipal} - ${estado}` : partePrincipal;
}