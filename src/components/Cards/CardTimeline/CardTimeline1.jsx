import TimelineResizeHandle from "./TimelineResizeHandle";
import "./CardTimeline1.css";

function CardTimeline1({ width, resizeHandleProps, atividade }) {
  return (
    <div className="card-timeline1" style={{ width }}>
      <TimelineResizeHandle
        resizeHandleProps={resizeHandleProps}
        className="card-timeline1__resize-handle"
      />
      <div className="logo-container">
        {(atividade.imagem || atividade.thumbnail || (atividade.imagens && atividade.imagens[0])) && (
          <img
            src={atividade.imagem || atividade.thumbnail || (atividade.imagens && atividade.imagens[0])}
            alt={atividade.titulo}
            className="card-timeline-img-cover"
          />
        )}
      </div>
    </div>
  );
}

export default CardTimeline1;
