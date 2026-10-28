import React, { useEffect, useRef } from "react";
import { loadPailletteImages, extractPixels, drawPaillette, easeCustom, easeInCustom } from "./pailletteUtils";
import redPaillette from "../../../assets/lantejoulas/latenjoula_vermelha.png";
import greenPaillette from "../../../assets/lantejoulas/lantejoula_verde.png";
import bluePaillette from "../../../assets/lantejoulas/lantejoula_azul.png";
import yellowPaillette from "../../../assets/lantejoulas/lantejoula_amarela.png";
import redStar from "../../../assets/lantejoulas/estrela_vermelha.png";
import greenStar from "../../../assets/lantejoulas/estrela_verde.png";
import blueStar from "../../../assets/lantejoulas/estrela_azul.png";
import yellowStar from "../../../assets/lantejoulas/estrela_amarela.png";

const DRAW_SIZE = 78;
const GRID_STEP = Math.floor(DRAW_SIZE * 0.8); // Espaçamento efetivo menor que o tamanho da lantejoula

const PailletteTransitionCanvas = ({
  isTransitioning,
  currentImageSrc,
  onCovered,
  onTransitionEnd
}) => {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);
  const imagesRef = useRef([]);
  const starsRef = useRef([]);
  const animFrameRef = useRef(null);

  useEffect(() => {
    // Carregar as imagens de lantejoulas e estrelas (faz cache)
    Promise.all([
      loadPailletteImages(redPaillette, greenPaillette, bluePaillette, yellowPaillette),
      loadPailletteImages(redStar, greenStar, blueStar, yellowStar)
    ]).then(([paillettes, stars]) => {
      imagesRef.current = paillettes;
      starsRef.current = stars;
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (isTransitioning) {
      iniciarAnimacao();
    }
  }, [isTransitioning]);

  const iniciarAnimacao = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Ajustar o canvas para o tamanho exato do container (imagem-container)
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Extrai os pixels da imagem *atual* que está de fundo para criar os pontos de lantejoulas
    const points = await extractPixels(currentImageSrc, canvas.width, canvas.height, GRID_STEP);
    pointsRef.current = points;

    animarFaseEntrada();
  };

  const animarFaseEntrada = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const points = pointsRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let current = 0;
    const duration = 2200; // 2.2 segundos para ter bastante tempo de um início BEM lento
    const startTime = performance.now();

    const loop = (time) => {
      let progress = (time - startTime) / duration;
      if (progress > 1) progress = 1;

      const easedProgress = easeInCustom(progress);

      // O easing (1.03) pode gerar um número levemente maior que a quantidade de pontos,
      // simulando o overshoot. Clamp em points.length para não tentar desenhar pontos que não existem.
      const targetIndex = Math.max(0, Math.min(points.length, Math.floor(easedProgress * points.length)));

      // Se o targetIndex mudou (para mais ou para menos), redesenhamos a cena
      if (current !== targetIndex) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        current = targetIndex;
        for (let i = 0; i < current; i++) {
          drawPaillette(ctx, points[i], DRAW_SIZE, imagesRef.current, starsRef.current);
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        // Garantir finalização precisa
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < points.length; i++) {
          drawPaillette(ctx, points[i], DRAW_SIZE, imagesRef.current, starsRef.current);
        }

        if (onCovered) onCovered();
        setTimeout(() => {
          animarFaseSaida();
        }, 500);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const animarFaseSaida = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const points = pointsRef.current;

    let current = points.length;
    const duration = 1200; // 1.2s para uma saída fluida
    const startTime = performance.now();

    const loop = (time) => {
      let progress = (time - startTime) / duration;
      if (progress > 1) progress = 1;

      const easedProgress = easeCustom(progress);

      // Sai progressivamente (invertendo a progressão)
      const targetIndex = Math.max(0, Math.min(points.length, Math.floor((1 - easedProgress) * points.length)));

      if (current !== targetIndex) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        current = targetIndex;
        for (let i = 0; i < current; i++) {
          drawPaillette(ctx, points[i], DRAW_SIZE, imagesRef.current, starsRef.current);
        }
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onTransitionEnd) onTransitionEnd();
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 10
      }}
    />
  );
};

export default PailletteTransitionCanvas;
