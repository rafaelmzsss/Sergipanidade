import { useState, useEffect } from "react";
import ModalLinhaDoTempo from "../../Modais/ModalCriarPlano/ModalLinhaDoTempo/ModalLinhaDoTempo";
import PersonalizarPlano from "../../PersonalizarPlano/Persolizarplano";
import { usePlano } from "../../../context/PlanoContext";
import "./CardCriarPlano.css";

function CardCriarPlano() {
  const { resetPlano } = usePlano();
  const [modalAberto, setModalAberto] = useState(false);
  const [personalizarAberto, setPersonalizarAberto] = useState(false);

  useEffect(() => {
    if (!modalAberto) return undefined;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalAberto]);

  return (
    <>
      <div
        className="card-criar-plano"
        role="button"
        tabIndex={0}
        onClick={() => {
          resetPlano();
          setModalAberto(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            resetPlano();
            setModalAberto(true);
          }
        }}
      >
        <h2>Crie um plano</h2>
      </div>

      {modalAberto && (
        <ModalLinhaDoTempo
          onClose={() => setModalAberto(false)}
          onContinuar={() => {
            setModalAberto(false);
            setPersonalizarAberto(true);
          }}
        />
      )}

      <PersonalizarPlano
        visible={personalizarAberto}
        onClose={() => {
          setPersonalizarAberto(false);
          resetPlano();
        }}
      />
    </>
  );
}

export default CardCriarPlano;