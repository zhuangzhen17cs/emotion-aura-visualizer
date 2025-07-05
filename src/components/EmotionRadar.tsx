import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

type Emotion = {
  name: string;
  value: number;
  color: string;
  angle: number;
};

const EMOTIONS: Omit<Emotion, 'value'>[] = [
  { name: 'Joy', color: 'emotion-joy', angle: 0 },
  { name: 'Love', color: 'emotion-love', angle: 45 },
  { name: 'Peace', color: 'emotion-peace', angle: 90 },
  { name: 'Calm', color: 'emotion-calm', angle: 135 },
  { name: 'Sadness', color: 'emotion-sadness', angle: 180 },
  { name: 'Fear', color: 'emotion-fear', angle: 225 },
  { name: 'Anger', color: 'emotion-anger', angle: 270 },
  { name: 'Excitement', color: 'emotion-excitement', angle: 315 },
];

const EmotionRadar = () => {
  const [emotions, setEmotions] = useState<Emotion[]>(
    EMOTIONS.map(emotion => ({ ...emotion, value: 30 }))
  );

  const updateEmotion = (index: number, value: number) => {
    setEmotions(prev => prev.map((emotion, i) => 
      i === index ? { ...emotion, value } : emotion
    ));
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const createRadarPath = () => {
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 160;
    
    let pathData = '';
    
    emotions.forEach((emotion, index) => {
      const radius = (emotion.value / 100) * maxRadius;
      const point = polarToCartesian(centerX, centerY, radius, emotion.angle);
      
      if (index === 0) {
        pathData += `M ${point.x} ${point.y}`;
      } else {
        pathData += ` L ${point.x} ${point.y}`;
      }
    });
    
    pathData += ' Z';
    return pathData;
  };

  const createGridLines = () => {
    const centerX = 200;
    const centerY = 200;
    const lines = [];
    
    // Concentric circles
    for (let i = 1; i <= 4; i++) {
      const radius = (i / 4) * 160;
      lines.push(
        <circle
          key={`circle-${i}`}
          cx={centerX}
          cy={centerY}
          r={radius}
          className="radar-line"
          opacity={0.3}
        />
      );
    }
    
    // Radial lines
    emotions.forEach((emotion, index) => {
      const outerPoint = polarToCartesian(centerX, centerY, 160, emotion.angle);
      lines.push(
        <line
          key={`line-${index}`}
          x1={centerX}
          y1={centerY}
          x2={outerPoint.x}
          y2={outerPoint.y}
          className="radar-line"
          opacity={0.2}
        />
      );
    });
    
    return lines;
  };

  const createEmotionPoints = () => {
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 160;
    
    return emotions.map((emotion, index) => {
      const radius = (emotion.value / 100) * maxRadius;
      const point = polarToCartesian(centerX, centerY, radius, emotion.angle);
      
      return (
        <g key={`point-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              className="cursor-pointer transition-all duration-300 hover:r-8 animate-pulse-glow"
              style={{
                fill: `hsl(var(--${emotion.color}))`,
                filter: `drop-shadow(0px 0px 8px hsl(var(--${emotion.color})))`
              }}
            />
            <text
              x={polarToCartesian(centerX, centerY, 185, emotion.angle).x}
              y={polarToCartesian(centerX, centerY, 185, emotion.angle).y}
              className="text-sm font-medium text-center pointer-events-none"
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: `hsl(var(--${emotion.color}))`
              }}
            >
              {emotion.name}
            </text>
        </g>
      );
    });
  };

  return (
    <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
        Emotion Radar
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Radar Chart */}
        <div className="relative">
          <svg
            width="400"
            height="400"
            className="mx-auto drop-shadow-lg"
          >
            {/* Grid lines */}
            {createGridLines()}
            
            {/* Radar area */}
            <path
              d={createRadarPath()}
              className="radar-area animate-pulse-glow"
              style={{
                fill: 'url(#radarGradient)',
                stroke: 'hsl(var(--primary))',
                strokeWidth: 2
              }}
            />
            
            {/* Gradient definition */}
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
              </radialGradient>
            </defs>
            
            {/* Emotion points and labels */}
            {createEmotionPoints()}
          </svg>
        </div>
        
        {/* Controls */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Adjust Your Emotions
          </h3>
          
          {emotions.map((emotion, index) => (
            <div key={emotion.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <label 
                  className="font-medium"
                  style={{ color: `hsl(var(--${emotion.color}))` }}
                >
                  {emotion.name}
                </label>
                <span className="text-sm text-muted-foreground font-mono">
                  {emotion.value}%
                </span>
              </div>
              
              <Slider
                value={[emotion.value]}
                onValueChange={(value) => updateEmotion(index, value[0])}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          ))}
          
          <div className="pt-4 space-y-2">
            <div className="text-sm text-muted-foreground">
              Total Emotional Energy: {emotions.reduce((sum, e) => sum + e.value, 0)}%
            </div>
            <div className="text-xs text-muted-foreground">
              Tip: Balance is key to emotional well-being
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionRadar;