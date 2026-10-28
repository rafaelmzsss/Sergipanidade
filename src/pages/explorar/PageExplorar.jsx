import CarrosselDeAtividades from "../../components/CarrosselCard/CarrosselDeAtividades/CarrosselDeAtividades";
import CarrosselDePlanos from "../../components/CarrosselCard/CarrosselDePlanos/CarrosselDePlanos";
import {
  filtrarAtividades,
  getAllAtividades,
  getAtividadesPopulares,
  getTituloCategoriaBusca,
  getTituloHorarioBusca,
  groupAtividadesPorCategoria,
  temFiltroHorario,
} from "../../mock/atividades/atividades";
import { getPlanosPopularesIds } from "../../mock/planos/planos";
import "./PageExplorar.css";

const CATEGORIA_TURISMO = "Turismo";

function SecaoPlanosPopulares() {
  return (
    <CarrosselDePlanos
      titulo="Populares"
      planoIds={getPlanosPopularesIds()}
    />
  );
}

function PageExplorar({ filtrosBusca = null }) {
  const categoriaSelecionada = filtrosBusca?.categoria;
  const filtroHorarioAtivo = temFiltroHorario(filtrosBusca?.horario);

  if (categoriaSelecionada || filtroHorarioAtivo) {
    const atividades = filtrarAtividades(filtrosBusca);
    const titulo = categoriaSelecionada
      ? getTituloCategoriaBusca(categoriaSelecionada)
      : getTituloHorarioBusca(filtrosBusca.horario);

    return (
      <div className="page-explorar">
        {!atividades.length ? (
          <p className="explorar-sem-resultados">
            Nenhuma atividade encontrada para os filtros selecionados.
          </p>
        ) : (
          <CarrosselDeAtividades
            titulo={titulo}
            atividades={atividades}
            comCarrossel={!categoriaSelecionada}
          />
        )}

        <SecaoPlanosPopulares />
      </div>
    );
  }

  const idsFiltrados = filtrosBusca
    ? new Set(filtrarAtividades(filtrosBusca).map((atividade) => atividade.id))
    : null;

  const filtrar = (lista) => {
    if (!idsFiltrados) return lista;
    return lista.filter((atividade) => idsFiltrados.has(atividade.id));
  };

  const populares = filtrar(getAtividadesPopulares());
  const turismo = filtrar(
    groupAtividadesPorCategoria(getAllAtividades())[CATEGORIA_TURISMO] ?? []
  );

  const temResultados = populares.length > 0 || turismo.length > 0;

  return (
    <div className="page-explorar">
      {!temResultados && filtrosBusca ? (
        <p className="explorar-sem-resultados">
          Nenhuma atividade encontrada para os filtros selecionados.
        </p>
      ) : (
        <>
          <CarrosselDeAtividades titulo="Populares" atividades={populares} />
          <CarrosselDeAtividades
            titulo={CATEGORIA_TURISMO}
            atividades={turismo}
          />
        </>
      )}

      <SecaoPlanosPopulares />
    </div>
  );
}

export default PageExplorar;
