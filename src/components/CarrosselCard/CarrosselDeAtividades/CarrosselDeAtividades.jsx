import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CardAtividade from "../../Cards/CardAtividades/CardAtividade";
import { getAllAtividades } from "../../../mock/atividades/atividades";
import "./CarrosselDeAtividades.css";

const GAP = 20;
const TITULO_POPULARES = "Populares";

function CarrosselDeAtividades({
  titulo,
  atividades = [],
  comCarrossel = true,
  renderItem,
}) {
  const trackRef = useRef(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  const atividadesExibidas = useMemo(
    () => (titulo === TITULO_POPULARES ? getAllAtividades() : atividades),
    [titulo, atividades]
  );

  const atualizarBotoes = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, clientWidth, scrollWidth } = track;
    setPodeVoltar(scrollLeft > 0);
    setPodeAvancar(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    if (!comCarrossel) return;
    atualizarBotoes();
  }, [atividadesExibidas, atualizarBotoes, comCarrossel]);

  useEffect(() => {
    if (!comCarrossel) return undefined;

    const track = trackRef.current;
    if (!track) return undefined;

    track.addEventListener("scroll", atualizarBotoes, { passive: true });
    window.addEventListener("resize", atualizarBotoes);

    return () => {
      track.removeEventListener("scroll", atualizarBotoes);
      window.removeEventListener("resize", atualizarBotoes);
    };
  }, [atualizarBotoes, comCarrossel]);

  if (!atividadesExibidas.length) return null;

  const obterPassoScroll = () => {
    const track = trackRef.current;
    if (!track) return 195;

    const primeiroCard = track.querySelector(".carrossel-de-atividades__item");
    if (!primeiroCard) return 195;

    const larguraCard = primeiroCard.getBoundingClientRect().width;
    const cardsVisiveis = Math.max(
      1,
      Math.floor(track.clientWidth / (larguraCard + GAP))
    );

    return (larguraCard + GAP) * cardsVisiveis;
  };

  const scroll = (direction) => {
    trackRef.current?.scrollBy({
      left: direction * obterPassoScroll(),
      behavior: "smooth",
    });
  };

  return (
    <section
      className={`carrossel-de-atividades${
        comCarrossel ? "" : " carrossel-de-atividades--grade"
      }`}
    >
      <div className="carrossel-de-atividades__header">
        <h2 className="carrossel-de-atividades__titulo">{titulo}</h2>

        {comCarrossel && (
          <div className="carrossel-de-atividades__nav">
            <button
              type="button"
              className="carrossel-de-atividades__botao"
              aria-label="Rolar para a esquerda"
              disabled={!podeVoltar}
              onClick={() => scroll(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="carrossel-de-atividades__botao"
              aria-label="Rolar para a direita"
              disabled={!podeAvancar}
              onClick={() => scroll(1)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div
        className={`carrossel-de-atividades__track${
          comCarrossel ? "" : " carrossel-de-atividades__track--grade"
        }`}
        ref={comCarrossel ? trackRef : null}
      >
        {atividadesExibidas.map((atividade) => (
          <div
            key={atividade.id}
            className="carrossel-de-atividades__item"
          >
            {renderItem ? renderItem(atividade) : <CardAtividade id={atividade.id} />}
          </div>
        ))}
      </div>
    </section>
  );
}

export default CarrosselDeAtividades;
