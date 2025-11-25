import React, { useState, useRef, useEffect } from 'react';
import { Copy, Share2, FileText, Check, ZoomIn, ZoomOut, Maximize2, X, Highlighter, Eraser } from '../components/Icons';
import { Button } from '../components/Button';
import { saveToHistory } from '../services/historyService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { AdBanner } from '../components/AdBanner';

interface ResultPageProps {
  initialText: string;
  originalImage?: string;
  onBack: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ initialText, originalImage, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Image Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Initialize content
  useEffect(() => {
    if (editorRef.current) {
      // Convert newlines to breaks for HTML display
      editorRef.current.innerHTML = initialText.replace(/\n/g, '<br>');
    }
  }, [initialText]);

  const handleCopy = () => {
    if (!editorRef.current) return;
    navigator.clipboard.writeText(editorRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Ensure selection is within editor
    if (!editorRef.current?.contains(selection.anchorNode)) return;

    document.execCommand('hiliteColor', false, '#fef08a'); // yellow-200
  };

  const handleClearFormat = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    if (!editorRef.current?.contains(selection.anchorNode)) return;

    document.execCommand('removeFormat');
  };

  const handleSaveTxt = () => {
    if (!editorRef.current) return;
    const textContent = editorRef.current.innerText;
    
    const element = document.createElement("a");
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `scan_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Save plain text to history
    saveToHistory(textContent);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSavePdf = async () => {
    if (!editorRef.current) return;
    
    // Create a temporary container to ensure clean styling for PDF
    // We clone the content to a white background container
    const container = document.createElement('div');
    container.innerHTML = editorRef.current.innerHTML;
    
    // Apply styles that ensure the PDF looks like a document
    container.style.width = '595px'; // A4 width in pts (approx)
    container.style.padding = '40px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#000000';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12pt';
    container.style.lineHeight = '1.5';
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    
    document.body.appendChild(container);

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });

    try {
      await doc.html(container, {
        callback: (pdf) => {
          pdf.save(`scan_${new Date().toISOString().slice(0,10)}.pdf`);
          document.body.removeChild(container);
        },
        x: 0,
        y: 0,
        width: 595,
        windowWidth: 595,
        // @ts-ignore
        html2canvas: {
          scale: 1,
          useCORS: true
        }
      });
    } catch (error) {
      console.error("PDF generation failed", error);
      document.body.removeChild(container);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleShare = async () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Scanned Text',
          text: text,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      handleCopy();
      alert("Sharing not supported on this browser. Text copied to clipboard.");
    }
  };

  // Zoom/Pan Handlers (same as before)
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(1, prev - 0.5);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { 
        x: e.clientX - position.x, 
        y: e.clientY - position.y 
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 5);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
    setScale(newScale);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = { 
        x: touch.clientX - position.x, 
        y: touch.clientY - position.y 
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetZoom();
  };

  return (
    <>
      <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between sticky top-16 z-20 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2 mr-auto">
            <FileText className="w-5 h-5 text-primary" />
            Extracted Text
          </h2>
          
          <div className="flex gap-1 items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mr-2">
            <Button variant="ghost" size="sm" onClick={handleHighlight} title="Highlight Text (Yellow)">
              <Highlighter className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearFormat} title="Clear Formatting">
              <Eraser className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy">
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} title="Share">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
            {/* Content Editable Div */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="flex-1 w-full p-4 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 font-mono text-base leading-relaxed overflow-y-auto"
              style={{ minHeight: '200px' }}
            />
            
            {originalImage && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                 <div className="flex justify-between items-center mb-2">
                   <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Source Image Preview</p>
                   <button 
                     onClick={() => setIsModalOpen(true)}
                     className="text-primary hover:text-primary/80 text-xs font-medium flex items-center gap-1 transition-colors"
                   >
                     <Maximize2 className="w-3 h-3" /> Expand & Zoom
                   </button>
                 </div>
                 <div 
                   className="relative group cursor-zoom-in inline-block"
                   onClick={() => setIsModalOpen(true)}
                 >
                   <img 
                     src={originalImage} 
                     alt="Source" 
                     className="h-24 w-auto rounded-md object-cover border border-gray-300 dark:border-gray-600 group-hover:opacity-90 transition-opacity" 
                   />
                   <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                     <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
                   </div>
                 </div>
              </div>
            )}
          </div>
          
          {/* Ad Banner below content - Using new Ad Unit ID */}
          <AdBanner className="mt-4" slotId="6997552561" />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-3 sticky bottom-0 z-30">
          <Button variant="outline" onClick={handleSavePdf} className="w-full">
            Save PDF
          </Button>
          <Button variant="primary" onClick={handleSaveTxt} className="w-full">
            {saved ? 'Saved!' : 'Save Text'}
          </Button>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      {isModalOpen && originalImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md z-10">
            <div className="text-white/70 text-sm hidden sm:block">
              Scroll or pinch to zoom, drag to pan
            </div>
            <div className="text-white/70 text-sm sm:hidden">
              Tap buttons to zoom
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
               <button 
                 onClick={handleZoomOut} 
                 disabled={scale <= 1}
                 className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
               >
                 <ZoomOut className="w-5 h-5" />
               </button>
               
               <span className="text-white font-mono min-w-[3rem] text-center text-sm">
                 {Math.round(scale * 100)}%
               </span>
               
               <button 
                 onClick={handleZoomIn} 
                 disabled={scale >= 5}
                 className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
               >
                 <ZoomIn className="w-5 h-5" />
               </button>

               <div className="w-px h-6 bg-white/10 mx-2"></div>

               <button 
                 onClick={closeModal} 
                 className="p-2 rounded-full bg-white/10 text-white hover:bg-red-500/80 transition-colors"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
          </div>
          
          {/* Image Container */}
          <div 
            className={`flex-1 overflow-hidden flex items-center justify-center touch-none ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              src={originalImage} 
              alt="Full Preview" 
              draggable={false}
              style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              className="max-w-full max-h-full object-contain select-none"
            />
          </div>
        </div>
      )}
    </>
  );
};