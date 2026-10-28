import { useState } from "react";
import PersonalizarPlano from "../../PersonalizarPlano/Persolizarplano";
import { usePlano } from "../../../context/PlanoContext";
import {
  getPlanoById,
  formatPlanoResumo,
} from "../../../mock/planos/planos";
import "./CardPlanejamento.css";

function CardPlanejamento({
  id,
  titulo = "Clube do Livro e Manhã na Atalaia",
  descricao = "Família · Manhã · 4h",
  imagem = "/images/atividades/orla1.jpg",
}) {
  const { carregarPlanoMock, resetPlano } = usePlano();
  const [modalAberto, setModalAberto] = useState(false);
  const plano = getPlanoById(id);

  const tituloExibido = plano?.titulo ?? titulo;
  const descricaoExibida = plano
    ? formatPlanoResumo(plano)
    : descricao;
  const imagemExibida = plano?.thumbnail ?? imagem;

  const abrirPlano = () => {
    if (id == null || !carregarPlanoMock(id)) return;
    setModalAberto(true);
  };

  const fecharPlano = () => {
    setModalAberto(false);
    resetPlano();
  };

  return (
    <>
      <div
        className={`card-planejamento${id != null ? " card-planejamento--interativo" : ""}`}
        role={id != null ? "button" : undefined}
        tabIndex={id != null ? 0 : undefined}
        onClick={abrirPlano}
        onKeyDown={(e) => {
          if (id == null) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirPlano();
          }
        }}
      >
        <div className="image-wrapper">
          <img
            src={imagemExibida}
            alt={tituloExibido}
            className="card-img"
          />
        </div>

        <div className="card-info-planejamento">
          <h2>{tituloExibido}</h2>

          <p>{descricaoExibida}</p>
        </div>
      </div>

      <PersonalizarPlano visible={modalAberto} onClose={fecharPlano} />
    </>
  );
}

export default CardPlanejamento;
