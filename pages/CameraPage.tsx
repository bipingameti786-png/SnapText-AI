import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { ChevronLeft, Camera, RotateCcw } from '../components/Icons';
import { Button } from '../components/Button';

interface CameraPageProps {
  onCapture: (imageSrc: string) => void;
  onBack: () => void;
}

export const CameraPage: React.FC<CameraPageProps> = ({ onCapture, onBack }) => {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const toggleCamera = () => {
    setFacingMode(prev => (prev === "user" ? "environment" : "user"));
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  };

  return (
    <div className="flex flex-col h-full bg-black absolute inset-0 z-40">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button onClick={onBack} className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={toggleCamera} className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm">
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
          forceScreenshotSourceSize={true}
        />
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent">
        <button 
          onClick={capture}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/50 transition-all transform active:scale-95"
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-lg"></div>
        </button>
      </div>
    </div>
  );
};
