import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface StartupPageProps {
  onStartDemo: () => void;
}

export const StartupPage = ({ onStartDemo }: StartupPageProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center bg-card border-border">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Emergency Lighting Designer
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          Professional emergency vehicle lighting configuration tool
        </p>
        
        <div className="mb-8 p-6 bg-muted rounded-lg">
          <p className="text-lg text-foreground">
            This demo is created by <span className="font-bold text-primary">DeepLearnHQ</span> for <span className="font-bold text-primary">Edgar Rodriguez</span>
          </p>
        </div>
        
        <Button 
          size="lg" 
          onClick={onStartDemo}
          className="h-14 text-lg px-8"
        >
          Start Demo
        </Button>
      </Card>
    </div>
  );
};