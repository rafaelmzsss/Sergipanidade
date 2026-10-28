import { useState } from "react";
import estrelaImg from "../../assets/lantejoulas/estrela_amarela.png";
import "./EstrelaRating.css";

/**
 * EstrelaRating
 * @param {number}   valor       - Avaliação atual (0–5, precisão de 0.1)
 * @param {function} onChange    - Callback ao alterar (null = somente leitura)
 * @param {boolean}  readOnly    - Desativa interação
 */
export default function EstrelaRating({ valor = 5, onChange, readOnly = false }) {
  const [hoverValor, setHoverValor] = useState(null);

  const valorAtivo = hoverValor ?? valor;

  // Para cada uma das 5 estrelas, calcula o % de preenchimento
  function percentualEstrela(indice) {
    const diff = valorAtivo - indice; // 0-based
    if (diff >= 1) return 100;
    if (diff <= 0) return 0;
    return Math.round(diff * 100);
  }

  function handleMouseMove(e, indice) {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    // Precisão de 0.1 dentro da estrela
    const decimal = Math.round(pct * 10) / 10;
    setHoverValor(indice + decimal);
  }

  function handleClick(e, indice) {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const decimal = Math.round(pct * 10) / 10;
    const novoValor = Math.min(5, Math.max(0, indice + decimal));
    onChange(Math.round(novoValor * 10) / 10);
  }

  return (
    <div
      className="estrela-rating"
      onMouseLeave={() => !readOnly && setHoverValor(null)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const pct = percentualEstrela(i);
        return (
          <div
            key={i}
            className={`estrela-wrapper ${readOnly ? "" : "estrela-interativa"}`}
            onMouseMove={(e) => handleMouseMove(e, i)}
            onClick={(e) => handleClick(e, i)}
          >
            {/* Estrela vazia (fundo) */}
            <img
              src={estrelaImg}
              alt=""
              className="estrela-img estrela-vazia"
            />
            {/* Estrela preenchida (clip by width %) */}
            <div
              className="estrela-clip"
              style={{ width: `${pct}%` }}
            >
              <img
                src={estrelaImg}
                alt={`${i + 1} estrela`}
                className="estrela-img estrela-cheia"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
