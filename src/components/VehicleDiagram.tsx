import { useRef, useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import chevyTahoeImage from "@/assets/chevy-tahoe-front.jpg";

interface PlacedLight {
  id: string;
  type: string;
  xPct: number; // percentage (0-1) relative to image area
  yPct: number; // percentage (0-1) relative to image area
  isDragging?: boolean;
}

interface VehicleDiagramProps {
  view: string;
  vehicle: string;
  onExport: (canvas: HTMLCanvasElement) => void;
}

export const VehicleDiagram = ({ view, vehicle, onExport }: VehicleDiagramProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [placedLights, setPlacedLights] = useState<PlacedLight[]>([]);
  const [draggedLight, setDraggedLight] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedPlacedLight, setDraggedPlacedLight] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [vehicleImageLoaded, setVehicleImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper to get image area in DOM
  const getImageArea = () => {
    const img = document.getElementById('vehicle-img-dom') as HTMLImageElement;
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    return rect;
  };

  // Helper to get image area in canvas
  const getCanvasImageArea = (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    const padding = 32;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    let { width: imgWidth, height: imgHeight } = img;
    const maxWidth = canvasWidth - padding;
    const maxHeight = canvasHeight - padding;
    const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
    imgWidth *= scale;
    imgHeight *= scale;
    const imageX = (canvasWidth - imgWidth) / 2;
    const imageY = (canvasHeight - imgHeight) / 2;
    return { x: imageX, y: imageY, width: imgWidth, height: imgHeight };
  };

  // Unified drop handler (DOM)
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dataType = e.dataTransfer.getData('text/plain');
    const imgRect = getImageArea();
    if (!imgRect) return;
    const x = e.clientX - imgRect.left;
    const y = e.clientY - imgRect.top;
    const xPct = x / imgRect.width;
    const yPct = y / imgRect.height;
    if (dataType === 'placed-light' && draggedPlacedLight) {
      // Moving existing light
      setPlacedLights(prev => prev.map(light =>
        light.id === draggedPlacedLight
          ? { ...light, xPct, yPct }
          : light
      ));
      setDraggedPlacedLight(null);
    } else if (dataType && dataType !== 'placed-light') {
      // Adding new light
      const newLight: PlacedLight = {
        id: Date.now().toString(),
        type: dataType,
        xPct,
        yPct
      };
      setPlacedLights(prev => [...prev, newLight]);
    }
  }, [draggedPlacedLight]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're leaving the canvas entirely
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragOver(false);
  }, []);

  const removeLight = useCallback((lightId: string) => {
    setPlacedLights(prev => prev.filter(light => light.id !== lightId));
  }, []);

  const clearAll = useCallback(() => {
    setPlacedLights([]);
  }, []);

  // Canvas export logic
  const drawCanvasContent = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    return new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          const area = getCanvasImageArea(canvas, img);
          ctx.drawImage(img, area.x, area.y, area.width, area.height);
          placedLights.forEach(light => {
            const colors = {
              solo: ['#ff0000'],
              duo: ['#ff0000', '#0000ff'],
              trio: ['#ff0000', '#0000ff', '#ffffff']
            };
            const lightColors = colors[light.type as keyof typeof colors] || ['#ff0000'];
            const px = area.x + light.xPct * area.width;
            const py = area.y + light.yPct * area.height;
            lightColors.forEach((color, index) => {
              const lightX = px + (index * 25) - (lightColors.length * 12.5);
              const lightY = py;
              ctx.beginPath();
              ctx.arc(lightX, lightY, 12, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.stroke();
            });
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load vehicle image'));
      img.src = chevyTahoeImage;
    });
  }, [placedLights]);

  const handleExport = useCallback(async () => {
    if (canvasRef.current) {
      try {
        await drawCanvasContent();
        onExport(canvasRef.current);
      } catch (error) {
        console.error('Export failed:', error);
        // You could add a toast notification here
      }
    }
  }, [drawCanvasContent, onExport]);

  // Drag start for DOM
  const handleLightDragStart = useCallback((e: React.DragEvent, lightId: string) => {
    setDraggedPlacedLight(lightId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'placed-light');
  }, []);

  // DOM render helper
  const renderLight = useCallback((light: PlacedLight) => {
    const imgRect = getImageArea();
    if (!imgRect) return null;
    const x = light.xPct * imgRect.width + imgRect.left - imgRect.left;
    const y = light.yPct * imgRect.height + imgRect.top - imgRect.top;
    const colors = {
      solo: ['#ff0000'],
      duo: ['#ff0000', '#0000ff'],
      trio: ['#ff0000', '#0000ff', '#ffffff']
    };
    return (
      <div
        key={light.id}
        className="absolute cursor-move group select-none"
        style={{
          left: `${light.xPct * 100}%`,
          top: `${light.yPct * 100}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: draggedPlacedLight === light.id ? 1000 : 10
        }}
        draggable
        onDragStart={(e) => handleLightDragStart(e, light.id)}
        onDoubleClick={() => removeLight(light.id)}
      >
        <div className="flex gap-0.5">
          {colors[light.type as keyof typeof colors]?.map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-110"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Drag to move • Double-click to remove
        </div>
      </div>
    );
  }, [draggedPlacedLight, handleLightDragStart, removeLight]);

  return (
    <Card className="p-4 bg-card border-border flex-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          {vehicle} - {view.charAt(0).toUpperCase() + view.slice(1)} View
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearAll}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className={`w-full border rounded-lg bg-muted transition-colors ${
            isDragOver ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          style={{ minHeight: '400px' }}
        />
        {/* Vehicle Image */}
        <img
          id="vehicle-img-dom"
          src={chevyTahoeImage}
          alt="Chevy Tahoe Front View"
          className="absolute w-auto h-auto object-contain"
          style={{ 
            pointerEvents: 'none',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)'
          }}
          draggable={false}
          onLoad={() => setVehicleImageLoaded(true)}
          onError={() => setVehicleImageLoaded(false)}
        />
        {/* Placed lights */}
        {placedLights.map(renderLight)}
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        Lights placed: {placedLights.length}
      </div>
    </Card>
  );
};