import React, { useState, useRef, useMemo, useEffect } from "react";
import { usePlano } from "../../../../context/PlanoContext";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useDraggable, useDroppable } from "@dnd-kit/core";

// Importações dos seus componentes existentes
import BotaoLantejoula from "../../../BotaoLantejoulaRetangular/BotaoLantejoula";
import CardAtividade from "../../../Cards/CardAtividades/CardAtividade";
import CardTimeline from "../../../Cards/CardTimeline/CardTimeline";
import TitleBar from "../../../BarraSuperior/barra superior";
import { IoTrash } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi"; // Ícone similar ao da imagem ao lado de Populares
import SearchBar from "../../../BarraDePesquisa/Completa/SearchBar";
import CarrosselDeAtividades from "../../../CarrosselCard/CarrosselDeAtividades/CarrosselDeAtividades";
import { filtrarAtividades } from "../../../../mock/atividades/atividades";
import "./ModalLinhaDoTempo.css";

// Configurações constantes
const PIXELS_POR_BLOCO = 100;
const TOTAL_BLOCOS = 48;

// --- SUB-COMPONENTE: SLOT (ZONA DE DROP) ---
function TimelineSlot({ index }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { slot: index },
  });

  return (
    <div
      ref={setNodeRef}
      className="timeline-slot"
      style={{
        width: `${PIXELS_POR_BLOCO}px`,
        height: "100%",
        flexShrink: 0,
        backgroundColor: isOver ? "rgba(0,0,0,0.05)" : "transparent",
      }}
    />
  );
}

// --- SUB-COMPONENTE: CARD NA TIMELINE ---
function DraggableCard({ atividade, onRemove, onResize }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: atividade.id,
    data: { ...atividade, type: 'timeline' }
  });

  const width = (atividade.duration || 1) * PIXELS_POR_BLOCO;

  const style = {
    position: "absolute",
    left: `${atividade.slot * PIXELS_POR_BLOCO}px`,
    top: "10px",
    width: `${width}px`,
    height: "110px",
    zIndex: 20,
    cursor: "grab",
    // Durante o drag, esconde o card original — só o DragOverlay aparece
    opacity: isDragging ? 0 : 1,
    pointerEvents: isDragging ? "none" : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="draggable-card-wrapper" {...listeners} {...attributes}>
      <button
        className="btn-remover"
        onClick={(e) => onRemove(atividade.id, e)}
        onPointerDown={(e) => e.stopPropagation()} // Impede que o drag inicie ao clicar no X
      >
        ×
      </button>
      <CardTimeline
        atividade={atividade}
        width={width}
        onResize={onResize}
        PIXELS_POR_BLOCO={PIXELS_POR_BLOCO}
      />
    </div>
  );
}

// --- SUB-COMPONENTE: TEMPLATE (PAINEL INFERIOR) ---
function TemplateCard({ card }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${card.id}`,
    data: { type: 'template', ...card }
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}
      style={{ opacity: isDragging ? 0 : 1, cursor: "grab" }}>
      <CardAtividade {...card} interativo={false} />
    </div>
  );
}

// --- SUB-COMPONENTE: LIXEIRA DINÂMICA ---
function TrashZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'trash-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`trash-zone ${isOver ? 'trash-zone--hover' : ''}`}
    >
      <IoTrash className="trash-zone-icon" />
    </div>
  );
}

// --- COMPONENTE PRINCIPAL ---
function ModalLinhaDoTempo({ desativado = false, onClose, onContinuar }) {
  const { setAtividades: setAtividadesCtx } = usePlano();
  const [atividades, setAtividades] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [, forceUpdate] = useState(0);

  // Sincroniza atividades locais com o contexto global
  useEffect(() => {
    setAtividadesCtx(atividades);
  }, [atividades, setAtividadesCtx]);

  // Recalcula posição dos droppables a cada render durante o drag
  const measuring = useMemo(() => ({
    droppable: {
      strategy: MeasuringStrategy.Always,
    }
  }), []);

  const scrollBarSuperiorRef = useRef(null);
  const conteudoPrincipalRef = useRef(null);

  const [filtros, setFiltros] = useState({ categoria: "", horario: { start: "", end: "", period: "" }, palavrasChave: "" });

  // Scroll horizontal com a roda do mouse sobre a timeline
  useEffect(() => {
    const el = conteudoPrincipalRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  // Sensores configurados para não bugar cliques simples
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const cardsFiltrados = useMemo(() => {
    return filtrarAtividades(filtros);
  }, [filtros]);

  const horarios = useMemo(() => Array.from({ length: TOTAL_BLOCOS }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, "0");
    const m = i % 2 === 0 ? "00" : "30";
    return `${h}:${m}`;
  }), []);

  const handleResize = (id, newDuration) => {
    setAtividades(prev => {
      const act = prev.find(a => a.id === id);
      if (!act) return prev;

      // 1. Limite da timeline: slot + duration <= TOTAL_BLOCOS
      const maxTimelineDuration = TOTAL_BLOCOS - act.slot;

      // 2. Limite contra colisão com outras atividades à direita (ignorando a si mesma)
      let maxCollisionDuration = maxTimelineDuration;
      prev.forEach(other => {
        if (other.id !== id && other.slot > act.slot) {
          maxCollisionDuration = Math.min(maxCollisionDuration, other.slot - act.slot);
        }
      });

      const finalDuration = Math.max(1, Math.min(newDuration, maxCollisionDuration));

      return prev.map(a => a.id === id ? { ...a, duration: finalDuration } : a);
    });
  };

  const handleDragStart = (event) => {
    setActiveItem(event.active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    // Lixeira: remove o card da timeline
    if (over.id === 'trash-zone') {
      setAtividades(prev => prev.filter(a => a.id !== active.id));
      return;
    }

    const targetSlot = over.data.current?.slot;
    if (targetSlot === undefined) return;

    const duration = active.data.current?.duration || 1;

    // Regra de limite da timeline
    if (targetSlot + duration > TOTAL_BLOCOS) return;

    // Regra de colisão: Verifica se o intervalo de slots [targetSlot, targetSlot + duration - 1] overlap com outras atividades
    const hasCollision = atividades.some(a => {
      if (a.id === active.id) return false;
      const aStart = a.slot;
      const aEnd = a.slot + (a.duration || 1) - 1;
      const targetStart = targetSlot;
      const targetEnd = targetSlot + duration - 1;
      return targetStart <= aEnd && aStart <= targetEnd;
    });

    if (hasCollision) return;

    if (active.data.current.type === 'template') {
      const origem = active.data.current;
      const nova = {
        ...origem,
        atividadeId: origem.id,
        id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        slot: targetSlot,
        duration: 1, // Toda atividade iniciada deve ter duração 1
      };
      setAtividades(prev => [...prev, nova]);
    } else {
      setAtividades(prev => prev.map(a => a.id === active.id ? { ...a, slot: targetSlot } : a));
    }
  };

  const handleScroll = (e) => {
    const target = e.currentTarget === scrollBarSuperiorRef.current
      ? conteudoPrincipalRef.current
      : scrollBarSuperiorRef.current;
    if (target) target.scrollLeft = e.currentTarget.scrollLeft;

    // Força re-render durante drag para o dnd-kit recalcular os rects dos droppables
    if (activeItem) {
      forceUpdate(c => c + 1);
    }
  };

  const handleFechar = () => {
    onClose?.();
  };

  const handleContinuar = () => {
    setAtividadesCtx(atividades);
    onContinuar?.();
  };

  return (
    <div className="overlay" onClick={handleFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <TitleBar
          title="Criar Plano"
          showEdit={false}
          showSend={false}
          showFavorite={false}
          showClose={true}
          onClose={handleFechar}
        />

        <div className="modal-scroll">
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            measuring={measuring}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="linha_do_tempo">

            {/* Scroll Superior */}
            <div className="scroll_topo_sync" ref={scrollBarSuperiorRef} onScroll={handleScroll}>
              <div style={{ width: `${TOTAL_BLOCOS * PIXELS_POR_BLOCO}px`, height: "1px" }} />
            </div>

            {/* Timeline Wrapper */}
            <div className="scroll_wrapper_principal" ref={conteudoPrincipalRef} onScroll={handleScroll}>

              {/* Horários */}
              <div className="horarios" style={{ width: `${TOTAL_BLOCOS * PIXELS_POR_BLOCO}px`, display: 'flex' }}>
                {horarios.map((h, i) => (
                  <div key={i} className="horario-label" style={{ width: PIXELS_POR_BLOCO, flexShrink: 0, textAlign: 'center' }}>
                    {h}
                  </div>
                ))}
              </div>

              {/* Área de Drop e Cards */}
              <div className="socket-container" style={{ width: `${TOTAL_BLOCOS * PIXELS_POR_BLOCO}px`, position: 'relative', height: '220px' }}>

                {/* Slots invisíveis que detectam o drop */}
                <div className="slots-grid" style={{ display: 'flex', position: 'absolute', inset: 0 }}>
                  {Array.from({ length: TOTAL_BLOCOS }).map((_, i) => (
                    <TimelineSlot key={i} index={i} />
                  ))}
                </div>

                {/* Cards renderizados por cima dos slots */}
                {atividades.map((atv) => (
                  <DraggableCard
                    key={atv.id}
                    atividade={atv}
                    onRemove={(id) => setAtividades(prev => prev.filter(a => a.id !== id))}
                    onResize={handleResize}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Barra de Pesquisa e Botão Continuar */}
          <div className="pesquisa_e_criar">
            <SearchBar 
              onCategoryChange={(cat) => setFiltros(prev => ({ ...prev, categoria: cat }))}
              onTimeChange={(time) => setFiltros(prev => ({ ...prev, horario: time }))}
              onKeywordChange={(key) => setFiltros(prev => ({ ...prev, palavrasChave: key }))}
            />
            <BotaoLantejoula 
              texto="Continuar" 
              desativado={desativado || atividades.length === 0}
              onClick={handleContinuar}
            />
          </div>

          <div className="parte_inferior_wrapper">
            {activeItem?.type === 'timeline' ? (
              <div className="lixeira-container">
                <TrashZone />
              </div>
            ) : (
              <div className="carrossel-wrapper">
                <CarrosselDeAtividades
                  titulo="Populares"
                  atividades={cardsFiltrados}
                  renderItem={(card) => <TemplateCard card={card} />}
                />
              </div>
            )}
          </div>

          <DragOverlay modifiers={[restrictToWindowEdges]} zIndex={1100}>
            {activeItem ? (
              <div className="drag-overlay-preview">
                {activeItem.type === "timeline" ? (
                  <CardTimeline
                    atividade={activeItem}
                    width={(activeItem.duration || 1) * PIXELS_POR_BLOCO}
                    PIXELS_POR_BLOCO={PIXELS_POR_BLOCO}
                  />
                ) : (
                  <CardAtividade {...activeItem} interativo={false} />
                )}
              </div>
            ) : null}
          </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

export default ModalLinhaDoTempo;