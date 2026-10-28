import { LuGripVertical } from "react-icons/lu";
import { useResizeWidth } from "./useResizeWidth";
import TimelineResizeHandle from "./TimelineResizeHandle";
import "./CardTimeline4.css";

const DEFAULT_WIDTH = 620;
const MIN_WIDTH = 320;

function CardTimeline4() {
  const { width, resizeHandleProps } = useResizeWidth(DEFAULT_WIDTH, MIN_WIDTH);

  return (
    <div className="cardTimeline4" style={{ width }}>
      <TimelineResizeHandle resizeHandleProps={resizeHandleProps} />
      <div className="cardTimeline4-left">
        <LuGripVertical className="iconDots" aria-hidden="true" />
      </div>
      <div className="cardTimeline4-content">
        <div className="cardTimeline4-top">
          <span>17 - 17</span>
        </div>
        <a href="/">saber mais</a>
      </div>
    </div>
  );
}

export default CardTimeline4;
