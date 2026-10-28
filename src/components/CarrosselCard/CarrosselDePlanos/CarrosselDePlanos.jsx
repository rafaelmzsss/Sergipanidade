import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CardPlanejamento from "../../Cards/CardPlanos/CardPlanejamento";
import CardCriarPlano from "../../Cards/CardCriarPlano/CardCriarPlano";
import { getAllPlanos } from "../../../mock/planos/planos";
import "./CarrosselDePlanos.css";

const GAP = 20;
const PASSO_PADRAO = 344;
const TITULO_POPULARES = "Populares";

function CarrosselDePlanos({
  titulo,
  planoIds = [],
  comCriarPlano = false,
  comCarrossel = true,
}) {
  const trackRef = useRef(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  const planoIdsExibidos = useMemo(
    () =>
      titulo === TITULO_POPULARES
        ? getAllPlanos().map((plano) => plano.id)
        : planoIds,
    [titulo, planoIds]
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
  }, [planoIdsExibidos, comCriarPlano, atualizarBotoes, comCarrossel]);

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

  if (!planoIdsExibidos.length && !comCriarPlano) return null;

  const obterPassoScroll = () => {
    const track = trackRef.current;
    if (!track) return PASSO_PADRAO;

    const primeiroCard = track.querySelector(".carrossel-de-planos__item");
    if (!primeiroCard) return PASSO_PADRAO;

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
      className={`carrossel-de-planos${
        comCarrossel ? "" : " carrossel-de-planos--grade"
      }`}
    >
      <div className="carrossel-de-planos__header">
        <h2 className="carrossel-de-planos__titulo">{titulo}</h2>

        {comCarrossel && (
          <div className="carrossel-de-planos__nav">
            <button
              type="button"
              className="carrossel-de-planos__botao"
              aria-label="Rolar para a esquerda"
              disabled={!podeVoltar}
              onClick={() => scroll(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="carrossel-de-planos__botao"
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
        className={`carrossel-de-planos__track${
          comCarrossel ? "" : " carrossel-de-planos__track--grade"
        }`}
        ref={comCarrossel ? trackRef : null}
      >
        {comCriarPlano && (
          <div className="carrossel-de-planos__item">
            <CardCriarPlano />
          </div>
        )}

        {planoIdsExibidos.map((id) => (
          <div key={id} className="carrossel-de-planos__item">
            <CardPlanejamento id={id} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default CarrosselDePlanos;
