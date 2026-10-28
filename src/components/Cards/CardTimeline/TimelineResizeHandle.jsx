import "./timelineResize.css";

function TimelineResizeHandle({ resizeHandleProps, className = "" }) {
  const classes = ["timeline-resize-handle", className].filter(Boolean).join(" ");

  return <div className={classes} {...resizeHandleProps} />;
}

export default TimelineResizeHandle;
