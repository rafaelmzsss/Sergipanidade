import React, { useRef } from 'react';
import redPaillette from "../../assets/lantejoulas/lantejoula_vermelha.png";
import greenPaillette from "../../assets/lantejoulas/lantejoula_verde.png";
import bluePaillette from "../../assets/lantejoulas/lantejoula_azul.png";

const GravadorLantejoula = ({ imageSrc }) => {
  const canvasRef = useRef(null);
  const imagesRef = useRef({});

  const PIXEL_SIZE = 12; // Menor = mais lantejoulas (mais pesado)

  const iniciarGravacao = async () => {
    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30); // 30 FPS
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transicao-lantejoula.webm';
      a.click();
    };

    // Inicia a lógica de desenho
    recorder.start();
    await rodarAnimacao();

    // Para a gravação após a animação terminar
    setTimeout(() => recorder.stop(), 500);
  };

  const rodarAnimacao = () => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = imageSrc;
      img.crossOrigin = "anonymous";

      img.onload = async () => {
        // 1. Carregar as lantejoulas
        const load = (src) => new Promise(res => {
          const i = new Image(); i.src = src; i.onload = () => res(i);
        });
        imagesRef.current.red = await load(redPaillette);
        imagesRef.current.green = await load(greenPaillette);
        imagesRef.current.blue = await load(bluePaillette);

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let points = [];
        for (let y = 0; y < canvas.height; y += PIXEL_SIZE) {
          for (let x = 0; x < canvas.width; x += PIXEL_SIZE) {
            const i = (y * canvas.width + x) * 4;
            points.push({ x, y, r: pixels[i], g: pixels[i + 1], b: pixels[i + 2], order: Math.random() });
          }
        }
        points.sort((a, b) => a.order - b.order);

        let current = 0;
        const animate = () => {
          const step = Math.ceil(points.length / 30); // Duração de ~1 seg (30 frames)
          for (let i = 0; i < step && current < points.length; i++) {
            drawPaillette(ctx, points[current]);
            current++;
          }
          if (current < points.length) requestAnimationFrame(animate);
          else resolve();
        };
        requestAnimationFrame(animate);
      };
    });
  };

  const drawPaillette = (ctx, p) => {
    const { x, y, r, g, b } = p;
    const size = PIXEL_SIZE;
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate((Math.random() - 0.5));

    // Background escuro
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r * 0.2},${g * 0.2},${b * 0.2})`;
    ctx.fill();

    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = r / 255; ctx.drawImage(imagesRef.current.red, -size / 2, -size / 2, size, size);
    ctx.globalAlpha = g / 255; ctx.drawImage(imagesRef.current.green, -size / 2, -size / 2, size, size);
    ctx.globalAlpha = b / 255; ctx.drawImage(imagesRef.current.blue, -size / 2, -size / 2, size, size);
    ctx.restore();
  };

  return (
    <div>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid white' }} />
      <br />
      <button onClick={iniciarGravacao} style={{ padding: '10px', marginTop: '10px' }}>
        Gerar e Baixar Vídeo
      </button>
    </div>
  );
};

export default GravadorLantejoula;