// src/apps/CanvasApp/components/KonvaCanvas.jsx
import { useRef, useEffect, forwardRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import { useCanvasStore } from '../hooks/useCanvasStore';
import useImage from 'use-image';

// Component for a single canvas element
function CanvasElement({ element, isSelected, onSelect, onChange }) {
  const shapeRef = useRef();
  const [image] = useImage(element.assetSrc);
  const HIT_PADDING = 12;
  const snapToGrid = useCanvasStore((s) => s.snapToGrid);
  const gridSize = useCanvasStore((s) => s.gridSize);
  const recordSnapshot = useCanvasStore((s) => s.recordSnapshot);

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // Attach transformer when selected
      shapeRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <KonvaImage
      id={element.id}
      ref={shapeRef}
      image={image}
      x={element.x}
      y={element.y}
      rotation={element.rotation}
      scaleX={element.scale}
      scaleY={element.scale}
      offsetX={image ? image.width / 2 : 0}
      offsetY={image ? image.height / 2 : 0}
      draggable
      onMouseDown={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
        recordSnapshot();
        onSelect();
      }}
      dragBoundFunc={(pos) => {
        if (!snapToGrid || gridSize <= 4) return pos;
        const snap = (val) => Math.round(val / gridSize) * gridSize;
        return { x: snap(pos.x), y: snap(pos.y) };
      }}
      onDragMove={(e) => {
        const nextX = e.target.x();
        const nextY = e.target.y();
        onChange({ x: nextX, y: nextY }, { recordHistory: false });
      }}
      onDragEnd={(e) => {
        const nextX = e.target.x();
        const nextY = e.target.y();
        onChange({
          x: nextX,
          y: nextY,
        }, { recordHistory: false });
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        onChange({
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          scale: (scaleX + scaleY) / 2, // Average scale
        });
      }}
      hitFunc={(ctx, shape) => {
        const w = image ? image.width : 20;
        const h = image ? image.height : 20;
        ctx.beginPath();
        ctx.rect(-w / 2 - HIT_PADDING, -h / 2 - HIT_PADDING, w + HIT_PADDING * 2, h + HIT_PADDING * 2);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}

// Transformer component for selected element
function TransformerComponent({ selectedId }) {
  const transformerRef = useRef();

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = transformerRef.current.getStage();
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId]);

  return (
    <Transformer
      ref={transformerRef}
      rotateEnabled
      rotateAnchorOffset={30}
      anchorSize={10}
      borderStroke="#000000"
      borderStrokeWidth={1}
      anchorFill="#ffffff"
      anchorStroke="#000000"
      anchorStrokeWidth={1}
      enabledAnchors={[
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
        'middle-left',
        'middle-right',
        'top-center',
        'bottom-center',
      ]}
      hitStrokeWidth={4}
      ignoreStroke={false}
    />
  );
}

export const KonvaCanvas = forwardRef(
  ({ width, height, variant = 'window' }, ref) => {
    const {
      elements,
      selectedId,
      selectElement,
      updateElement,
      deselectElement,
      hueShift,
      snapToGrid,
      gridSize,
    } = useCanvasStore();

    // Sort elements by zIndex for proper rendering order
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    const checkDeselect = (e) => {
      // Deselect when clicking on empty area
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        deselectElement();
      }
    };

    // Force redraw when element list updates to avoid stale selection visuals
    useEffect(() => {
      if (ref?.current) {
        ref.current.batchDraw();
      }
    }, [sortedElements, ref]);

    const wrapperClasses =
      variant === 'mode'
        ? 'w-full h-full'
        : 'border-2 border-black bg-white shadow-[2px_2px_0_rgba(0,0,0,0.6)]';

    return (
      <div
        className={wrapperClasses}
        style={{ filter: `hue-rotate(${hueShift}deg)` }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Stage
          ref={ref}
          width={width}
          height={height}
          dragDistance={0}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            {sortedElements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                isSelected={element.id === selectedId}
                onSelect={() => selectElement(element.id)}
                onChange={(updates, opts) =>
                  updateElement(element.id, updates, opts)
                }
              />
            ))}
            <TransformerComponent selectedId={selectedId} />
          </Layer>
        </Stage>
      </div>
    );
  }
);
