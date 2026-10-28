import CardTimeline1 from "./CardTimeline1";
import CardTimeline2 from "./CardTimeline2";
import CardTimeline3 from "./CardTimeline3";

function CardTimeline({ atividade, width, onResize, PIXELS_POR_BLOCO = 100 }) {
  const duration = atividade.duration || 1;

  // Formatar horário de início e fim
  const getFormattedTime = (slot, dur) => {
    if (slot === undefined || slot === null) return "00:00";
    const startHour = Math.floor(slot / 2);
    const startMin = slot % 2 === 0 ? "00" : "30";
    const endSlot = slot + dur;
    const endHour = Math.floor(endSlot / 2);
    const endMin = endSlot % 2 === 0 ? "00" : "30";
    return `${startHour.toString().padStart(2, "0")}:${startMin} - ${endHour.toString().padStart(2, "0")}:${endMin}`;
  };

  const timeRange = getFormattedTime(atividade.slot, duration);

  // Manipulador para o resize handle
  const handlePointerDown = (event) => {
    event.stopPropagation(); // Impede o drag-and-drop do dnd-kit
    event.preventDefault();

    const startX = event.clientX;
    const startDuration = duration;

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaBlocks = Math.round(deltaX / PIXELS_POR_BLOCO);
      const newDuration = Math.max(1, startDuration + deltaBlocks);
      if (onResize) {
        onResize(atividade.id, newDuration);
      }
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  const resizeHandleProps = {
    onPointerDown: handlePointerDown,
    role: "separator",
    "aria-orientation": "vertical",
    "aria-valuenow": width,
  };

  // Selecionar o layout adequado com base na duração
  if (duration <= 2) {
    return (
      <CardTimeline1
        width={width}
        resizeHandleProps={resizeHandleProps}
        atividade={atividade}
        timeRange={timeRange}
      />
    );
  } else if (duration === 3 || duration === 4) {
    return (
      <CardTimeline2
        width={width}
        resizeHandleProps={resizeHandleProps}
        atividade={atividade}
        timeRange={timeRange}
      />
    );
  } else {
    return (
      <CardTimeline3
        width={width}
        resizeHandleProps={resizeHandleProps}
        atividade={atividade}
        timeRange={timeRange}
      />
    );
  }
}

export default CardTimeline;
