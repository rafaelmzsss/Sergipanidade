import { getImagemAtividade } from "../../mock/atividades/atividades";
import "./TimelineVertical.css";

const MINUTOS_POR_SLOT = 30;

/**
 * Converte índice de slot em string de horário HH:MM
 */
function slotParaHorario(slot) {
  const totalMin = slot * MINUTOS_POR_SLOT;
  const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}


/**
 * TimelineVertical
 * Exibe a lista de atividades atribuídas no ModalLinhaDoTempo
 * em formato vertical com marcadores de horário.
 */
export default function TimelineVertical({ atividades = [], onSelectAtividade }) {
  if (atividades.length === 0) {
    return (
      <div className="tv-empty">
        <p>Nenhuma atividade adicionada ainda.</p>
        <p>Arraste cards no modal da linha do tempo.</p>
      </div>
    );
  }

  // Ordena por slot
  const ordenadas = [...atividades].sort((a, b) => a.slot - b.slot);

  // Agrupa: cada atividade é exibida com seu horário de início
  // e duração de 1 slot (30 min) como padrão
  return (
    <div className="tv-container">
      {ordenadas.map((atv) => {
        const horario = slotParaHorario(atv.slot);
        const durMin = MINUTOS_POR_SLOT;
        const durLabel =
          durMin < 60
            ? `${durMin} min`
            : `${durMin / 60} hora${durMin / 60 > 1 ? "s" : ""}`;

        const imagemAtividade = getImagemAtividade(atv);

        return (
          <div key={atv.id} className="tv-item">
            {/* Marcador de hora */}
            <div className="tv-hora-row">
              <span className="tv-linha" />
              <span className="tv-hora-label">{horario} horas</span>
              <span className="tv-linha" />
            </div>

            {/* Card da atividade */}
            <div className="tv-card">
              <div className="tv-card-logo">
                {imagemAtividade ? (
                  <img src={imagemAtividade} alt={atv.titulo} className="tv-card-img" />
                ) : (
                  <div className="tv-card-logo-placeholder" />
                )}
              </div>
              <div className="tv-card-info">
                <span className="tv-card-titulo">{atv.titulo || "Atividade"}</span>
              </div>
              <div className="tv-card-meta">
                <span className="tv-card-dur">{durLabel}</span>
                <a 
                  href="#" 
                  className="tv-saber-mais"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSelectAtividade) onSelectAtividade(atv);
                  }}
                >
                  saber mais
                </a>
              </div>
            </div>
          </div>
        );
      })}

      {/* O horário final extra (vazio) foi removido */}
    </div>
  );
}
