import { useRef, useState, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import chevyTahoeFrontImage from "@/assets/chevy-tahoe-front.jpg";
import chevyTahoeTopImage from "@/assets/chevy-tahoe-top.png";

interface PlacedLight {
  id: string;
  type: string;
  xPct: number; // percentage (0-1) relative to image area
  yPct: number; // percentage (0-1) relative to image area
}

interface VehicleDiagramProps {
  view: string;
  vehicle: string;
  onExport: (canvas: HTMLCanvasElement) => void;
}

export const VehicleDiagram = ({ view, vehicle, onExport }: VehicleDiagramProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null); // Ref for the image's direct container
  const [placedLights, setPlacedLights] = useState<PlacedLight[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [vehicleImageLoaded, setVehicleImageLoaded] = useState(false);

  // State to hold the light being dragged from its original position
  const [activelyDraggedLight, setActivelyDraggedLight] = useState<PlacedLight | null>(null);

  const getImageArea = useCallback(() => {
    const imageContainer = imageContainerRef.current;
    const img = imgRef.current;
    if (!imageContainer || !img || !vehicleImageLoaded) return null;

    const containerRect = imageContainer.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const relativeX = imgRect.left - containerRect.left;
    const relativeY = imgRect.top - containerRect.top;
    
    return {
      width: imgRect.width,
      height: imgRect.height,
      relativeX,
      relativeY,
    };
  }, [vehicleImageLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const dataType = e.dataTransfer.getData('text/plain');
    const img = imgRef.current;

    if (!img || !vehicleImageLoaded) {
        if(activelyDraggedLight) setPlacedLights(prev => [...prev, activelyDraggedLight]);
        setActivelyDraggedLight(null);
        return;
    };

    const imgRect = img.getBoundingClientRect();

    // Check if drop is within the image bounds
    if (e.clientX < imgRect.left || e.clientX > imgRect.right || e.clientY < imgRect.top || e.clientY > imgRect.bottom) {
        if(activelyDraggedLight) setPlacedLights(prev => [...prev, activelyDraggedLight]);
        setActivelyDraggedLight(null);
        return; 
    }

    const x_rel_img = e.clientX - imgRect.left;
    const y_rel_img = e.clientY - imgRect.top;

    const xPct = x_rel_img / imgRect.width;
    const yPct = y_rel_img / imgRect.height;
    
    let lightToPlace: PlacedLight;
    
    if (activelyDraggedLight) { // This was a re-drag
      lightToPlace = { ...activelyDraggedLight, xPct, yPct };
    } else { // This is a new light from the toolbox
      lightToPlace = { id: Date.now().toString(), type: dataType, xPct, yPct };
    }
    
    setPlacedLights(prev => [...prev, lightToPlace]);
    setActivelyDraggedLight(null);

  }, [activelyDraggedLight, vehicleImageLoaded]);

  const handleLightDragStart = useCallback((e: React.DragEvent, lightId: string) => {
    const lightToDrag = placedLights.find(l => l.id === lightId);
    if (!lightToDrag) return;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lightToDrag.type);
    
    setActivelyDraggedLight(lightToDrag);
    setPlacedLights(prev => prev.filter(l => l.id !== lightId));

  }, [placedLights]);
  
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // If the drag ended without a successful drop, put the light back
    if (activelyDraggedLight) {
        setPlacedLights(prev => [...prev, activelyDraggedLight]);
        setActivelyDraggedLight(null);
    }
  }, [activelyDraggedLight]);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const removeLight = (lightId: string) => setPlacedLights(prev => prev.filter(light => light.id !== lightId));
  const clearAll = () => setPlacedLights([]);
  
  const handleExport = useCallback(async () => {
    const diagramElement = document.getElementById('vehicle-diagram-export-area');
    if (!diagramElement) {
      console.error("Export failed: Diagram element not found.");
      return;
    }

    try {
      const canvas = await html2canvas(diagramElement, {
        backgroundColor: null, // Use transparent background
        logging: false,
        useCORS: true // Important for external images
      });
      onExport(canvas);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [onExport]);

  // Normalize for comparison
  const normalizedVehicle = vehicle.trim().toLowerCase();
  const normalizedView = view.trim().toLowerCase();

  // Select image based on view
  let vehicleImage = chevyTahoeFrontImage;
  if (normalizedVehicle.includes("tahoe") && normalizedView === "top") {
    vehicleImage = chevyTahoeTopImage;
  }

  return (
    <Card className="p-4 bg-card border-border flex-1" onDragEnd={handleDragEnd}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {vehicle} - {view.charAt(0).toUpperCase() + view.slice(1)} View
        </h3>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearAll}><Trash2 className="w-4 h-4 mr-2" />Clear All</Button>
            <Button size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export</Button>
        </div>
      </div>
      
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className={`w-full border rounded-lg bg-muted transition-colors ${ isDragOver ? 'border-primary bg-primary/5' : 'border-border' }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          style={{ minHeight: '400px' }}
        />
        
        <div 
          id="vehicle-diagram-export-area"
          className="absolute top-0 left-0 w-full h-full p-8 flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div className="relative w-full h-full" ref={imageContainerRef}>
            <img
              ref={imgRef}
              id="vehicle-img-dom"
              src={vehicleImage}
              alt="Vehicle"
              className="absolute object-contain"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
              }}
              onLoad={() => setVehicleImageLoaded(true)}
            />
        
            {/* Render placed lights */}
            {placedLights.map(light => {
                const imgArea = getImageArea();
                if (!imgArea) return null;

                const colors = {
                    solo: ['#ff0000'],
                    duo: ['#ff0000', '#0000ff'],
                    trio: ['#ff0000', '#0000ff', '#000000'] // changed from #ffffff to #000000
                };
                const lightColors = colors[light.type as keyof typeof colors] || [];

                return (
                    <div
                      key={light.id}
                      className="absolute cursor-move group"
                      style={{
                        left: `${imgArea.relativeX + light.xPct * imgArea.width}px`,
                        top: `${imgArea.relativeY + light.yPct * imgArea.height}px`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'auto',
                      }}
                      draggable
                      onDragStart={(e) => handleLightDragStart(e, light.id)}
                      onDoubleClick={() => removeLight(light.id)}
                    >
                      <div className="flex items-center" style={{ gap: '1px' }}>
                        {lightColors.map((color, index) => (
                          <div
                            key={index}
                            style={{
                              width: '24px', height: '24px', borderRadius: '50%',
                              backgroundColor: color, border: '2px solid #fff',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            }}
                            className="transition-transform group-hover:scale-110"
                          />
                        ))}
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        Drag to move • Double-click to remove
                      </div>
                    </div>
                );
            })}
          </div>
      </div>
      </div>
    </Card>
  );
};
