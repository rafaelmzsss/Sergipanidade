import { useRef, useState } from "react";
import { FiExternalLink, FiChevronLeft, FiChevronRight, FiHeart } from "react-icons/fi";
import "./CardCultura.css";
import { getCulturaById, getAtividadesByCulturaId } from "../../../mock/cultura/cultura";
import CardAtividade from "../CardAtividades/CardAtividade";

const PASSO_CARROSSEL = 191;

function CardCultura({
  id,
  secaoTitulo = "Artesanato",
  titulo = "Macramê sergipano",
  categoria = "Artesanato",
  imagem = "/images/cultura/artesanato-sergipe.jpg",
  imagemAlt,
  linkSecao = "#",
  mostrarNav = true,
}) {
  const [favorito, setFavorito] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const carrosselRef = useRef(null);

  const cultura = getCulturaById(id);
  const atividades = cultura ? getAtividadesByCulturaId(cultura.id) : [];

  const secaoTituloExibido = cultura?.category ?? secaoTitulo;
  const tituloExibido = cultura?.title ?? titulo;
  const categoriaExibida = cultura?.category ?? categoria;
  const imagemExibida = cultura?.image ?? imagem;
  const descricaoExibida = cultura?.description ?? "";
  const altImagem = imagemAlt ?? tituloExibido;
  const categoriaMinuscula = categoriaExibida.toLowerCase();

  const rolarCarrossel = (direcao) => {
    const container = carrosselRef.current;
    if (!container) return;

    container.scrollBy({
      left: direcao * PASSO_CARROSSEL,
      behavior: "smooth",
    });
  };

  if (expandido && cultura) {
    return (
      <div className="card-cultura card-cultura--expandido" data-cultura-id={cultura.id}>
        <article className="card-cultura-detalhe">
          <header className="card-cultura-detalhe-imagem">
            <img src={imagemExibida} alt={altImagem} />
            <button
              type="button"
              className={`card-cultura-favorite-btn${favorito ? " card-cultura-favorite-btn--ativo" : ""}`}
              aria-label={favorito ? "Remover dos favoritos" : "Favoritar"}
              aria-pressed={favorito}
              onClick={() => setFavorito((ativo) => !ativo)}
            >
              <FiHeart size={26} strokeWidth={2} />
            </button>
          </header>

          <section className="card-cultura-detalhe-conteudo">
            <h1>{tituloExibido}</h1>
            <span className="card-cultura-detalhe-categoria">{categoriaExibida}</span>
            <p className="card-cultura-detalhe-descricao">{descricaoExibida}</p>
          </section>

          {atividades.length > 0 && (
            <section
              className="card-cultura-detalhe-atividades"
              aria-labelledby={`card-cultura-atividades-${cultura.id}`}
            >
              <div className="card-cultura-detalhe-atividades-header">
                <a
                  href={linkSecao}
                  className="card-cultura-detalhe-atividades-titulo"
                  id={`card-cultura-atividades-${cultura.id}`}
                >
                  <h2>Atividades sobre {categoriaMinuscula}</h2>
                  <FiExternalLink size={20} strokeWidth={2.5} />
                </a>
                <div className="card-cultura-nav">
                  <button
                    type="button"
                    className="card-cultura-nav-btn"
                    aria-label="Atividades anteriores"
                    onClick={() => rolarCarrossel(-1)}
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    className="card-cultura-nav-btn"
                    aria-label="Próximas atividades"
                    onClick={() => rolarCarrossel(1)}
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              </div>

              <div
                className="card-cultura-detalhe-atividades-lista"
                ref={carrosselRef}
              >
                {atividades.map((atividade) => (
                  <CardAtividade key={atividade.id} id={atividade.id} />
                ))}
              </div>
            </section>
          )}
        </article>

        <div className="card-cultura-ler-mais">
          <button type="button" onClick={() => setExpandido(false)}>
            Ler menos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-cultura" data-cultura-id={id}>
      <div className="card-cultura-header">
        <a
          href={linkSecao}
          className="card-cultura-titulo"
          aria-label={`Ver mais sobre ${secaoTituloExibido}`}
        >
          <h2>{secaoTituloExibido}</h2>
          <FiExternalLink size={20} strokeWidth={2.5} />
        </a>
        {mostrarNav && (
          <div className="card-cultura-nav">
            <button type="button" className="card-cultura-nav-btn" aria-label="Anterior">
              <FiChevronLeft size={20} />
            </button>
            <button type="button" className="card-cultura-nav-btn" aria-label="Próximo">
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="card-cultura-main">
        <img src={imagemExibida} alt={altImagem} className="card-cultura-img" />

        <div className="card-cultura-gradient" />

        <div className="card-cultura-favorite">
          <button
            type="button"
            className={`card-cultura-favorite-btn${favorito ? " card-cultura-favorite-btn--ativo" : ""}`}
            aria-label={favorito ? "Remover dos favoritos" : "Favoritar"}
            aria-pressed={favorito}
            onClick={() => setFavorito((ativo) => !ativo)}
          >
            <FiHeart size={26} strokeWidth={2} />
          </button>
        </div>

        <div className="card-cultura-info">
          <h3>{tituloExibido}</h3>
          <p>{categoriaExibida}</p>
        </div>
      </div>

      <div className="card-cultura-ler-mais">
        <button
          type="button"
          onClick={() => setExpandido(true)}
          disabled={!cultura}
        >
          Ler mais
        </button>
      </div>
    </div>
  );
}

export default CardCultura;
