import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";

interface PlacedLight {
  id: string;
  type: string;
  x: number;
  y: number;
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const lightType = e.dataTransfer.getData('text/plain');
    const rect = canvasRef.current?.getBoundingClientRect();
    
    console.log('Drop event:', { lightType, rect });
    
    if (rect && lightType) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      console.log('Placing light at:', { x, y });
      
      const newLight: PlacedLight = {
        id: Date.now().toString(),
        type: lightType,
        x,
        y
      };
      
      setPlacedLights(prev => [...prev, newLight]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    console.log('Drag enter');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragOver to false if we're leaving the canvas entirely
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragOver(false);
    console.log('Drag leave');
  };

  const removeLight = (lightId: string) => {
    setPlacedLights(prev => prev.filter(light => light.id !== lightId));
  };

  const clearAll = () => {
    setPlacedLights([]);
  };

  const handleExport = () => {
    if (canvasRef.current) {
      onExport(canvasRef.current);
    }
  };

  const renderLight = (light: PlacedLight) => {
    const colors = {
      solo: ['#ff0000'],
      duo: ['#ff0000', '#0000ff'],
      trio: ['#ff0000', '#0000ff', '#ffffff']
    };

    return (
      <div
        key={light.id}
        className="absolute cursor-pointer group"
        style={{
          left: light.x - 12,
          top: light.y - 12,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => removeLight(light.id)}
      >
        <div className="flex gap-0.5">
          {colors[light.type as keyof typeof colors]?.map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Click to remove
        </div>
      </div>
    );
  };

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
        
        {/* Vehicle outline placeholder - with pointer-events: none to allow drag through */}
        <div 
          className="absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">🚗</div>
            <p className="text-sm">Vehicle diagram will appear here</p>
            <p className="text-xs mt-1">Drag lights from the toolbox to place them</p>
          </div>
        </div>
        
        {/* Placed lights */}
        {placedLights.map(renderLight)}
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        Lights placed: {placedLights.length}
      </div>
    </Card>
  );
};