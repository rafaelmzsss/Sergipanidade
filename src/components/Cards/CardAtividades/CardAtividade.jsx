import { useEffect, useState } from "react";
import "./CardAtividade.css";
import ModalAtividadeExpandida from "../../Modais/ModalAtividadeExpandida/ModalAtividadeExpandida";
import {
  getAtividadeById,
  formatLocalizacao,
} from "../../../mock/atividades/atividades";

function CardAtividade({
  id,
  titulo = "Largo da Gente Sergipana",
  localizacao = "Centro, Aracaju - SE",
  imagem = "/images/atividades/orla1.jpg",
  interativo = true,
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const atividade = getAtividadeById(id);

  const tituloExibido = atividade?.titulo ?? titulo;
  const imagemExibida = atividade?.thumbnail ?? imagem;
  const localizacaoExibida = atividade
    ? formatLocalizacao(atividade.endereco)
    : localizacao;

  useEffect(() => {
    if (!modalAberto) return undefined;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalAberto]);

  const abrirModal = () => {
    if (!interativo || id == null) return;
    setModalAberto(true);
  };

  return (
    <>
      <div
        className={`card${interativo && id != null ? " card--interativo" : ""}`}
        role={interativo && id != null ? "button" : undefined}
        tabIndex={interativo && id != null ? 0 : undefined}
        onClick={abrirModal}
        onKeyDown={(e) => {
          if (!interativo || id == null) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirModal();
          }
        }}
      >
        <div className="card-image-container">
          <img
            src={imagemExibida}
            alt={tituloExibido}
            className="card-image"
          />
        </div>

        <div className="card-info">
          <h3 className="card-title">
            {tituloExibido}
          </h3>

          <p className="card-location">
            {localizacaoExibida}
          </p>
        </div>
      </div>

      {modalAberto && (
        <ModalAtividadeExpandida
          id={id}
          onClose={() => setModalAberto(false)}
        />
      )}
    </>
  );
}

export default CardAtividade;
