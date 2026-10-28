import CardCultura from "../../components/Cards/CardCultura/CardCultura";
import {
  getTituloCategoriaBusca,
  getTituloHorarioBusca,
  temFiltroHorario,
} from "../../mock/atividades/atividades";
import { filtrarCultura } from "../../mock/cultura/cultura";
import "./PageCultura.css";

const CULTURA_IDS = [1, 2, 3, 4, 5];

function PageCultura({ filtrosBusca = null }) {
  const categoriaSelecionada = filtrosBusca?.categoria;
  const filtroHorarioAtivo = temFiltroHorario(filtrosBusca?.horario);

  const culturaIds = filtrosBusca
    ? filtrarCultura(filtrosBusca).map((item) => item.id)
    : CULTURA_IDS;

  const tituloBusca =
    categoriaSelecionada || filtroHorarioAtivo
      ? categoriaSelecionada
        ? getTituloCategoriaBusca(categoriaSelecionada)
        : getTituloHorarioBusca(filtrosBusca.horario)
      : null;

  return (
    <div className="page-cultura">
      {tituloBusca && (
        <h2 className="page-cultura-titulo-busca">{tituloBusca}</h2>
      )}

      {!culturaIds.length ? (
        <p className="page-cultura-sem-resultados">
          Nenhum conteúdo cultural encontrado para os filtros selecionados.
        </p>
      ) : (
        <div className="page-cultura-lista">
          {culturaIds.map((id) => (
            <CardCultura key={id} id={id} mostrarNav={false} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PageCultura;
