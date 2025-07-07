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
    colors: ['red', 'blue', 'white'],
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
            className="p-3 rounded-lg bg-secondary hover:bg-surface-elevated cursor-pointer transition-colors border border-border"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', light.id);
            }}
            onClick={() => onLightSelect(light.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">{light.name}</span>
              <div className="flex gap-1">
                {light.colors.map((color) => (
                  <div
                    key={color}
                    className={`w-3 h-3 rounded-full ${
                      color === 'red' ? 'bg-emergency-red' :
                      color === 'blue' ? 'bg-emergency-blue' :
                      'bg-emergency-white border border-border'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{light.description}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Drag lights onto the vehicle diagram to place them
      </p>
    </Card>
  );
};