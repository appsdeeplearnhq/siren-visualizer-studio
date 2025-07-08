import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LightingToolboxProps {
  onLightSelect: (lightType: string) => void;
}

const lightTypes = [
  {
    id: 'solo',
    name: 'Solo Red',
    colors: ['red'],
    description: 'Single red emergency light'
  },
  {
    id: 'duo',
    name: 'Duo Red/Blue',
    colors: ['red', 'blue'],
    description: 'Red and blue emergency light'
  },
  {
    id: 'trio',
    name: 'Trio RGB',
    colors: ['red', 'blue', 'black'],
    description: 'Red, blue, and white emergency light'
  }
];

export const LightingToolbox = ({ onLightSelect }: LightingToolboxProps) => {
  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Emergency Lights</h3>
      <div className="space-y-3">
        {lightTypes.map((light) => (
          <div
            key={light.id}
            className="p-3 rounded-lg bg-secondary hover:bg-surface-elevated cursor-grab active:cursor-grabbing transition-colors border border-border select-none"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', light.id);
              e.dataTransfer.effectAllowed = 'copy';
              
              // Create a custom drag image showing only the light circles
              const dragImage = document.createElement('div');
              dragImage.className = 'flex gap-1 p-3 bg-white border border-gray-300 rounded-lg shadow-xl';
              dragImage.style.width = 'fit-content';
              light.colors.forEach((color) => {
                const circle = document.createElement('div');
                circle.className = `w-8 h-8 rounded-full border-2 border-white shadow-lg`;
                circle.style.backgroundColor = color === 'red' ? '#ff0000' : color === 'blue' ? '#0000ff' : '#000000';
                if (color === 'white') circle.style.border = '2px solid #ccc';
                dragImage.appendChild(circle);
              });
              
              document.body.appendChild(dragImage);
              dragImage.style.position = 'absolute';
              dragImage.style.top = '-1000px';
              dragImage.style.left = '-1000px';
              
              // Center the drag image on the cursor
              const rect = dragImage.getBoundingClientRect();
              e.dataTransfer.setDragImage(dragImage, rect.width / 2, rect.height / 2);
              
              setTimeout(() => {
                if (document.body.contains(dragImage)) {
                  document.body.removeChild(dragImage);
                }
              }, 0);
            }}
            onClick={() => onLightSelect(light.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground pointer-events-none">{light.name}</span>
              <div className="flex gap-1 pointer-events-none">
                {light.colors.map((color) => (
                  <div
                    key={color}
                    className={`w-3 h-3 rounded-full ${
                      color === 'red' ? 'bg-emergency-red' :
                      color === 'blue' ? 'bg-emergency-blue' :
                      'bg-black border border-border'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground pointer-events-none">{light.description}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Drag lights onto the vehicle diagram to place them
      </p>
    </Card>
  );
};