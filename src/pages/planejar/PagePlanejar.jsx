import CarrosselDePlanos from "../../components/CarrosselCard/CarrosselDePlanos/CarrosselDePlanos";
import {
  getTituloCategoriaBusca,
  getTituloHorarioBusca,
  temFiltroHorario,
} from "../../mock/atividades/atividades";
import { filtrarPlanos } from "../../mock/planos/planos";
import "./PagePlanejar.css";

const SECOES_POPULARES = [{ comCriarPlano: true, ids: [] }];

function PagePlanejar({ filtrosBusca = null }) {
  const categoriaSelecionada = filtrosBusca?.categoria;
  const filtroHorarioAtivo = temFiltroHorario(filtrosBusca?.horario);

  if (categoriaSelecionada || filtroHorarioAtivo) {
    const planoIds = filtrarPlanos(filtrosBusca).map((plano) => plano.id);
    const titulo = categoriaSelecionada
      ? getTituloCategoriaBusca(categoriaSelecionada)
      : getTituloHorarioBusca(filtrosBusca.horario);

    return (
      <div className="page-planejar">
        {!planoIds.length ? (
          <p className="planejar-sem-resultados">
            Nenhum plano encontrado para os filtros selecionados.
          </p>
        ) : (
          <CarrosselDePlanos
            titulo={titulo}
            planoIds={planoIds}
            comCarrossel={!categoriaSelecionada}
          />
        )}
      </div>
    );
  }

  const idsFiltrados = filtrosBusca
    ? new Set(filtrarPlanos(filtrosBusca).map((plano) => plano.id))
    : null;

  const filtrarIds = (ids) => {
    if (!idsFiltrados) return ids;
    return ids.filter((id) => idsFiltrados.has(id));
  };

  const secoes = SECOES_POPULARES.map((secao) => ({
    ...secao,
    ids: filtrarIds(secao.ids),
  })).filter((secao) => secao.ids.length > 0 || secao.comCriarPlano);

  const temResultados = secoes.some(
    (secao) => secao.ids.length > 0 || secao.comCriarPlano
  );

  return (
    <div className="page-planejar">
      {!temResultados && filtrosBusca ? (
        <p className="planejar-sem-resultados">
          Nenhum plano encontrado para os filtros selecionados.
        </p>
      ) : (
        secoes.map((secao, index) => (
          <CarrosselDePlanos
            key={index}
            titulo="Populares"
            comCriarPlano={secao.comCriarPlano}
            planoIds={secao.ids}
          />
        ))
      )}
    </div>
  );
}

export default PagePlanejar;
