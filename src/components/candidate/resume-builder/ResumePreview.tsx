import React, { useState, useRef, useEffect } from 'react';
import { CandidateResumeData } from '../../../types';
import { GoogleProfessionalTemplate } from './GoogleProfessionalTemplate';
import { ClassicLatexTemplate } from './ClassicLatexTemplate';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileCheck,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface ResumePreviewProps {
  data: CandidateResumeData;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.92);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [isSinglePage, setIsSinglePage] = useState<boolean>(true);

  // Measure content height against A4 standard pixel budget
  useEffect(() => {
    if (paperRef.current) {
      // Standard A4 aspect ratio height at current width
      const height = paperRef.current.scrollHeight;
      // In A4, standard height is roughly 1.414 * width
      const width = paperRef.current.clientWidth;
      const expectedA4Height = width * 1.414;
      setIsSinglePage(height <= expectedA4Height * 1.06);
    }
  }, [data, zoomLevel]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(1.4, prev + 0.1));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.6, prev - 0.1));
  const handleResetZoom = () => setZoomLevel(0.92);

  return (
    <div
      id="resume-live-preview-container"
      className={`flex flex-col bg-slate-900/95 rounded-2xl border border-slate-800 shadow-xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'h-full'
      }`}
    >
      {/* Top Preview Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-white">
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Live A4 Preview</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
            {data.selectedTemplate === 'latex' ? 'Classic LaTeX' : 'Google Professional'}
          </span>
        </div>

        {/* Page Budget & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* 1-Page Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              isSinglePage
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
            title={
              isSinglePage
                ? 'Resume fits on a single A4 page - optimal for ATS screening.'
                : 'Resume extends across multiple pages. Consider refining bullet points to fit 1 page if targeting entry/mid-level roles.'
            }
          >
            {isSinglePage ? (
              <>
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>1 Page (ATS Optimized)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Multi-Page</span>
              </>
            )}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/80">
            <button
              type="button"
              id="zoom-out-btn"
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="zoom-reset-btn"
              onClick={handleResetZoom}
              className="px-2 text-[11px] font-medium text-slate-300 hover:text-white"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              id="zoom-in-btn"
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            type="button"
            id="fullscreen-preview-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
            title={isFullscreen ? 'Exit full screen' : 'Expand preview'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Preview Scroll Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-950/70 custom-scrollbar"
      >
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full max-w-[620px] transition-all"
        >
          {/* A4 Paper Canvas */}
          <div
            ref={paperRef}
            id="resume-a4-canvas"
            className="bg-white rounded-sm shadow-2xl overflow-hidden ring-1 ring-black/10 min-h-[842px]"
          >
            {data.selectedTemplate === 'latex' ? (
              <ClassicLatexTemplate data={data} />
            ) : (
              <GoogleProfessionalTemplate data={data} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
