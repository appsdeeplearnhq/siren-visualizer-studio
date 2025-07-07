import { Card } from "@/components/ui/card";

interface VehicleCardProps {
  vehicle: {
    id: string;
    name: string;
    model: string;
    category: string;
  };
  onClick: (vehicleId: string) => void;
  disabled?: boolean;
}

export const VehicleCard = ({ vehicle, onClick, disabled = false }: VehicleCardProps) => {
  return (
    <Card 
      className={`p-4 transition-colors border-border bg-card ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:bg-surface-elevated'
      }`}
      onClick={() => !disabled && onClick(vehicle.id)}
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
          <div className="w-12 h-8 bg-foreground rounded-sm opacity-20"></div>
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
            {vehicle.name}
          </h3>
          <p className="text-sm text-muted-foreground">{vehicle.model}</p>
          {disabled && (
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          )}
        </div>
      </div>
    </Card>
  );
};