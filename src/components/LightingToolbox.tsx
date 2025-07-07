import React from 'react';
import { Card } from "@/components/ui/card";

interface LightingToolboxProps {
  onLightSelect: (lightType: string) => void;
  view: string;
}

const lightTypes = [
  {
    id: 'solo-red',
    name: 'Solo Red',
    description: 'Single red emergency light',
    colors: ['#ff0000']
  },
  {
    id: 'duo-red-blue',
    name: 'Duo Red/Blue',
    description: 'Red and blue emergency light',
    colors: ['#ff0000', '#0000ff']
  },
  {
    id: 'trio-rgb',
    name: 'Trio RGB',
    description: 'Red, blue, and white emergency light',
    colors: ['#ff0000', '#0000ff', '#ffffff']
  }
];

export const LightingToolbox = ({ onLightSelect, view }: LightingToolboxProps) => {
  const handleDragStart = (e: React.DragEvent, lightType: string) => {
    e.dataTransfer.setData('text/plain', lightType);
  };

  return (
    <Card className="p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-foreground">Lights</h3>
      <div className="space-y-3">
        {lightTypes.map((light) => (
          <div
            key={light.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-surface-elevated cursor-grab active:cursor-grabbing transition-colors border border-border select-none"
            draggable
            onDragStart={(e) => handleDragStart(e, light.id)}
            onClick={() => onLightSelect(light.id)}
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{light.name}</p>
              <p className="text-sm text-muted-foreground">{light.description}</p>
            </div>
            <div 
              className={`flex items-center justify-center ${view === 'top' && light.colors.length > 1 ? 'flex-col' : ''}`} 
              style={{ gap: '4px', minWidth: '40px' }}
            >
              {light.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full"
                  style={{ 
                    backgroundColor: color,
                    border: color === '#ffffff' ? '1px solid #4a4a4a' : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Drag lights onto the vehicle diagram to place them
      </p>
    </Card>
  );
};