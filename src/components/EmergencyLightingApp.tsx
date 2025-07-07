import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap } from "lucide-react";
import { VehicleCard } from "./VehicleCard";
import { ViewSelector } from "./ViewSelector";
import { LightingToolbox } from "./LightingToolbox";
import { VehicleDiagram } from "./VehicleDiagram";
import { StartupPage } from "./StartupPage";
import { toast } from "sonner";

type AppStep = 'startup' | 'home' | 'vehicle-selection' | 'view-selection' | 'lighting-layout';

const vehicles = [
  { id: 'chevy-tahoe', name: 'Chevrolet Tahoe', model: 'PPV', category: 'SUV' },
  { id: 'ford-explorer', name: 'Ford Explorer', model: 'PIU', category: 'SUV' },
  { id: 'dodge-durango', name: 'Dodge Durango', model: 'PUR', category: 'SUV' },
  { id: 'ford-f150', name: 'Ford F-150', model: 'SSV', category: 'Truck' }
];

export const EmergencyLightingApp = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('startup');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedView, setSelectedView] = useState<string>('');

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setCurrentStep('view-selection');
  };

  const handleViewSelect = (view: string) => {
    setSelectedView(view);
    setCurrentStep('lighting-layout');
  };

  const handleStartNewLayout = () => {
    setCurrentStep('vehicle-selection');
  };

  const handleStartDemo = () => {
    setCurrentStep('home');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'vehicle-selection':
        setCurrentStep('home');
        break;
      case 'view-selection':
        setCurrentStep('vehicle-selection');
        break;
      case 'lighting-layout':
        setCurrentStep('view-selection');
        break;
    }
  };

  const handleExport = (canvas: HTMLCanvasElement) => {
    const link = document.createElement('a');
    link.download = `${selectedVehicle}-${selectedView}-lighting-layout.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success("Layout exported successfully!");
  };

  const handleLightSelect = (lightType: string) => {
    toast.info(`Selected ${lightType} light - drag it onto the vehicle diagram`);
  };

  const getSelectedVehicleName = () => {
    const vehicle = vehicles.find(v => v.id === selectedVehicle);
    return vehicle ? `${vehicle.name} ${vehicle.model}` : '';
  };

  const renderHome = () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Emergency Lighting App</h1>
        <p className="text-xl text-muted-foreground">Design and configure emergency vehicle lighting layouts</p>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button 
          size="lg" 
          onClick={handleStartNewLayout}
          className="h-14 text-lg"
        >
          Start New Layout
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          className="h-14 text-lg"
          disabled
        >
          Load Saved Layout (Coming Soon)
        </Button>
      </div>
    </div>
  );

  const renderVehicleSelection = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-foreground">Vehicle Selection</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onClick={handleVehicleSelect}
              disabled={vehicle.id !== 'chevy-tahoe'}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderViewSelection = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-foreground">
            {getSelectedVehicleName()} - Select View
          </h2>
        </div>
        
        <ViewSelector
          selectedView={selectedView}
          onViewSelect={handleViewSelect}
        />
      </div>
    </div>
  );

  const renderLightingLayout = () => (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-foreground">Lighting Layout Editor</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <LightingToolbox 
              onLightSelect={handleLightSelect}
            />
          </div>
          <div className="lg:col-span-3">
            <VehicleDiagram
              view={selectedView}
              vehicle={getSelectedVehicleName()}
              onExport={handleExport}
            />
          </div>
        </div>
      </div>
    </div>
  );

  switch (currentStep) {
    case 'startup':
      return <StartupPage onStartDemo={handleStartDemo} />;
    case 'home':
      return renderHome();
    case 'vehicle-selection':
      return renderVehicleSelection();
    case 'view-selection':
      return renderViewSelection();
    case 'lighting-layout':
      return renderLightingLayout();
    default:
      return <StartupPage onStartDemo={handleStartDemo} />;
  }
};