import { useEffect } from 'react';
import './CardCulturaInfo.css';
import { FaHeart } from 'react-icons/fa';
import { getCulturaById, getLugaresByCulturaId } from '../../../mock/cultura/cultura';
import CardAtividade from '../CardAtividades/CardAtividade';

function CardCulturaInfo({ id, cultura: culturaProp, onClose }) {
  const cultura = culturaProp ?? getCulturaById(id);

  useEffect(() => {
    if (!cultura) return undefined;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [cultura]);

  if (!cultura) return null;

  const lugares = getLugaresByCulturaId(cultura.id);

  return (
    <div
      className="card-cultura-info-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-cultura-info-titulo"
      onClick={onClose}
    >
      <div
        className="card-cultura-info-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            className="card-cultura-info-fechar"
            onClick={onClose}
          >
            Voltar
          </button>
        )}

        <article className="card-cultura-info" data-cultura-id={cultura.id}>
          <header className="card-cultura-info-imagem">
            <img
              src={cultura.image}
              alt={cultura.title}
            />
            <button type="button" className="card-cultura-info-favorito" aria-label="Favoritar">
              <FaHeart />
            </button>
          </header>

          <section className="card-cultura-info-conteudo">
            <h1 id="card-cultura-info-titulo">{cultura.title}</h1>
            <span className="card-cultura-info-categoria">{cultura.category}</span>
            <p className="card-cultura-info-descricao">{cultura.description}</p>
          </section>

          <section className="card-cultura-info-lugares" aria-labelledby="card-cultura-info-lugares-titulo">
            <h2 id="card-cultura-info-lugares-titulo">
              Atividades sobre {cultura.category.toLowerCase()}
            </h2>
            <div className="card-cultura-info-lugares-lista">
              {lugares.map((atividade) => (
                <CardAtividade key={atividade.id} id={atividade.id} />
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

export default CardCulturaInfo;
