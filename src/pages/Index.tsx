import EmotionRadar from '@/components/EmotionRadar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent animate-float">
          Emotion Radar
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and visualize your emotional landscape with our interactive radar chart. 
          Track, understand, and balance your feelings in real-time.
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto">
        <EmotionRadar />
      </div>

      {/* Footer */}
      <footer className="text-center mt-16 text-muted-foreground">
        <p className="text-sm">
          Built with React, TypeScript & Tailwind CSS • Designed for emotional awareness
        </p>
      </footer>
    </div>
  );
};

export default Index;