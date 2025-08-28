// File: components/elements/QRCodeElement.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Group, Rect, Image } from 'react-konva';
import type { PermisElement } from './types';
import * as QRCode from 'qrcode';
import useImage from 'use-image';

interface QRCodeElementProps {
  element: PermisElement;
  isSelected: boolean;
  zoom: number;
  onClickElement: (e: any) => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
}

export const QRCodeElement: React.FC<QRCodeElementProps> = ({ 
  element, 
  isSelected, 
  zoom, 
  onClickElement, 
  onDragEnd, 
  onTransformEnd 
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [image] = useImage(qrDataUrl || '');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        if (element.qrData) {
          const dataUrl = await QRCode.toDataURL(element.qrData, {
            width: 400,
            margin: 4,
            errorCorrectionLevel: 'Q',
            color: {
              dark: '#000000FF',
              light: '#FFFFFFFF'
            }
          });
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        console.error("Failed to generate QR code", error);
      }
    };

    generateQRCode();
  }, [element.qrData]);

  return (
    <Group
      x={element.x * zoom}
      y={element.y * zoom}
      width={element.width! * zoom}
      height={element.height! * zoom}
      draggable={element.draggable}
      onDragEnd={onDragEnd}
      onClick={onClickElement}
      onTap={onClickElement}
      onTransformEnd={onTransformEnd}
      scaleX={element.scaleX || 1}
      scaleY={element.scaleY || 1}
      rotation={element.rotation || 0}
      opacity={element.opacity || 1}
      id={element.id}
    >
      <Rect
        width={element.width! * zoom}
        height={element.height! * zoom}
        fill="#ffffff"
        stroke={isSelected ? '#3498db' : 'transparent'}
        strokeWidth={isSelected ? 2 : 0}
      />
      {image && (
        <Image
          image={image}
          width={element.width! * zoom}
          height={element.height! * zoom}
          perfectDrawEnabled={false}
          listening={false}
        />
      )}
    </Group>
  );
};