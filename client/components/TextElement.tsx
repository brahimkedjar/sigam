// =============================================================
// File: components/elements/TextElement.tsx
// =============================================================
import React, { useEffect, useRef, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type { PermisElement } from './types';

interface TextElementProps {
  element: PermisElement;
  isSelected: boolean;
  zoom: number;
  onClickElement: (e: any) => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
  onDblClickText: () => void;
}

export const TextElement: React.FC<TextElementProps> = ({
  element, isSelected, zoom, onClickElement, onDragEnd, onTransformEnd, onDblClickText
}) => {
  const textNodeRef = useRef<any>(null);
  const [textBounds, setTextBounds] = useState({ width: element.width || 240, height: element.height || 40 });

  // Update bounds whenever text or style changes
  useEffect(() => {
    if (textNodeRef.current) {
      const box = textNodeRef.current.getClientRect();
      setTextBounds({
        width: box.width,
        height: box.height,
      });
    }
  }, [
    element.text,
    element.fontSize,
    element.fontFamily,
    element.padding,
    element.lineHeight,
    element.letterSpacing,
    element.wrap,
  ]);

  useEffect(() => {
    console.log('Rendering text element:', {
      id: element.id,
      text: element.text,
      type: element.type,
      isArticle: element.isArticle
    });
  }, [element]);

  const common = {
    id: element.id,
    x: element.x,
    y: element.y,
    width: textBounds.width,
    height: textBounds.height,
    rotation: element.rotation || 0,
    draggable: element.draggable,
    onClick: onClickElement,
    onTap: onClickElement,
    onDragEnd,
    onTransformEnd,
    opacity: element.opacity || 1,
  } as any;

  return (
    <Group {...common}>
      {isSelected && (
        <Rect
          x={0}
          y={0}
          width={textBounds.width}
          height={textBounds.height}
          fill="rgba(52, 152, 219, 0.1)"
          stroke="#3498db"
          strokeWidth={1}
        />
      )}
      <Text
        ref={textNodeRef}
        id={element.id}
        x={0}
        y={0}
        text={element.text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fill={element.color}
        padding={element.padding}
        align={element.textAlign}
        verticalAlign={element.verticalAlign}
        letterSpacing={element.letterSpacing}
        lineHeight={element.lineHeight}
        wrap={element.wrap}
        ellipsis={element.ellipsis}
        onDblClick={onDblClickText}
      />
    </Group>
  );
};
