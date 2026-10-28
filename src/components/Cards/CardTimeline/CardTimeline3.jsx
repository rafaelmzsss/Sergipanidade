import TimelineResizeHandle from "./TimelineResizeHandle";
import "./CardTimeline3.css";

function CardTimeline3({ width, resizeHandleProps, atividade, timeRange }) {
  return (
    <div className="cardTimeline3" style={{ width }}>
      <TimelineResizeHandle resizeHandleProps={resizeHandleProps} />
      <div className="cardTimeline3-left">
        {(atividade.imagem || atividade.thumbnail || (atividade.imagens && atividade.imagens[0])) && (
          <img
            src={atividade.imagem || atividade.thumbnail || (atividade.imagens && atividade.imagens[0])}
            alt={atividade.titulo}
            className="card-timeline-img-cover"
          />
        )}
      </div>
      <div className="cardTimeline3-content">
        <div className="cardTimeline3-row-top">
          <h4 className="cardTimeline-title">
            {atividade.titulo}
          </h4>
          <div className="topContent">
            <span>{timeRange}</span>
          </div>
        </div>
        <div className="cardTimeline3-row-bottom">
          <a href="/" onClick={(e) => e.preventDefault()}>saber mais</a>
        </div>
      </div>
    </div>
  );
}

export default CardTimeline3;
