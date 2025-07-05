import RealTimeEmotionRadar from '@/components/RealTimeEmotionRadar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent animate-float">
          Emotion Radar
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience next-generation emotion detection with real-time facial expression and voice analysis. 
          Our AI-powered radar visualizes your emotional state as you speak and move.
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto">
        <RealTimeEmotionRadar />
      </div>

      {/* Footer */}
      <footer className="text-center mt-16 text-muted-foreground">
        <p className="text-sm">
          Built with React, TypeScript & AI • Real-time emotion analysis • Privacy-first processing
        </p>
      </footer>
    </div>
  );
};

export default Index;