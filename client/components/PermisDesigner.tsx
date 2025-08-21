// File: components/PermisDesigner.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Transformer } from 'react-konva';
import {
  FiDownload, FiSave, FiEdit2, FiMove, FiType,
  FiTrash2, FiCopy, FiLayers, FiChevronLeft, FiChevronRight, FiGrid,
  FiChevronUp,
  FiChevronDown,
  FiRefreshCw
} from 'react-icons/fi';
import { BsTextParagraph, BsImage, BsBorderWidth } from 'react-icons/bs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ElementRenderer } from './ElementRenderer';
import type { PermisElement, PermisDesignerProps, TextEditOverlay, ArticleItem } from './types';
import { ArticlesPanel } from './ArticlesPanel';
import { loadArticlesForPermit, toArticleElements } from './articleLoader';
import { FONT_FAMILIES, ARABIC_FONTS, DEFAULT_CANVAS } from './constants';
import { gridBackground, clamp } from './layout';

import styles from './PermisDesigner.module.css';
import jsPDF from 'jspdf';

// Constants
const PAGES = {
  GENERAL: 0,
  COORDS: 1,
  ARTICLES: 2,
} as const;

type PagesTuple = [PermisElement[], PermisElement[], PermisElement[]];

const PermisDesigner: React.FC<PermisDesignerProps> = ({ initialData, onSave, onGeneratePdf, onSavePermis }) => {
  // ---------- state ----------
  const [pages, setPages] = useState<PagesTuple>([[], [], []]);
  const [currentPage, setCurrentPage] = useState<number>(PAGES.GENERAL);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tool, setTool] = useState<'select' | 'text' | 'rectangle' | 'image' | 'line'>('select');
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState<PagesTuple[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [selectedArticleIds, setSelectedArticleIds] = useState<string[]>([]);
  const [textOverlay, setTextOverlay] = useState<TextEditOverlay | null>(null);
  const apiURL = process.env.NEXT_PUBLIC_API_URL;
  const [canvasSize, setCanvasSize] = useState({
  width: DEFAULT_CANVAS.width,
  height: DEFAULT_CANVAS.height
});
  function filterElementsByPage(elements: PermisElement[], pageIndex: number): PermisElement[] {
  if (!elements || !elements.length) return [];
  return elements.filter(el => el.meta?.pageIndex === pageIndex);
}

const handleResizeCanvas = useCallback((direction: 'width' | 'height', amount: number) => {
  setCanvasSize(prev => {
    const newSize = {
      width: direction === 'width' ? Math.max(prev.width + amount, 300) : prev.width,
      height: direction === 'height' ? Math.max(prev.height + amount, 300) : prev.height
    };
    
    // Update all elements' positions if they would be outside the new bounds
    setPages(prev => {
      const newPages = [...prev] as PagesTuple;
      newPages[currentPage] = newPages[currentPage].map(el => ({
        ...el,
        x: Math.min(el.x, newSize.width - (el.width || 50)),
        y: Math.min(el.y, newSize.height - (el.height || 50))
      }));
      return newPages;
    });
    
    return newSize;
  });
}, [currentPage]);

const handleResetCanvasSize = useCallback(() => {
  setCanvasSize({
    width: DEFAULT_CANVAS.width,
    height: DEFAULT_CANVAS.height
  });
}, []);

function createPageBorder(): PermisElement[] {
  const borderColor = '#1a5276';
  const borderWidth = 2;
  const dashPattern = [0.8, 0.4];
  
  return [
    // Outer dashed border - now uses canvasSize instead of DEFAULT_CANVAS
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 20,
      y: 10,
      width: canvasSize.width - 40,
      height: canvasSize.height - 40,
      stroke: borderColor,
      strokeWidth: borderWidth,
      fill: 'transparent',
      dash: dashPattern,
      draggable: false
    },
    // Inner solid border
    {
      id: uuidv4(),
      type: 'rectangle',
      x: 30,
      y: 20,
      width: canvasSize.width - 60,
      height: canvasSize.height - 60,
      stroke: borderColor,
      strokeWidth: 1,
      fill: 'transparent',
      draggable: false,
      opacity: 0.6
    },
    // Corner decorations (updated to use canvasSize)
    ...createCornerDecorations(borderColor)
  ];
}

function createCornerDecorations(color: string): PermisElement[] {
  const size = 30;
  return [
    // Top-left
    {
      id: uuidv4(),
      type: 'line',
      x: 40,
      y: 40,
      points: [0, 0, size, size],
      stroke: color,
      strokeWidth: 2,
      dash: [5, 3],
      draggable: false
    },
    // Top-right
    {
      id: uuidv4(),
      type: 'line',
      x: canvasSize.width - 40,
      y: 40,
      points: [0, 0, -size, size],
      stroke: color,
      strokeWidth: 2,
      dash: [5, 3],
      draggable: false
    },
    // Bottom-left
    {
      id: uuidv4(),
      type: 'line',
      x: 40,
      y: canvasSize.height - 40,
      points: [0, 0, size, -size],
      stroke: color,
      strokeWidth: 2,
      dash: [5, 3],
      draggable: false
    },
    // Bottom-right
    {
      id: uuidv4(),
      type: 'line',
      x: canvasSize.width - 40,
      y: canvasSize.height - 40,
      points: [0, 0, -size, -size],
      stroke: color,
      strokeWidth: 2,
      dash: [5, 3],
      draggable: false
    }
  ];
}
  // ---------- init: templates + articles + pages ----------
  useEffect(() => {
  let mounted = true;
  const load = async () => {
    if (!initialData) return;
    try {
      const resp = await axios.get(`${apiURL}/api/permis/templates?permisId=${initialData.code_demande}`);
      const serverTemplates = Array.isArray(resp.data) ? resp.data : resp.data?.data ?? [];
      if (!mounted) return;
      
      setTemplates(serverTemplates);
      
      // Try to find the last used template or default to first one
      const lastUsedTemplateId = localStorage.getItem(`lastTemplate_${initialData.code_demande}`);
      const defaultTemplate = serverTemplates.find((t: { id: string | null; }) => t.id === lastUsedTemplateId) || serverTemplates[0];
      setActiveTemplate(defaultTemplate?.id ?? null);

      // Build pages from the selected template or create default ones
      const buildPages = (template?: typeof defaultTemplate): PagesTuple => {
        if (!template?.elements?.length) {
          return [
            createDefaultGeneralPage(initialData),
            createCoordsPage(initialData),
            createArticlesPageHeader(),
          ];
        }

        return [
          filterElementsByPage(template.elements, 0) || createDefaultGeneralPage(initialData),
          filterElementsByPage(template.elements, 1) || createCoordsPage(initialData),
          filterElementsByPage(template.elements, 2) || createArticlesPageHeader(),
        ];
      };

      const initialPages = buildPages(defaultTemplate);
      
      // Load articles and update articles page if needed
      const loadedArticles = await loadArticlesForPermit(initialData);
      setArticles(loadedArticles);
      const preselected = loadedArticles.filter(a => a.preselected).map(a => a.id);
      setSelectedArticleIds(preselected);

      if (preselected.length) {
        const articlesPage = [
          ...initialPages[PAGES.ARTICLES],
          ...toArticleElements({
            articleIds: preselected,
            articles: loadedArticles,
            yStart: 200,
            x: 80,
            width: 640,
            fontFamily: ARABIC_FONTS[0],
          }),
        ];
        initialPages[PAGES.ARTICLES] = JSON.parse(JSON.stringify(articlesPage));
      }

      setPages(JSON.parse(JSON.stringify(initialPages)));
      pushHistory(JSON.parse(JSON.stringify(initialPages)));

    } catch (err) {
      console.error('Init error', err);
      const fallback: PagesTuple = [
        createDefaultGeneralPage(initialData),
        createCoordsPage(initialData),
        createArticlesPageHeader(),
      ];
      setPages(fallback);
      pushHistory(fallback);
      loadArticlesForPermit(initialData).then(a => setArticles(a)).catch(() => {});
    }
  };
  load();
  return () => { mounted = false; };
}, [initialData]);

  // ---------- sync transformer ----------
  useEffect(() => {
    if (!transformerRef.current) return;
    if (selectedIds.length > 0) {
      const nodes = selectedIds.map(id => stageRef.current?.findOne(`#${id}`)).filter(Boolean);
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, currentPage, pages]);

  // ---------- keyboard shortcuts ----------
  useHotkeys('delete', () => handleDeleteSelected(), [pages, currentPage, selectedIds]);
  useHotkeys('ctrl+z, cmd+z', () => undo(), [history, historyIndex]);
  useHotkeys('ctrl+y, cmd+y', () => redo(), [history, historyIndex]);
  useHotkeys('ctrl+c, cmd+c', () => handleCopySelected(), [pages, currentPage, selectedIds]);
  useHotkeys('ctrl+v, cmd+v', () => handlePasteSelected(), [pages, currentPage]);
  useHotkeys('esc', () => setTextOverlay(null), []);

  // ---------- history helpers ----------
  const pushHistory = useCallback((snap: PagesTuple) => {
  setHistory(prev => {
    const trimmed = prev.slice(0, historyIndex + 1);
    // deep copy here
    const next = [...trimmed, JSON.parse(JSON.stringify(snap)) as PagesTuple];
    setHistoryIndex(next.length - 1);
    return next;
  });
}, [historyIndex]);


  const undo = useCallback(() => {
    setHistoryIndex(idx => {
      if (idx > 0) {
        setPages(history[idx - 1]);
        setSelectedIds([]);
        return idx - 1;
      }
      return idx;
    });
  }, [history]);

  const redo = useCallback(() => {
    setHistoryIndex(idx => {
      if (idx < history.length - 1) {
        setPages(history[idx + 1]);
        setSelectedIds([]);
        return idx + 1;
      }
      return idx;
    });
  }, [history]);

  // ---------- page builders (kept logic, small tidy) ----------
  function createDefaultGeneralPage(data: any): PermisElement[] {
  const borderElements = createPageBorder();
  const contentElements: PermisElement[] = [
      // Header AR
      
     {
      id: uuidv4(), type: 'line', x: 780, y: 20, width: 0, height: 360,
      stroke: '#000000', strokeWidth: 1, dash: [5, 5], draggable: true, opacity: 1, rotation: 0
    },

    // Republic AR (Top center)
    {
      id: uuidv4(), type: 'text', x: 300, y: 30, width: 700,
      text: 'الجمهورية الجزائرية الديمقراطية الشعبية',
      language: 'ar', direction: 'rtl',
      fontSize: 18, fontFamily: ARABIC_FONTS[0], color: '#000000', draggable: true,
      textAlign: 'center', opacity: 1, rotation: 0, wrap: 'word', lineHeight: 1.2
    },
    { id: uuidv4(), type: 'text', x: 180, y: 60, width: 400, text: 'RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE',
     fontSize: 16, fontFamily: 'Arial', color: '#000000', draggable: true, textAlign: 'center', opacity: 1, rotation: 0,
    padding:5 },
     {
      id: uuidv4(), type: 'line', x: 220, y: 95, width: 400, height: 2,
      stroke: '#000000', strokeWidth: 1, draggable: true, opacity: 1, rotation: 0
    },
    // Ministry FR (Below Republic, centered)
    {
      id: uuidv4(), type: 'text', x: 50, y: 130, width: 700,padding:15,
      text: 'MINISTERE DE L\'INDUSTRIE \n ET DES MINES',
      language: 'fr', direction: 'ltr',
      fontSize: 16, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true,
      textAlign: 'center', opacity: 1, rotation: 0, wrap: 'word', lineHeight: 1.2
    },
    // Ministry AR (Below Ministry FR, centered)
    {
      id: uuidv4(), type: 'text', x: 580, y: 150, width: 700,
      text: 'وزارة الصناعة و المناجم',
      language: 'ar', direction: 'rtl',
      fontSize: 20, fontFamily: ARABIC_FONTS[0], color: '#000000', draggable: true,
      textAlign: 'center', opacity: 1, rotation: 0, wrap: 'word', lineHeight: 1.2
    },
   
    // Agency FR (Below line, centered)
    {
      id: uuidv4(), type: 'text', x: 60, y: 240, width: 700,
      text: 'Agence Nationale \n des Activités Minières',
      language: 'fr', direction: 'ltr',
      fontSize: 20, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true,
      textAlign: 'center', opacity: 1, rotation: 0, wrap: 'word', lineHeight: 1.2
    },
    {
      id: uuidv4(), type: 'line', x: 50, y: 210, width: 700, height: 2,
      stroke: '#000000', strokeWidth: 1, draggable: true, opacity: 1, rotation: 0
    },
    
    // Agency AR (Below Agency FR, centered)
    {
      id: uuidv4(), type: 'text', x: 530, y: 250, width: 700,
      text: 'الوكالة الوطنية للنشاطات المنجمية',
      language: 'ar', direction: 'rtl',
      fontSize: 20, fontFamily: ARABIC_FONTS[0], color: '#000000', draggable: true,
      textAlign: 'center', opacity: 1, rotation: 0, wrap: 'word', lineHeight: 1.2
    },
    // Separator line 2 (After Agency)
    {
      id: uuidv4(), type: 'line', x: 50, y: 310, width: 700, height: 2,
      stroke: '#000000', strokeWidth: 1, draggable: true, opacity: 1, rotation: 0
    },
      // Title FR
      {
        id: uuidv4(), type: 'text', x: 270, y: 450, width: 640,
        text: `${data?.typePermis?.lib_type ?? 'PERMIS'}`,
        language: 'fr', direction: 'ltr',
        fontSize: 30, fontFamily: FONT_FAMILIES[0], color: '#1a5276', draggable: true,
        textAlign: 'center', opacity: 1, rotation: 0, wrap: 'word', lineHeight: 1.2
      },
      { id: uuidv4(), type: 'line', x: 130, y: 400, width: 540, height: 2, stroke: '#1a5276', strokeWidth: 2, draggable: true, opacity: 1, rotation: 0 },
      { id: uuidv4(), type: 'line', x: 130, y: 540, width: 540, height: 2, stroke: '#1a5276', strokeWidth: 2, draggable: true, opacity: 1, rotation: 0 },
      { id: uuidv4(), type: 'line', x: 130, y: 400, width: 140, height: 2, stroke: '#1a5276', strokeWidth: 2, draggable: true, opacity: 1, rotation: 90 },
      { id: uuidv4(), type: 'line', x: 670, y: 400, width: 140, height: 2, stroke: '#1a5276', strokeWidth: 2, draggable: true, opacity: 1, rotation: 90 },

       {
      id: uuidv4(), type: 'line', x: 50, y: 630, width: 700, height: 2,
      stroke: '#000000', strokeWidth: 1, draggable: true, opacity: 1, rotation: 0
    },
    {
      id: uuidv4(), type: 'line', x: 50, y: 760, width: 700, height: 2,
      stroke: '#000000', strokeWidth: 1, draggable: true, opacity: 1, rotation: 0
    },
{
  id: uuidv4(),
  type: 'text',
  x: 410,
  y: 680,
  width: 640,
  text: ': ترخيص منجمي رقم',
  fontSize: 30,
  fontFamily: FONT_FAMILIES[0],
  color: '#000000',
  draggable: true,
  opacity: 1,
  rotation: 0,
  textAlign: 'right',  // keep it right-aligned
  direction: 'rtl',    // force RTL
},

// Code part (aligned left)
{
  id: uuidv4(),
  type: 'text',
  x: 230,
  y: 680,
  width: 640,
  text: `${data?.code_demande ?? ''}`,
  fontSize: 30,
  fontFamily: FONT_FAMILIES[0],
  color: '#000000',
  draggable: true,
  opacity: 1,
  rotation: 0,
  textAlign: 'left',   // push left
  direction: 'ltr',    // keep LTR for numbers
},
      //{ id: uuidv4(), type: 'text', x: 80, y: 445, width: 640, text: `Type: ${data?.typePermis?.lib_type ?? ''}`, fontSize: 13, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true, opacity: 1, rotation: 0, textAlign: 'left' },
      //{ id: uuidv4(), type: 'text', x: 80, y: 470, width: 640, text: `Titulaire: ${data?.detenteur?.nom_sociétéFR ?? ''}`, fontSize: 13, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true, opacity: 1, rotation: 0, textAlign: 'left' },
      //{ id: uuidv4(), type: 'text', x: 80, y: 495, width: 640, text: `Localisation: ${data?.wilaya?.nom_wilaya ?? ''}, ${data?.daira?.nom_daira ?? ''}, ${data?.commune?.nom_commune ?? ''}`, fontSize: 13, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true, opacity: 1, rotation: 0, textAlign: 'left' },
      //{ id: uuidv4(), type: 'text', x: 80, y: 520, width: 640, text: `Superficie: ${data?.superficie ?? 0} ha`, fontSize: 13, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true, opacity: 1, rotation: 0, textAlign: 'left' },
      //{ id: uuidv4(), type: 'text', x: 80, y: 545, width: 640, text: `Durée: ${data?.typePermis?.duree_initiale ?? ''} ans`, fontSize: 13, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true, opacity: 1, rotation: 0, textAlign: 'left' },

      // Legal section header (Arabic) – page 1 just an intro text
      //{ id: uuidv4(), type: 'text', x: 80, y: 360, width: 640, text: 'ملخص عام للرخصة', language: 'ar', direction: 'rtl', fontSize: 17, fontFamily: ARABIC_FONTS[0], color: '#1a5276', draggable: true, opacity: 1, rotation: 0, textAlign: 'center' },

      // Footer
      { id: uuidv4(), type: 'text', x: 80, y: 880, width: 640, text: `Fait à Alger, le ${new Date().toLocaleDateString('fr-FR')}`, fontSize: 18, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true, opacity: 1, rotation: 0, textAlign: 'left' },
      { id: uuidv4(), type: 'text', x: 420, y: 910, width: 300, text: 'Le Ministre', fontSize: 17, fontFamily: FONT_FAMILIES[0], color: '#000000', draggable: true, opacity: 1, rotation: 0, textAlign: 'center' },
      { id: uuidv4(), type: 'line', x: 395, y: 935, width: 300, height: 2, stroke: '#000000', strokeWidth: 1, draggable: true, opacity: 1, rotation: 0 },
    ];
    return [...borderElements, ...contentElements];
  }

  function createCoordsPage(data: any): PermisElement[] {
  const borderElements = createPageBorder();
  const contentElements: PermisElement[] = [
    // Page title
    {
      id: uuidv4(),
      type: 'text',
      x: 80,
      y: 40,
      width: 640,
      text: 'إحداثيات حدود الرخصة',
      language: 'ar',
      direction: 'rtl',
      fontSize: 24,
      fontFamily: ARABIC_FONTS[0],
      color: '#1a5276',
      draggable: true,
      textAlign: 'center',
      opacity: 1,
      wrap: 'word',
      lineHeight: 1.3
    },
    // Separator line under title
    { 
      id: uuidv4(), 
      type: 'line', 
      x: 80, 
      y: 85, 
      width: 640, 
      height: 2, 
      stroke: '#1a5276', 
      strokeWidth: 2, 
      draggable: true, 
      opacity: 1 
    },
  ];

  const coordContainer = data?.procedure?.coordonnees ?? [];
  const coordinates = Array.isArray(coordContainer) ? coordContainer.map((c: any) => c.coordonnee).filter(Boolean) : [];

  let y = 110;
  const spacing = 32; // Bigger spacing

  if (coordinates.length === 0) {
    contentElements.push({
      id: uuidv4(),
      type: 'text',
      x: 80,
      y,
      width: 640,
      text: 'لا توجد إحداثيات متاحة.',
      language: 'ar',
      direction: 'rtl',
      fontSize: 16,
      fontFamily: ARABIC_FONTS[0],
      color: '#000',
      draggable: true,
      textAlign: 'center',
      lineHeight: 1.4,
      wrap: 'word'
    });
    return [...borderElements, ...contentElements];
  }

  // Column headers
  contentElements.push({
    id: uuidv4(),
    type: 'text',
    x: 80,
    y,
    width: 180,
    text: 'X',
    language: 'ar',
    direction: 'rtl',
    fontSize: 16,
    fontFamily: ARABIC_FONTS[0],
    color: '#000',
    draggable: false,
    textAlign: 'left'
  });
  contentElements.push({
    id: uuidv4(),
    type: 'text',
    x: 320,
    y,
    width: 180,
    text: 'Y',
    language: 'ar',
    direction: 'rtl',
    fontSize: 16,
    fontFamily: ARABIC_FONTS[0],
    color: '#000',
    draggable: false,
    textAlign: 'center'
  });
  contentElements.push({
    id: uuidv4(),
    type: 'text',
    x: 560,
    y,
    width: 180,
    text: 'Z',
    language: 'ar',
    direction: 'rtl',
    fontSize: 16,
    fontFamily: ARABIC_FONTS[0],
    color: '#000',
    draggable: false,
    textAlign: 'right'
  });

  y += spacing;

  // Add coordinates
  coordinates.forEach((coord: any) => {
    contentElements.push({
      id: uuidv4(),
      type: 'text',
      x: 80,
      y,
      width: 180,
      text: `${coord.x}`,
      language: 'ar',
      direction: 'rtl',
      fontSize: 14,
      fontFamily: ARABIC_FONTS[0],
      color: '#000',
      draggable: false,
      textAlign: 'left'
    });
    contentElements.push({
      id: uuidv4(),
      type: 'text',
      x: 320,
      y,
      width: 180,
      text: `${coord.y}`,
      language: 'ar',
      direction: 'rtl',
      fontSize: 14,
      fontFamily: ARABIC_FONTS[0],
      color: '#000',
      draggable: false,
      textAlign: 'center'
    });
    contentElements.push({
      id: uuidv4(),
      type: 'text',
      x: 560,
      y,
      width: 180,
      text: `${coord.z || 0}`,
      language: 'ar',
      direction: 'rtl',
      fontSize: 14,
      fontFamily: ARABIC_FONTS[0],
      color: '#000',
      draggable: false,
      textAlign: 'right'
    });
    y += spacing;
  });

  // Calculate position after coordinates
  const endOfCoordsY = y + 20; // Add some margin after last coordinate
  
  // Add horizontal line (0°) that extends to end of page
  contentElements.push({
    id: uuidv4(),
    type: 'line',
    x: 80, // Start from left margin
    y: endOfCoordsY,
    width: DEFAULT_CANVAS.width - 160, // Extend to right margin
    height: 2,
    stroke: '#1a5276',
    strokeWidth: 2,
    draggable: true,
    opacity: 1,
    rotation: 0
  });

  // Add 135° rotated line that starts at end of coordinates and extends to bottom right
  const rotatedLineLength = Math.sqrt(
    Math.pow(DEFAULT_CANVAS.width - 80, 2) + 
    Math.pow(DEFAULT_CANVAS.height - endOfCoordsY, 2)
  );
  
  contentElements.push({
    id: uuidv4(),
    type: 'line',
    x: 720, // Start from left margin
    y: endOfCoordsY+30,
    width: rotatedLineLength-80, // Length calculated to reach bottom right
    height: 2,
    stroke: '#000000',
    strokeWidth: 2,
    draggable: true,
    opacity: 1,
    rotation: 137 // 135° angle
  });

  return [...borderElements, ...contentElements];
}
function createArticlesPageHeader() {
  const borderElements = createPageBorder();
  const contentElements: PermisElement[] = [
    {
      id: uuidv4(), 
      type: 'text', 
      x: 80, 
      y: 40, 
      width: DEFAULT_CANVAS.width - 160,
      text: 'المواد القانونية المرفقة بالرخصة',
      language: 'ar', 
      direction: 'rtl',
      fontSize: 20, 
      fontFamily: ARABIC_FONTS[0], 
      color: '#1a5276', 
      draggable: true,
      textAlign: 'center', 
      opacity: 1, 
      rotation: 0, 
      wrap: 'word', 
      lineHeight: 1.3
    },
    { 
      id: uuidv4(), 
      type: 'line', 
      x: 80, 
      y: 80, 
      width: DEFAULT_CANVAS.width - 160, 
      height: 2, 
      stroke: '#1a5276', 
      strokeWidth: 2, 
      draggable: true, 
      opacity: 1, 
      rotation: 0 
    },
    // Vertical divider line
    {
      id: uuidv4(),
      type: 'line',
      x: DEFAULT_CANVAS.width / 2,
      y: 100,
      points: [0, 0, 0, DEFAULT_CANVAS.height - 120],
      stroke: '#1a5276',
      strokeWidth: 1,
      dash: [5, 3],
      draggable: false
    }
  ];
  return [...borderElements, ...contentElements];
}


  // ---------- page & element helpers ----------
 const elements = pages[currentPage];
  const setElementsForCurrent = useCallback((updater: (prev: PermisElement[]) => PermisElement[]) => {
    setPages(prev => {
      const next = [...prev] as PagesTuple;
      next[currentPage] = updater(prev[currentPage]);
      pushHistory(next);
      return next;
    });
  }, [currentPage, pushHistory]);


  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.currentTarget) {
      setSelectedIds([]);
      setTool('select');
      return;
    }
    const id = e.target.getAttr?.('id');
    if (id && elements.some(el => el.id === id)) {
      if (e.evt.shiftKey) setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
      else setSelectedIds([id]);
    }
  }, [elements]);

  const handleDragEnd = useCallback((e: any) => {
    const id = e.target.getAttr('id');
    const nx = clamp(e.target.x() / zoom, 0, DEFAULT_CANVAS.width - (e.target.width() / zoom));
    const ny = clamp(e.target.y() / zoom, 0, DEFAULT_CANVAS.height - (e.target.height() / zoom));
    setElementsForCurrent(prev => prev.map(el => (el.id === id ? { ...el, x: nx, y: ny } : el)));
  }, [zoom, setElementsForCurrent]);

  const handleTransformEnd = useCallback(() => {
    const nodes = transformerRef.current?.nodes?.() || [];
    setElementsForCurrent(prev => {
      const updated = [...prev];
      nodes.forEach((node: any) => {
        const id = node.getAttr('id');
        const i = updated.findIndex(el => el.id === id);
        if (i >= 0) {
          updated[i] = {
            ...updated[i],
            x: node.x() / zoom,
            y: node.y() / zoom,
            width: (node.width() * node.scaleX()) / zoom,
            height: (node.height() * node.scaleY()) / zoom,
            rotation: node.rotation(),
          } as PermisElement;
        }
        node.scaleX(1);
        node.scaleY(1);
      });
      return updated;
    });
  }, [zoom, setElementsForCurrent]);

  const handleTextChange = useCallback((id: string, newText: string) => {
    setElementsForCurrent(prev => prev.map(el => (el.id === id && el.type === 'text' ? { ...el, text: newText } : el)));
  }, [setElementsForCurrent]);

  const handleAddElement = useCallback((type: 'text' | 'rectangle' | 'image' | 'line') => {
    const newElement: PermisElement = {
      id: uuidv4(),
      pageIndex: currentPage,
      type,
      x: 100 / zoom,
      y: 100 / zoom,
      width: type === 'text' ? 240 : type === 'line' ? 150 : 120,
      height: type === 'text' ? 36 : type === 'line' ? 2 : 60,
      text: type === 'text' ? (currentPage === PAGES.ARTICLES ? 'نص مادة' : 'نص جديد') : undefined,
      language: type === 'text' ? (currentPage === PAGES.ARTICLES ? 'ar' : 'fr') : undefined,
      direction: type === 'text' ? (currentPage === PAGES.ARTICLES ? 'rtl' : 'ltr') : undefined,
      fontSize: 14,
      fontFamily: type === 'text' ? (currentPage === PAGES.ARTICLES ? ARABIC_FONTS[0] : FONT_FAMILIES[0]) : FONT_FAMILIES[0],
      color: '#101822',
      draggable: true,
      fill: type === 'rectangle' ? '#ffffff' : undefined,
      stroke: type === 'rectangle' || type === 'line' ? '#000000' : undefined,
      strokeWidth: type === 'rectangle' || type === 'line' ? 1 : undefined,
      opacity: 1,
      rotation: 0,
      wrap: type === 'text' ? 'word' : undefined,
      lineHeight: type === 'text' ? 1.3 : undefined,
      textAlign: type === 'text' ? (currentPage === PAGES.ARTICLES ? 'right' : 'left') : undefined,
    };
    setElementsForCurrent(prev => [...prev, newElement]);
    setSelectedIds([newElement.id]);
    setTool('select');
  }, [zoom, currentPage, setElementsForCurrent]);

  const handleDeleteSelected = useCallback(() => {
    setElementsForCurrent(prev => prev.filter(el => !selectedIds.includes(el.id)));
    if (selectedIds.length > 0) toast.success('Éléments supprimés');
    setSelectedIds([]);
  }, [selectedIds, setElementsForCurrent]);

  const handleCopySelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const selectedElements = elements.filter(el => selectedIds.includes(el.id));
    localStorage.setItem('copiedElements', JSON.stringify(selectedElements));
    toast.success('Éléments copiés');
  }, [selectedIds, elements]);

  const handlePasteSelected = useCallback(() => {
    const copied = localStorage.getItem('copiedElements');
    if (!copied) return;
    try {
      const parsed: PermisElement[] = JSON.parse(copied);
      const newElements = parsed.map(el => ({ ...el, id: uuidv4(), x: (el.x + 20) / zoom, y: (el.y + 20) / zoom }));
      setElementsForCurrent(prev => [...prev, ...newElements]);
      setSelectedIds(newElements.map(el => el.id));
      toast.success('Éléments collés');
    } catch (err) {
      console.error('Failed to paste elements', err);
    }
  }, [zoom, setElementsForCurrent]);

  // ---------- save / pdf ----------
  const flattenWithPageIndex = useCallback((ps: PagesTuple): PermisElement[] => {
    const out: PermisElement[] = [];
    ps.forEach((arr, pageIndex) => {
      arr.forEach(el => out.push({ ...el, meta: { ...(el as any).meta, pageIndex } } as any));
    });
    return out;
  }, []);

  const handleSaveDesign = useCallback(async () => {
  setIsLoading(true);
  try {
    const name = prompt('Enter template name:', 
      templates.find(t => t.id === activeTemplate)?.name || `Template ${new Date().toLocaleDateString()}`);
    
    if (!name) {
      setIsLoading(false);
      return;
    }

    const flat = flattenWithPageIndex(pages);
    await onSave({ 
      pages, 
      elements: flat, 
      permisId: initialData.id_demande, 
      templateId: activeTemplate,
      name 
    });
    
    toast.success('Design sauvegardé avec succès');
    
    // Refresh templates list
    const resp = await axios.get(`${apiURL}/api/permis/templates?permisId=${initialData.code_demande}`);
    setTemplates(Array.isArray(resp.data) ? resp.data : resp.data?.data ?? []);
    
  } catch (error) {
    console.error('Failed to save design', error);
    toast.error('Échec de la sauvegarde du design');
  } finally {
    setIsLoading(false);
  }
}, [onSave, pages, flattenWithPageIndex, initialData, activeTemplate, templates]);

const handleDeleteTemplate = useCallback(async (templateId: string) => {
  if (!confirm('Are you sure you want to delete this template?')) return;
  
  try {
    await axios.delete(`${apiURL}/api/permis/templates/${templateId}`);
    toast.success('Template deleted');
    
    // Refresh templates list
    const resp = await axios.get(`${apiURL}/api/permis/templates?permisId=${initialData.code_demande}`);
    setTemplates(Array.isArray(resp.data) ? resp.data : resp.data?.data ?? []);
    
    // If we deleted the active template, reset to default
    if (activeTemplate === templateId) {
      setActiveTemplate(null);
      const defaultPages: PagesTuple = [
        createDefaultGeneralPage(initialData),
        createCoordsPage(initialData),
        createArticlesPageHeader(),
      ];
      setPages(defaultPages);
      pushHistory(defaultPages);
    }
  } catch (error) {
    console.error('Failed to delete template', error);
    toast.error('Failed to delete template');
  }
}, [initialData.code_demande, activeTemplate]);


  const handleGeneratePDF = useCallback(async () => {
  if (!stageRef.current) return;
  setIsLoading(true);

  try {
    const pdf = new jsPDF("p", "pt", "a4");
    const a4Width = pdf.internal.pageSize.getWidth();
    const a4Height = pdf.internal.pageSize.getHeight();

    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      setCurrentPage(pageIndex);
      await new Promise((r) => setTimeout(r, 300));

      const stage = stageRef.current;
      const imgData = stage.toDataURL({ 
        pixelRatio: 2,
        width: canvasSize.width,
        height: canvasSize.height
      });

      // Calculate aspect ratio
      const aspectRatio = canvasSize.width / canvasSize.height;
      let imgWidth, imgHeight;
      
      if (aspectRatio > 1) {
        // Landscape
        imgWidth = a4Width;
        imgHeight = imgWidth / aspectRatio;
      } else {
        // Portrait
        imgHeight = a4Height;
        imgWidth = imgHeight * aspectRatio;
      }

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save(`permis-${initialData.code_demande}.pdf`);
    toast.success("PDF généré avec succès (client-side)");
  } catch (error) {
    console.error("Failed to generate PDF", error);
    toast.error("Échec de la génération du PDF");
  } finally {
    setIsLoading(false);
  }
}, [pages, initialData, canvasSize]);



  const handleSavePermis = useCallback(async () => {
    setIsLoading(true);
    try {
      const flat = flattenWithPageIndex(pages);
      const { id } = await onSavePermis({ pages, elements: flat, data: initialData, id_demande: initialData.id_demande });
      await onSave({ pages, elements: flat, permisId: id, name: `Template for ${initialData.code_demande}` });
      toast.success('Permis and template saved successfully');
    } catch (error) {
      console.error('Failed to save permis', error);
      toast.error("Échec de l'enregistrement du permis");
    } finally {
      setIsLoading(false);
    }
  }, [pages, flattenWithPageIndex, initialData, onSavePermis, onSave]);

  // ---------- templates ----------
  const handleApplyTemplate = useCallback((templateId: string) => {
  const template = templates.find(t => t.id === templateId);
  if (template) {
    // Save last used template for this permis
    localStorage.setItem(`lastTemplate_${initialData.code_demande}`, templateId);
    
    const tplEls = (template.elements || []) as PermisElement[];
    const newPages: PagesTuple = [
      filterElementsByPage(tplEls, 0) || pages[PAGES.GENERAL],
      filterElementsByPage(tplEls, 1) || pages[PAGES.COORDS],
      filterElementsByPage(tplEls, 2) || pages[PAGES.ARTICLES],
    ];
    
    setPages(newPages);
    setActiveTemplate(templateId);
    setSelectedIds([]);
    pushHistory(newPages);
  }
}, [templates, pages, pushHistory, initialData.code_demande]);

  const handlePropertyChange = useCallback((property: keyof PermisElement, value: any) => {
    if (selectedIds.length === 0) return;
    setElementsForCurrent(prev => prev.map(el => (selectedIds.includes(el.id) ? { ...el, [property]: value } : el)));
  }, [selectedIds, setElementsForCurrent]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? zoom * 1.2 : zoom / 1.2;
    setZoom(clamp(newZoom, 0.5, 3));
  }, [zoom]);

  const selectedElementsList = useMemo(() => elements.filter(el => selectedIds.includes(el.id)), [elements, selectedIds]);
  const firstSelected = selectedElementsList[0];

  // ---------- articles ----------
  const insertArticlesAsElements = useCallback((articleIds: string[], source: ArticleItem[]) => {
  const leftColumnBlocks = toArticleElements({
    articleIds: articleIds.filter((_, i) => i % 2 === 0), // Even indexes go to left column
    articles: source,
    yStart: 100,
    x: 100,
    width: (DEFAULT_CANVAS.width / 2) - 120,
    fontFamily: ARABIC_FONTS[0],
  });

  const rightColumnBlocks = toArticleElements({
    articleIds: articleIds.filter((_, i) => i % 2 !== 0), // Odd indexes go to right column
    articles: source,
    yStart: 100,
    x: (DEFAULT_CANVAS.width / 2) + 20,
    width: (DEFAULT_CANVAS.width / 2) - 120,
    fontFamily: ARABIC_FONTS[0],
  });

  setPages(prev => {
    const next: PagesTuple = [...prev] as PagesTuple;
    const kept = next[PAGES.ARTICLES].filter((el: any) => !el.isArticle);
    next[PAGES.ARTICLES] = [...kept, ...leftColumnBlocks, ...rightColumnBlocks];
    pushHistory(JSON.parse(JSON.stringify(next)) as PagesTuple);
    return next;
  });
}, [pushHistory]);


  const onToggleArticle = useCallback((id: string, checked: boolean) => {
    setSelectedArticleIds(prev => {
      const next = checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id);
      insertArticlesAsElements(next, articles);
      return next;
    });
  }, [articles, insertArticlesAsElements]);

  const onAddCustomArticle = useCallback((article: ArticleItem) => {
    setArticles(prev => [...prev, article]);
    setSelectedArticleIds(prev => [...prev, article.id]);
    insertArticlesAsElements([...selectedArticleIds, article.id], [...articles, article]);
  }, [articles, selectedArticleIds, insertArticlesAsElements]);

  const onRemoveArticle = useCallback((id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    const filteredIds = selectedArticleIds.filter(x => x !== id);
    setSelectedArticleIds(filteredIds);
    insertArticlesAsElements(filteredIds, articles.filter(a => a.id !== id));
  }, [articles, selectedArticleIds, insertArticlesAsElements]);

  const onUpdateArticle = useCallback((a: ArticleItem) => {
    setArticles(prev => prev.map(x => (x.id === a.id ? a : x)));
    if (selectedArticleIds.includes(a.id)) {
      insertArticlesAsElements(selectedArticleIds, [...articles.filter(x => x.id !== a.id), a]);
    }
  }, [articles, selectedArticleIds, insertArticlesAsElements]);

  // ---------- text overlay ----------
  const openTextEditor = useCallback((element: PermisElement) => {
  if (!containerRef.current) return;
  const containerRect = containerRef.current.getBoundingClientRect();
  const canvasPad = 20;

  // Calculate position
  const left = element.x * zoom + containerRect.left + canvasPad;
  const top = element.y * zoom + containerRect.top + canvasPad;

  // Use element width/height if available
  const width = (element.width || 200) * zoom;
  const height = (element.height || 40) * zoom;

  setTextOverlay({
    id: element.id,
    value: element.text || '',
    left,
    top,
    width,
    height,
    fontSize: (element.fontSize || 14) * zoom,
    fontFamily: element.fontFamily || FONT_FAMILIES[0],
    color: element.color || '#000',
    direction: element.direction || 'ltr',
    textAlign: (element as any).textAlign || 'left',
    lineHeight: (element as any).lineHeight || 1.2
  });
}, [zoom]);


  const commitTextEditor = useCallback((save: boolean) => {
    if (!textOverlay) return;
    if (save) handleTextChange(textOverlay.id, textOverlay.value);
    setTextOverlay(null);
  }, [textOverlay, handleTextChange]);

  const onTextAreaKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitTextEditor(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      commitTextEditor(false);
    }
  }, [commitTextEditor]);

  // ---------- pagination ----------
  const canPrev = currentPage > 0;
  const canNext = currentPage < 2;
  const gotoPrev = useCallback(() => { if (!canPrev) return; setSelectedIds([]); setCurrentPage(p => p - 1); }, [canPrev]);
  const gotoNext = useCallback(() => { if (!canNext) return; setSelectedIds([]); setCurrentPage(p => p + 1); }, [canNext]);

  const pageLabel = (idx: number) => {
    switch (idx) {
      case PAGES.GENERAL: return 'الصفحة 1: معلومات عامة';
      case PAGES.COORDS: return 'الصفحة 2: الإحداثيات';
      case PAGES.ARTICLES: return 'الصفحة 3: المواد';
      default: return `Page ${idx + 1}`;
    }
  };

  // ---------- render ----------
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.brand}>Permis Designer</div>

        <div className={styles.toolbar}>
          <div className={styles.tools}>
            <button className={`${styles.toolButton} ${tool === 'select' ? styles.active : ''}`} onClick={() => setTool('select')} title="Select (S)"><FiMove /></button>
            <button className={`${styles.toolButton} ${tool === 'text' ? styles.active : ''}`} onClick={() => { setTool('text'); handleAddElement('text'); }} title="Add Text (T)"><FiType /></button>
            <button className={`${styles.toolButton} ${tool === 'rectangle' ? styles.active : ''}`} onClick={() => { setTool('rectangle'); handleAddElement('rectangle'); }} title="Add Rectangle (R)"><BsTextParagraph /></button>
            <button className={`${styles.toolButton} ${tool === 'line' ? styles.active : ''}`} onClick={() => { setTool('line'); handleAddElement('line'); }} title="Add Line (L)"><BsBorderWidth /></button>
            <button className={styles.toolButton} onClick={() => handleAddElement('image')} title="Add Image (I)"><BsImage /></button>
          </div>

          <div className={styles.pager}>
            <button className={styles.iconBtn} onClick={gotoPrev} disabled={!canPrev}><FiChevronLeft /></button>
            <div className={styles.pageLabel}>{pageLabel(currentPage)}</div>
            <button className={styles.iconBtn} onClick={gotoNext} disabled={!canNext}><FiChevronRight /></button>
          </div>

          <div className={styles.rightTools}>
            <div className={styles.zoomGroup}>
              <button className={styles.iconBtn} onClick={() => handleZoom('out')}>-</button>
              <div className={styles.zoomDisplay}>{Math.round(zoom * 100)}%</div>
              <button className={styles.iconBtn} onClick={() => handleZoom('in')}>+</button>
              <button className={`${styles.iconBtn} ${showGrid ? styles.active : ''}`} onClick={() => setShowGrid(s => !s)} title="Toggle Grid"><FiGrid /></button>
            </div>
            <div className={styles.resizeGroup}>
  <button className={styles.iconBtn} onClick={() => handleResizeCanvas('width', -50)} title="Decrease Width">
    <FiChevronLeft /> W
  </button>
  <button className={styles.iconBtn} onClick={() => handleResizeCanvas('width', 50)} title="Increase Width">
    <FiChevronRight /> W
  </button>
  <button className={styles.iconBtn} onClick={() => handleResizeCanvas('height', -50)} title="Decrease Height">
    <FiChevronUp /> H
  </button>
  <button className={styles.iconBtn} onClick={() => handleResizeCanvas('height', 50)} title="Increase Height">
    <FiChevronDown /> H
  </button>
  <button className={styles.iconBtn} onClick={handleResetCanvasSize} title="Reset Size">
    <FiRefreshCw />
  </button>
</div>

            <select 
  className={styles.templateSelect} 
  value={activeTemplate || ''} 
  onChange={(e) => handleApplyTemplate(e.target.value)}
>
  <option value="">Default Template</option>
  {templates.map(t => (
    <option key={t.id} value={t.id}>
      {t.name} (v{t.version})
    </option>
  ))}
</select>
{activeTemplate && (
  <button 
    className={styles.iconBtn} 
    onClick={() => handleDeleteTemplate(activeTemplate)}
    title="Delete Template"
  >
    <FiTrash2 />
  </button>
)}

            <button className={`${styles.actionBtn}`} onClick={handleSaveDesign} disabled={isLoading}><FiSave /> <span>Save Temp</span></button>
            <button className={`${styles.actionBtn}`} onClick={handleGeneratePDF} disabled={isLoading}><FiDownload /> <span>PDF</span></button>
            <button className={`${styles.actionBtn}`} onClick={handleSavePermis} disabled={isLoading}><FiSave /> <span>Save Permis</span></button>
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {/* Left: articles panel only on articles page */}
        {currentPage === PAGES.ARTICLES && (
          <aside className={styles.sidebar}>
            <ArticlesPanel
              articles={articles}
              selectedIds={selectedArticleIds}
              onToggle={onToggleArticle}
              onAddCustom={onAddCustomArticle}
              onRemove={onRemoveArticle}
              onUpdate={onUpdateArticle}
            />
          </aside>
        )}

        {/* Canvas */}
        <main className={styles.canvasArea} ref={containerRef}>
          <div className={styles.canvasWrap}>
            <Stage
  width={canvasSize.width * zoom}
  height={canvasSize.height * zoom}
  ref={stageRef}
  scaleX={zoom}
  scaleY={zoom}
  onClick={handleStageClick}
  onTap={handleStageClick}
  style={{
    backgroundImage: showGrid ? gridBackground(zoom) : 'none',
    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
  }}
>
              <Layer>
                {elements.map(element => {
                  const isSelected = selectedIds.includes(element.id);
                  return (
                    <ElementRenderer
                      key={element.id}
                      element={element}
                      isSelected={isSelected}
                      zoom={zoom}
                      onClickElement={() => {}}
                      onDragEnd={handleDragEnd}
                      onTransformEnd={handleTransformEnd}
                      onDblClickText={() => openTextEditor(element)}
                    />
                  );
                })}
                <Transformer
                  ref={transformerRef}
                  anchorSize={8}
                  anchorStrokeWidth={1}
                  borderStrokeWidth={1}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) return oldBox;
                    return newBox;
                  }}
                />
              </Layer>
            </Stage>
          </div>

          {/* overlay editor */}
          {textOverlay && (
            <textarea
  autoFocus
  value={textOverlay.value}
  onChange={e =>
    setTextOverlay(prev =>
      prev ? { ...prev, value: e.target.value } : prev
    )
  }
  onBlur={() => commitTextEditor(true)}
  onKeyDown={onTextAreaKeyDown}
  className={styles.textOverlay}
  style={{
    left: textOverlay.left,
    top: textOverlay.top,
    width: textOverlay.width,
    height: textOverlay.height, // ✅ match selected element height
    fontSize: textOverlay.fontSize,
    fontFamily: textOverlay.fontFamily,
    color: textOverlay.color,
    lineHeight: `${textOverlay.lineHeight}`,
    direction: textOverlay.direction === 'rtl' ? 'rtl' : 'ltr',
    textAlign: textOverlay.textAlign as any,
    overflow: 'hidden', // ✅ keep text inside
  }}
/>

          )}
        </main>

        {/* Right: properties */}
        <aside className={styles.properties}>
          {selectedIds.length > 0 && firstSelected ? (
            <div className={styles.propsInner}>
              <h3>Properties <span className={styles.small}>({selectedIds.length})</span></h3>

              <div className={styles.propRow}>
                <label>Position</label>
                <div className={styles.inlineInputs}>
                  <input type="number" value={firstSelected.x || 0} onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value || '0'))} />
                  <input type="number" value={firstSelected.y || 0} onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value || '0'))} />
                </div>
              </div>

              <div className={styles.propRow}>
                <label>Size</label>
                <div className={styles.inlineInputs}>
                  <input type="number" value={firstSelected.width || 0} onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value || '0'))} />
                  <input type="number" value={firstSelected.height || 0} onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value || '0'))} />
                </div>
              </div>

              {firstSelected.type === 'text' && (
                <>
                  <div className={styles.propRow}>
                    <label>Text</label>
                    <textarea value={firstSelected.text || ''} onChange={(e) => handleTextChange(firstSelected.id, e.target.value)} rows={3} />
                  </div>

                  <div className={styles.propRow}>
                    <label>Language</label>
                    <div className={styles.inlineInputs}>
                      <select value={firstSelected.language || 'fr'} onChange={(e) => handlePropertyChange('language', e.target.value as any)}>
                        <option value="ar">Arabic</option>
                        <option value="fr">French</option>
                        <option value="en">English</option>
                      </select>
                      <select value={firstSelected.direction || 'ltr'} onChange={(e) => handlePropertyChange('direction', e.target.value as any)}>
                        <option value="rtl">RTL</option>
                        <option value="ltr">LTR</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.propRow}>
                    <label>Font</label>
                    <select value={firstSelected.fontFamily || (firstSelected.language === 'ar' ? ARABIC_FONTS[0] : FONT_FAMILIES[0])}
                      onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}>
                      {(firstSelected.language === 'ar' ? ARABIC_FONTS : FONT_FAMILIES).map(font => <option key={font} value={font}>{font}</option>)}
                    </select>
                  </div>

                  <div className={styles.propRow}>
                    <label>Font Size</label>
                    <input type="number" value={firstSelected.fontSize || 14} onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value || '14'))} />
                  </div>

                  <div className={styles.propRow}>
                    <label>Color</label>
                    <div className={styles.colorRow}>
                      <input type="color" value={firstSelected.color || '#000000'} onChange={(e) => handlePropertyChange('color', e.target.value)} />
                      <div className={styles.colorCode}>{firstSelected.color || '#000000'}</div>
                    </div>
                  </div>

                  <div className={styles.propRow}>
                    <label>Alignment</label>
                    <select value={(firstSelected as any).textAlign || ((firstSelected as any).direction === 'rtl' ? 'right' : 'left')} onChange={(e) => handlePropertyChange('textAlign', e.target.value)}>
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div className={styles.propRow}>
                    <label>Line Height</label>
                    <input type="number" step="0.05" value={(firstSelected as any).lineHeight || 1.3} onChange={(e) => handlePropertyChange('lineHeight', parseFloat(e.target.value || '1.3'))} />
                  </div>
                </>
              )}

              {(firstSelected.type === 'rectangle' || firstSelected.type === 'line') && (
                <>
                  <div className={styles.propRow}>
                    <label>Fill</label>
                    <div className={styles.colorRow}>
                      <input type="color" value={(firstSelected as any).fill || '#ffffff'} onChange={(e) => handlePropertyChange('fill', e.target.value)} />
                      <div className={styles.colorCode}>{(firstSelected as any).fill || '#ffffff'}</div>
                    </div>
                  </div>

                  <div className={styles.propRow}>
                    <label>Border</label>
                    <div className={styles.inlineInputs}>
                      <input type="color" value={(firstSelected as any).stroke || '#000000'} onChange={(e) => handlePropertyChange('stroke', e.target.value)} />
                      <input type="number" value={(firstSelected as any).strokeWidth || 1} onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value || '1'))} />
                    </div>
                  </div>

                  {firstSelected.type === 'rectangle' && (
                    <div className={styles.propRow}>
                      <label>Corner Radius</label>
                      <input type="number" value={(firstSelected as any).cornerRadius || 0} onChange={(e) => handlePropertyChange('cornerRadius', parseInt(e.target.value || '0'))} />
                    </div>
                  )}
                </>
              )}

              <div className={styles.propRow}>
                <label>Opacity</label>
                <div className={styles.inlineInputs}>
                  <input type="range" min="0" max="1" step="0.05" value={firstSelected.opacity || 1} onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value || '1'))} />
                  <div className={styles.small}>{Math.round((firstSelected.opacity || 1) * 100)}%</div>
                </div>
              </div>

              <div className={styles.propRow}>
                <label>Rotation</label>
                <input type="number" min={0} max={360} value={firstSelected.rotation || 0} onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value || '0'))} />
              </div>
            </div>
          ) : (
            <div className={styles.emptyProps}>
              <h4>No elements selected</h4>
              <p>Click an element to edit properties</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default PermisDesigner;

