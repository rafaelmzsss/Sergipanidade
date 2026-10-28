import TimelineResizeHandle from "./TimelineResizeHandle";
import "./CardTimeline2.css";

function CardTimeline2({ width, resizeHandleProps, atividade, timeRange }) {
  return (
    <div className="cardTimeline2" style={{ width }}>
      <TimelineResizeHandle resizeHandleProps={resizeHandleProps} />
      <div className="cardTimeline2-left">
        {(atividade.imagem || atividade.thumbnail || (atividade.imagens && atividade.imagens[0])) && (
          <img
            src={atividade.imagem || atividade.thumbnail || (atividade.imagens && atividade.imagens[0])}
            alt={atividade.titulo}
            className="card-timeline-img-cover"
          />
        )}
      </div>
      <div className="cardTimeline2-content">
        <div className="cardTimeline2-info">
          <h4 className="cardTimeline-title">
            {atividade.titulo}
          </h4>
        </div>
        <div className="bottomInfos">
          <span>{timeRange}</span>
          <a href="/" onClick={(e) => e.preventDefault()}>saber mais</a>
        </div>
      </div>
    </div>
  );
}

export default CardTimeline2;
