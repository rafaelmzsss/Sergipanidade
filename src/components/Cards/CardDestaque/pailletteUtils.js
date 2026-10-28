export function createBezierEasing(p1x, p1y, p2x, p2y) {
    const cx = 3.0 * p1x;
    const bx = 3.0 * (p2x - p1x) - cx;
    const ax = 1.0 - cx - bx;

    const cy = 3.0 * p1y;
    const by = 3.0 * (p2y - p1y) - cy;
    const ay = 1.0 - cy - by;

    function sampleCurveX(t) { return ((ax * t + bx) * t + cx) * t; }
    function sampleCurveY(t) { return ((ay * t + by) * t + cy) * t; }
    function sampleCurveDerivativeX(t) { return (3.0 * ax * t + 2.0 * bx) * t + cx; }
    function solveCurveX(x, epsilon) {
        let t0, t1, t2, x2, d2, i;
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = sampleCurveX(t2) - x;
            if (Math.abs(x2) < epsilon) return t2;
            d2 = sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < 1e-6) break;
            t2 = t2 - x2 / d2;
        }
        t0 = 0.0; t1 = 1.0; t2 = x;
        if (t2 < t0) return t0;
        if (t2 > t1) return t1;
        while (t0 < t1) {
            x2 = sampleCurveX(t2);
            if (Math.abs(x2 - x) < epsilon) return t2;
            if (x > x2) t0 = t2;
            else t1 = t2;
            t2 = (t1 - t0) * 0.5 + t0;
        }
        return t2; 
    }
    return function(x) {
        return sampleCurveY(solveCurveX(x, 1e-6));
    };
}

export const easeCustom = createBezierEasing(0.4, 0, 0, 1.03);
// Easing extremo: x^5 garante que no início o crescimento seja minúsculo
export const easeInCustom = (x) => Math.pow(x, 5);

export const loadPailletteImages = async (img1, img2, img3, img4) => {
  const load = (src) => new Promise(res => {
    const img = new Image();
    img.src = src;
    img.onload = () => res(img);
  });
  return await Promise.all([load(img1), load(img2), load(img3), load(img4)]);
};

export const extractPixels = async (imageSrc, width, height, pixelSize) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      // Emula o object-fit: cover da imagem
      const imageRatio = img.width / img.height;
      const canvasRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imageRatio > canvasRatio) {
        drawWidth = height * imageRatio;
        offsetX = (width - drawWidth) / 2;
      } else {
        drawHeight = width / imageRatio;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      const pixels = ctx.getImageData(0, 0, width, height).data;

      const points = [];
      for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
          const i = (y * width + x) * 4;
          let r = pixels[i];
          let g = pixels[i + 1];
          let b = pixels[i + 2];

          // 1. Limite mínimo de luminosidade (evitar lantejoulas pretas)
          // Fórmula de luminância perceptiva
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          const minLuminance = 255 * 0.30; // 30%

          if (luminance < minLuminance) {
            // Se a cor for puro preto (0,0,0), aumentamos para um cinza escuro de 30%
            if (luminance === 0) {
              r = minLuminance;
              g = minLuminance;
              b = minLuminance;
            } else {
              // Aumentar a intensidade proporcionalmente para atingir a luminosidade mínima
              const factor = minLuminance / luminance;
              r = Math.min(255, r * factor);
              g = Math.min(255, g * factor);
              b = Math.min(255, b * factor);
            }
          }

          // 2. Mistura de formatos: 70% lantejoulas (0), 30% estrelas (1)
          const shape = Math.random() > 0.3 ? 0 : 1;

          // 3. Sobreposição controlada: offset aleatório de -20% a +20% do pixelSize
          const offsetX = (Math.random() - 0.5) * 0.4 * pixelSize;
          const offsetY = (Math.random() - 0.5) * 0.4 * pixelSize;

          // 4. Cor Fixa Aleatória (Estilo Confete): 0=Vermelho, 1=Verde, 2=Azul, 3=Amarelo
          const colorIndex = Math.floor(Math.random() * 4);

          points.push({ 
            x: x + offsetX, 
            y: y + offsetY, 
            r, 
            g, 
            b, 
            shape, 
            colorIndex,
            order: Math.random() 
          });
        }
      }
      points.sort((a, b) => a.order - b.order);
      resolve(points);
    };
  });
};

export const drawPaillette = (ctx, point, size, paillettes, stars = null) => {
  const { x, y, r, g, b, shape, colorIndex } = point;
  const isStar = shape === 1 && stars;
  const images = isStar ? stars : paillettes;
  const imageToDraw = images[colorIndex];

  const starScale = 1.35;
  const drawSize = isStar ? size * starScale : size;

  ctx.save();
  // Centraliza usando o size original da célula
  ctx.translate(x + size / 2, y + size / 2);

  // Rotação determinística para evitar tremulações ao redesenhar o mesmo ponto
  const rot = ((x * 13 + y * 7) % 100) / 100 - 0.5;
  ctx.rotate(rot);

  // Apenas as lantejoulas redondas ganham fundo e sombra
  if (!isStar) {
    ctx.beginPath();
    // Usa o r,g,b original (com limite mínimo) para dar uma base coerente à imagem de fundo
    ctx.arc(0, 0, drawSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r * 0.2}, ${g * 0.2}, ${b * 0.2})`;

    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;

    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
  }

  // Apenas UM drawImage por partícula, sem usar globalAlpha ou screen.
  // Desenho direto da textura (source-over é o padrão do canvas)
  if (imageToDraw) {
    ctx.drawImage(imageToDraw, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
  }
  
  ctx.restore();
};
