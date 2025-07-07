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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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

  const renderLightingLayout = () => {
    // State for mobile toolbox drawer
    const [toolboxOpen, setToolboxOpen] = useState(false);

    return (
      <div className="min-h-screen bg-background p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4 sm:mb-6">
            <Button variant="ghost" onClick={handleBack} className="min-h-[44px] min-w-[44px]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-foreground">Lighting Layout Editor</h2>
          </div>

          {/* Responsive layout: toolbox below diagram on mobile, left on desktop */}
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Toolbox: Drawer on mobile, always visible on desktop */}
            <div className="lg:col-span-1">
              <div className="hidden lg:block">
                <LightingToolbox onLightSelect={handleLightSelect} />
              </div>
              {/* Mobile FAB to open toolbox */}
              <div className="fixed bottom-6 right-6 z-50 lg:hidden">
                <Button
                  className="rounded-full shadow-lg h-14 w-14 p-0 flex items-center justify-center"
                  onClick={() => setToolboxOpen(true)}
                  aria-label="Open Toolbox"
                  variant="default"
                >
                  <Zap className="w-7 h-7" />
                </Button>
              </div>
              {/* Mobile Drawer */}
              {toolboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setToolboxOpen(false)}>
                  <div
                    className="w-full bg-card rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Emergency Lights</h3>
                      <Button size="sm" variant="ghost" onClick={() => setToolboxOpen(false)}>Close</Button>
                    </div>
                    <LightingToolbox onLightSelect={handleLightSelect} />
                  </div>
                </div>
              )}
            </div>
            {/* Diagram */}
            <div className="lg:col-span-3 flex flex-col">
              <VehicleDiagram
                view={selectedView}
                vehicle={getSelectedVehicleName()}
                onExport={handleExport}
              />
              {/* Sticky actions on mobile */}
              <div className="lg:hidden sticky bottom-0 left-0 w-full flex gap-2 bg-background/90 p-2 z-40 border-t border-border mt-2">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 min-h-[44px] min-w-[44px]" 
                  onClick={() => {
                    const clearButton = document.querySelector('[data-clear-all]') as HTMLButtonElement;
                    if (clearButton) clearButton.click();
                  }}
                >
                  Clear All
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1 min-h-[44px] min-w-[44px]" 
                  onClick={() => {
                    const exportButton = document.querySelector('[data-export]') as HTMLButtonElement;
                    if (exportButton) exportButton.click();
                  }}
                >
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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