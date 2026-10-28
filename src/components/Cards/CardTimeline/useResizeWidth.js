import { useCallback, useRef, useState } from "react";

export function useResizeWidth(defaultWidth, minWidth) {
  const [width, setWidth] = useState(defaultWidth);
  const startXRef = useRef(0);
  const startWidthRef = useRef(defaultWidth);

  const handlePointerDown = useCallback(
    (event) => {
      event.preventDefault();
      startXRef.current = event.clientX;
      startWidthRef.current = width;

      const handlePointerMove = (moveEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        setWidth(Math.max(minWidth, startWidthRef.current + delta));
      };

      const handlePointerUp = () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    },
    [width, minWidth]
  );

  return {
    width,
    resizeHandleProps: {
      onPointerDown: handlePointerDown,
      role: "separator",
      "aria-orientation": "vertical",
      "aria-valuenow": width,
    },
  };
}
