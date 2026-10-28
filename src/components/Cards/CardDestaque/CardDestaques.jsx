import { useEffect, useState } from "react";
import "./CardDestaque.css";
import SearchBar from "../../BarraDePesquisa/Completa/SearchBar";
import { getAllDestaques } from "../../../mock/destaques/destaques";
import PailletteTransitionCanvas from "./PailletteTransitionCanvas";

const INTERVALO_MS = 15000; // 15 segundos para dar bastante tempo de ler e apreciar a imagem

function CardDestaques({
  id,
  titulo = "Descubra o País do Forró: Roteiros que Pulsam a Cultura Sergipana",
  imagem = "/images/destaques/destaques-forro.jpg",
  intervalo = INTERVALO_MS,
  onSearch,
}) {
  const destaques = getAllDestaques();

  const indiceInicial =
    id != null
      ? destaques.findIndex(
          (destaque) => String(destaque.id) === String(id)
        )
      : 0;

  const [indiceAtual, setIndiceAtual] = useState(
    indiceInicial >= 0 ? indiceInicial : 0
  );

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isTextHidden, setIsTextHidden] = useState(false);
  const [renderIndex, setRenderIndex] = useState(indiceAtual);

  useEffect(() => {
    if (destaques.length <= 1) return;

    // Etapa 1: Quando o intervalo aciona, o texto desaparece primeiro.
    const timer = setInterval(() => {
      setIsTextHidden(true);
    }, intervalo);

    return () => clearInterval(timer);
  }, [destaques.length, intervalo]);

  // Etapa 2: Aguarda o fade out do texto e inicia as lantejoulas
  useEffect(() => {
    let t;
    if (isTextHidden && !isTransitioning) {
      t = setTimeout(() => {
        setIsTransitioning(true);
      }, 500); // Tempo do fade out no CSS
    }
    return () => clearTimeout(t);
  }, [isTextHidden, isTransitioning]);

  const handleCovered = () => {
    // Etapa 3: Quando as lantejoulas cobrem a imagem, trocamos a imagem e texto internamente.
    setIndiceAtual((indice) => (indice + 1) % destaques.length);
  };

  const handleTransitionEnd = () => {
    // Etapa 4 e 5: Animação finalizada, revelamos o novo texto e disparamos o fadeInUp
    setIsTransitioning(false);
    setIsTextHidden(false);
    setRenderIndex(indiceAtual);
  };

  const destaqueAtual = destaques[indiceAtual];
  const tituloExibido = destaqueAtual?.titulo ?? titulo;
  const imagemExibida = destaqueAtual?.imagem ?? imagem;

  return (
    <div className="card-destaques">
      <div className="imagem-container" style={{ position: 'relative' }}>
        <img
          key={indiceAtual}
          src={imagemExibida}
          className="imagem-card"
          alt={tituloExibido}
        />
        
        {/* Camada visual de transição */}
        <PailletteTransitionCanvas
          isTransitioning={isTransitioning}
          currentImageSrc={imagemExibida}
          onCovered={handleCovered}
          onTransitionEnd={handleTransitionEnd}
        />
      </div>

      <div className={`titulo ${isTextHidden ? "escondido" : ""}`}>
        <h1 key={renderIndex} className="titulo-card">
          {tituloExibido}
        </h1>
      </div>

      <div className="barra-de-pesquisa-container">
        <SearchBar onSearch={onSearch} />
      </div>
    </div>
  );
}

export default CardDestaques;
