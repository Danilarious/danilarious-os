// src/apps/CanvasApp/components/KonvaCanvas.jsx
import { useRef, useEffect, useState, forwardRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import { useCanvasStore } from '../hooks/useCanvasStore';
import useImage from 'use-image';

// Component for a single canvas element
function CanvasElement({ element, isSelected, onSelect, onChange }) {
  const shapeRef = useRef();
  const [image] = useImage(element.assetSrc);

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      // Attach transformer when selected
      shapeRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <KonvaImage
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
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
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
    />
  );
}

// Transformer component for selected element
function TransformerComponent({ selectedId }) {
  const transformerRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = transformerRef.current.getStage();
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        setSelectedNode(selectedNode);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedId]);

  return <Transformer ref={transformerRef} />;
}

export const KonvaCanvas = forwardRef(({ width, height }, ref) => {
  const { elements, selectedId, selectElement, updateElement, deselectElement } =
    useCanvasStore();

  // Sort elements by zIndex for proper rendering order
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  const checkDeselect = (e) => {
    // Deselect when clicking on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      deselectElement();
    }
  };

  return (
    <div className="border-2 border-black bg-white">
      <Stage
        ref={ref}
        width={width}
        height={height}
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
              onChange={(updates) => updateElement(element.id, updates)}
            />
          ))}
          <TransformerComponent selectedId={selectedId} />
        </Layer>
      </Stage>
    </div>
  );
});
