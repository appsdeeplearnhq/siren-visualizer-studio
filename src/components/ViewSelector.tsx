import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ViewSelectorProps {
  selectedView: string;
  onViewSelect: (view: string) => void;
}

const views = [
  { id: 'front', label: 'Front View' },
  { id: 'rear', label: 'Rear View' },
  { id: 'top', label: 'Top View' },
  { id: 'left', label: 'Left Side' },
  { id: 'right', label: 'Right Side' }
];

export const ViewSelector = ({ selectedView, onViewSelect }: ViewSelectorProps) => {
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Select Vehicle View</h3>
      <div className="grid grid-cols-2 gap-3">
        {views.map((view) => (
          <Button
            key={view.id}
            variant={selectedView === view.id ? "default" : "secondary"}
            onClick={() => onViewSelect(view.id)}
            className="h-12"
          >
            {view.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};