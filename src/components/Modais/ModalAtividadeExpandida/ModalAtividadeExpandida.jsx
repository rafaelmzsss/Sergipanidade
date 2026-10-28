import { useState } from "react";
import { FiImage } from "react-icons/fi";
import TitleBar from "../../BarraSuperior/barra superior";
import EstrelaRating from "../../PersonalizarPlano/EstrelaRating";
import CarrosselDePlanos from "../../CarrosselCard/CarrosselDePlanos/CarrosselDePlanos";
import {
  getAtividadeById,
  formatEnderecoCompleto,
  formatHorarios,
  formatNota,
} from "../../../mock/atividades/atividades";
import { getPlanosByAtividadeId } from "../../../mock/planos/planos";
import "./ModalAtividadeExpandida.css";

function ModalAtividadeExpandida({ id, onClose }) {
  const [favorito, setFavorito] = useState(false);
  const atividade = getAtividadeById(id);
  const [nota, setNota] = useState(atividade?.nota ?? 0);
  const planos = getPlanosByAtividadeId(id);

  if (!atividade) return null;

  const imagens = atividade.imagens?.length
    ? atividade.imagens
    : [atividade.thumbnail].filter(Boolean);

  const planoIds = planos.map((plano) => plano.id);

  return (
    <div className="mae-overlay" onClick={onClose}>
      <div
        className="mae-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mae-titulo-atividade"
        onClick={(e) => e.stopPropagation()}
      >
        <TitleBar
          title="Detalhes da atividade"
          showEdit={false}
          showSend={true}
          showFavorite={true}
          showClose={true}
          onSend={() => {}}
          onFavorite={() => setFavorito((ativo) => !ativo)}
          isFavorited={favorito}
          onClose={onClose}
        />

        <div className="mae-modal-scroll">
        <div className="mae-galeria">
          {imagens.slice(0, 3).map((src, index) => (
            <div key={`${src}-${index}`} className="mae-galeria-item">
              <img src={src} alt={`${atividade.titulo} - foto ${index + 1}`} />
              {index === Math.min(imagens.length, 3) - 1 && imagens.length > 0 && (
                <span className="mae-galeria-badge" aria-hidden="true">
                  <FiImage size={16} />
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mae-corpo">
          <section className="mae-info">
            <h2 id="mae-titulo-atividade">{atividade.titulo}</h2>
            <p className="mae-endereco">
              {formatEnderecoCompleto(atividade.endereco)}
            </p>
            <p className="mae-horario">
              {formatHorarios(atividade.horarios)}
            </p>
            <p className="mae-descricao">{atividade.descricao}</p>

            <div className="mae-avaliacao">
              <p className="mae-avaliacao-texto">
                Avaliação: {formatNota(nota)} / 5,0
              </p>
              <EstrelaRating
                valor={nota}
                onChange={setNota}
              />
            </div>
          </section>

          <section
            className="mae-planos"
            aria-labelledby="mae-planos-titulo"
          >
            {planoIds.length > 0 ? (
              <CarrosselDePlanos
                titulo="Planos que incluem essa atividade"
                planoIds={planoIds}
              />
            ) : (
              <>
                <h3 className="mae-planos-titulo-solo" id="mae-planos-titulo">
                  Planos que incluem essa atividade
                </h3>
                <p className="mae-planos-vazio">
                  Nenhum plano inclui esta atividade ainda.
                </p>
              </>
            )}
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}

export default ModalAtividadeExpandida;
