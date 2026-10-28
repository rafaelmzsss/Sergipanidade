import { useState, useRef, useEffect } from "react";
import TitleBar from "../BarraSuperior/barra superior";
import BotaoLantejoula from "../BotaoLantejoulaRetangular/BotaoLantejoula";
import EstrelaRating from "./EstrelaRating";
import TimelineVertical from "./TimelineVertical";
import { usePlano } from "../../context/PlanoContext";
import { getImagemAtividade } from "../../mock/atividades/atividades";
import "./PersonalizarPlano.css";

// Ícones SVG inline
const IconPessoa   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const IconSol      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;

const IconDinheiro = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconRelogio  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconGrupo    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconUpload   = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconShare    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>;

const IconChevron  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>;

const TAGS_DISPONIVEIS = [
  "Café", "Livros", "Ar livre", "Família", "Cultura", "Gastronomia",
  "Natureza", "Noite", "Romance", "Aventura", "Arte", "Conexão",
  "Tarde tranquila", "Econômico", "Premium",
];

const TURNOS = ["Manhã", "Tarde", "Noite", "Dia todo"];
const TAMANHOS_GRUPO = ["Individualmente", "Dupla", "Trio", "Em grupo"];

function iniciais(nome) {
  if (!nome) return "??";
  return nome.trim().split(" ").slice(0, 2).map(p => p[0].toUpperCase()).join("");
}

/**
 * PersonalizarPlano
 *
 * Props:
 *  visible   {boolean}  — controla se o modal aparece
 *  onClose   {function} — callback ao fechar
 *
 * // TODO: linkar aqui — onde você quiser abrir esse modal, faça:
 * //   const [abrirPersonalizar, setAbrirPersonalizar] = useState(false);
 * //   <PersonalizarPlano visible={abrirPersonalizar} onClose={() => setAbrirPersonalizar(false)} />
 * //   e no botão/card: onClick={() => setAbrirPersonalizar(true)}
 */
export default function PersonalizarPlano({ visible = false, onClose }) {
  const { atividades, setAtividades, plano, atualizarPlano } = usePlano();

  // Travar o scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  // Estado local da UI
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [atividadeSelecionada, setAtividadeSelecionada] = useState(null);

  // Auxiliar para atualizar a atividade no contexto
  function atualizarAtividade(id, campos) {
    if (!id) return;
    setAtividades(prev =>
      prev.map(a => (a.id === id ? { ...a, ...campos } : a))
    );
    if (atividadeSelecionada && atividadeSelecionada.id === id) {
      setAtividadeSelecionada(prev => ({ ...prev, ...campos }));
    }
  }

  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.pp-dropdown-area')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const inputCapaRef  = useRef(null);

  if (!visible) return null;

  // -------- Handlers --------

  function handleUploadCapa(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    atualizarPlano({ fotoCapa: file, fotoCapaUrl: URL.createObjectURL(file) });
  }

  function adicionarTag(tag) {
    if (!plano.tags.includes(tag)) {
      atualizarPlano({ tags: [...plano.tags, tag] });
    }
    setActiveDropdown(null);
  }

  function removerTag(tag) {
    atualizarPlano({ tags: plano.tags.filter(t => t !== tag) });
  }

  function handlePublicar() {
    atualizarPlano({
      publicado: true,
      dataCriacao: new Date(),
    });
  }

  function handleEditarPlano() {
    atualizarPlano({ publicado: false });
  }

  // Duração calculada a partir das atividades na timeline  // Calcula duração
  function calcularDuracao(atvs) {
    if (!atvs || atvs.length === 0) return 0;
    return (atvs.length * 30) / 60;
  }
  const duracaoHoras = calcularDuracao(atividades);
  const duracaoLabel = duracaoHoras === 0
    ? "—"
    : `${duracaoHoras} hora${duracaoHoras !== 1 ? "s" : ""}`;

  // Formatação da data de criação
  const dataLabel = plano.dataCriacao
    ? plano.dataCriacao.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
    : "";


  // Foto do local vinda da atividade selecionada ou primeira atividade
  const atividadesOrdenadas = [...atividades].sort((a, b) => a.slot - b.slot);
  const primeiraAtividade = atividadesOrdenadas.length > 0 ? atividadesOrdenadas[0] : null;
  const atividadeAtual = atividadeSelecionada || primeiraAtividade;
  const fotoLocalAutomatico = getImagemAtividade(atividadeAtual);
  const tituloLocalAutomatico = atividadeAtual?.titulo || "Local";

  // -------- Renderização --------

  return (
    <div className="pp-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="pp-modal">

        {/* ===== BARRA SUPERIOR ===== */}
        <TitleBar
          title={plano.titulo || "Título"}
          onTitleChange={(t) => atualizarPlano({ titulo: t })}
          showEdit={!plano.publicado}
          showSend={true}
          showFavorite={true}
          showClose={true}
          onClose={onClose}
          onFavorite={() => {}}
          onSend={() => {}}
        />

        {/* ===== SEÇÃO TOPO ===== */}
        <div className="pp-top">

          {/* Foto de capa */}
          <div
            className="pp-capa"
            onClick={plano.publicado || plano.fotoCapaUrl ? undefined : () => inputCapaRef.current?.click()}
            style={{ cursor: plano.publicado || plano.fotoCapaUrl ? "default" : "pointer" }}
          >
            {plano.fotoCapaUrl ? (
              <img 
                src={plano.fotoCapaUrl} 
                alt="Capa" 
                className="pp-capa-img" 
                style={{ objectPosition: `center ${plano.capaPosition ?? 50}%` }}
              />
            ) : (
              <div className="pp-capa-placeholder">
                {!plano.publicado && <IconUpload />}
                <span>{plano.publicado ? "Sem foto de capa" : "Adicionar foto de capa"}</span>
              </div>
            )}
            {!plano.publicado && plano.fotoCapaUrl && (
              <div className="pp-capa-overlay">
                <button className="pp-capa-btn" onClick={(e) => { e.stopPropagation(); inputCapaRef.current?.click(); }}>
                  Trocar foto
                </button>
                {plano.fotoCapaUrl && (
                  <div className="pp-capa-slider-wrap" onClick={e => e.stopPropagation()}>
                    <span className="pp-capa-slider-label">Ajustar corte:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={plano.capaPosition ?? 50}
                      onChange={(e) => atualizarPlano({ capaPosition: Number(e.target.value) })}
                      className="pp-capa-slider"
                    />
                  </div>
                )}
              </div>
            )}
            {!plano.publicado && (
              <input
                ref={inputCapaRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleUploadCapa}
              />
            )}
          </div>

          {/* Painel direito */}
          <div className="pp-info">

            {!plano.publicado ? (
              /* ---- MODO EDIÇÃO ---- */
              <>
                <input
                  className="pp-titulo-input"
                  placeholder="Nome do plano"
                  value={plano.titulo}
                  onChange={(e) => atualizarPlano({ titulo: e.target.value })}
                />
                <textarea
                  className="pp-desc-input"
                  placeholder="Descreva o objetivo e a experiência desse plano..."
                  value={plano.descricao}
                  onChange={(e) => atualizarPlano({ descricao: e.target.value })}
                  rows={3}
                  maxLength={280}
                />

                {/* Row de metadados */}
                <div className="pp-meta-row">
                  {/* Criador */}
                  <div className="pp-meta-item">
                    <span className="pp-meta-icon"><IconPessoa /></span>
                    <input
                      className="pp-meta-input"
                      placeholder="Seu nome"
                      value={plano.criador}
                      onChange={(e) => atualizarPlano({ criador: e.target.value })}
                    />
                  </div>

                  <span className="pp-separator">|</span>

                  {/* Turno */}
                  <div className="pp-meta-item pp-dropdown-area" style={{ position: "relative" }}>
                    <span className="pp-meta-icon"><IconSol /></span>
                    <button className="pp-turno-btn" onClick={() => setActiveDropdown(prev => prev === 'turno' ? null : 'turno')}>
                      {plano.turno || "Turno"} <IconChevron />
                    </button>
                    {activeDropdown === 'turno' && (
                      <div className="pp-turno-dropdown">
                        {TURNOS.map(t => (
                          <div
                            key={t}
                            className={`pp-turno-option ${plano.turno === t ? "ativo" : ""}`}
                            onClick={() => { atualizarPlano({ turno: t }); setActiveDropdown(null); }}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="pp-separator">|</span>

                  {/* Grupo */}
                  <div className="pp-meta-item pp-dropdown-area" style={{ position: "relative" }}>
                    <span className="pp-meta-icon"><IconGrupo /></span>
                    <button className="pp-turno-btn" onClick={() => setActiveDropdown(prev => prev === 'grupo' ? null : 'grupo')}>
                      {plano.tamanhoGrupo || "Grupo"} <IconChevron />
                    </button>
                    {activeDropdown === 'grupo' && (
                      <div className="pp-turno-dropdown">
                        {TAMANHOS_GRUPO.map(g => (
                          <div
                            key={g}
                            className={`pp-turno-option ${plano.tamanhoGrupo === g ? "ativo" : ""}`}
                            onClick={() => { atualizarPlano({ tamanhoGrupo: g }); setActiveDropdown(null); }}
                          >
                            {g}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>



                  <span className="pp-separator">|</span>

                  {/* Faixa de preço */}
                  <div className="pp-meta-item">
                    <span className="pp-meta-icon"><IconDinheiro /></span>
                    <div className="pp-preco-group">
                      {["$", "$$", "$$$"].map(p => (
                        <button
                          key={p}
                          className={`pp-preco-btn ${plano.preco === p ? "ativo" : ""}`}
                          onClick={() => atualizarPlano({ preco: p })}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="pp-tags-row pp-dropdown-area" style={{ position: "relative" }}>
                  {plano.tags.map(tag => (
                    <span key={tag} className="pp-tag">
                      {tag}
                      <button className="pp-tag-remove" onClick={() => removerTag(tag)}>×</button>
                    </span>
                  ))}
                  <button className="pp-tag-nova" onClick={() => setActiveDropdown(prev => prev === 'tags' ? null : 'tags')}>
                    Nova tag <span style={{ fontSize: 16 }}>+</span>
                  </button>
                  {activeDropdown === 'tags' && (
                    <div className="pp-tags-dropdown" style={{ top: "calc(100% + 6px)", left: 0 }}>
                      {TAGS_DISPONIVEIS.filter(t => !plano.tags.includes(t)).map(t => (
                        <div key={t} className="pp-tag-opcao" onClick={() => adicionarTag(t)}>{t}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botão publicar */}
                <div className="pp-publicar-wrap">
                  <BotaoLantejoula
                    texto="Publicar"
                    onClick={handlePublicar}
                    altura="68px"
                    largura="280px"
                  />
                </div>
              </>
            ) : (
              /* ---- MODO PUBLICADO ---- */
              <>
                <h2 className="pp-titulo-pub">{plano.titulo || "Sem título"}</h2>
                <p className="pp-duracao-pub">Duração: {duracaoLabel}</p>
                <p className="pp-desc-pub">{plano.descricao}</p>

                {/* Metadados publicados */}
                <div className="pp-meta-pub">
                  <span className="pp-meta-pub-item"><IconRelogio /> {duracaoLabel}</span>
                  <span className="pp-meta-pub-item"><IconDinheiro /> {plano.preco || "—"}</span>
                  <span className="pp-meta-pub-item"><IconGrupo /> {plano.tamanhoGrupo || "—"}</span>
                  <span className="pp-meta-pub-item"><IconSol /> {plano.turno || "—"}</span>
                </div>

                {/* Card do criador */}
                <div className="pp-criador-card">
                  <div className="pp-avatar">{iniciais(plano.criador)}</div>
                  <div>
                    <span className="pp-criador-nome">{plano.criador || "Anônimo"}</span>
                    <span className="pp-criador-data">Criado em {dataLabel}</span>
                  </div>
                  <button
                    className="pp-editar-link"
                    onClick={handleEditarPlano}
                    style={{ marginLeft: "auto", fontSize: "13px", color: "#888", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", padding: 0 }}
                  >
                    editar plano
                  </button>
                </div>

                {/* Tags publicadas */}
                <div className="pp-tags-row">
                  {plano.tags.map(tag => (
                    <span key={tag} className="pp-tag">{tag}</span>
                  ))}
                </div>


              </>
            )}
          </div>
        </div>

        {/* ===== SEÇÃO INFERIOR (atividades e comentários) ===== */}
        <div className="pp-bottom">
          <div className="pp-bottom-header">
            <h3 className="pp-bottom-titulo">Atividades e comentários</h3>
            {!plano.publicado ? (
              <button className="pp-editar-link" onClick={handleEditarPlano}>editar planos</button>
            ) : (
              <span
                className="pp-atividades-count"
                onClick={() => {}}
              >
                {atividades.length} atividade{atividades.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>


          <div className="pp-bottom-grid">

            {/* Coluna timeline */}
            <div className="pp-timeline-col">
              <TimelineVertical atividades={atividades} onSelectAtividade={setAtividadeSelecionada} />
            </div>

            {/* Coluna foto + comentário + avaliação */}
            <div className="pp-local-col">

              {/* Foto do local (automática a partir da primeira atividade) */}
              <div className="pp-foto-local">
                {fotoLocalAutomatico ? (
                  <img src={fotoLocalAutomatico} alt="Local" className="pp-foto-local-img" />
                ) : (
                  <div className="pp-foto-local-placeholder">
                    <span>Sem foto do local</span>
                  </div>
                )}
                <div className="pp-foto-overlay">
                  {fotoLocalAutomatico && (
                    <span className="pp-foto-nome">{tituloLocalAutomatico}</span>
                  )}
                  {/* Botões de ação */}
                  <div className="pp-foto-acoes">
                    <button className="pp-foto-btn" title="Compartilhar" onClick={(e) => e.stopPropagation()}>
                      <IconShare />
                    </button>
                  </div>
                </div>
              </div>

              {/* Comentário */}
              <div className="pp-comentario">
                <p className="pp-comentario-titulo">Comentário do autor</p>
                {!plano.publicado ? (
                  <textarea
                    className="pp-comentario-input"
                    placeholder="Adicione uma descrição do local, dicas ou observações para os visitantes..."
                    value={atividadeAtual?.comentario || ""}
                    onChange={(e) => atualizarAtividade(atividadeAtual?.id, { comentario: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="pp-comentario-texto">{atividadeAtual?.comentario || "Sem comentários."}</p>
                )}
              </div>

              {/* Avaliação */}
              <div className="pp-avaliacao">
                <p className="pp-avaliacao-label">
                  Avaliação do autor: {(atividadeAtual?.avaliacao ?? 5).toFixed(1)} / 5,0
                </p>
                <EstrelaRating
                  valor={atividadeAtual?.avaliacao ?? 5}
                  onChange={plano.publicado ? undefined : (val) => atualizarAtividade(atividadeAtual?.id, { avaliacao: val })}
                  readOnly={plano.publicado}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
