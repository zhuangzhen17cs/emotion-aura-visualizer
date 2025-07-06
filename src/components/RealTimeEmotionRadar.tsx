import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import EmotionRadar from './EmotionRadar';
import VideoAnalyzer from './VideoAnalyzer';
import AudioAnalyzer from './AudioAnalyzer';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface EmotionScores {
  joy: number;
  love: number;
  peace: number;
  calm: number;
  sadness: number;
  fear: number;
  anger: number;
  excitement: number;
}

const RealTimeEmotionRadar = () => {
  const [currentEmotions, setCurrentEmotions] = useState<EmotionScores>({
    joy: 30,
    love: 25,
    peace: 35,
    calm: 40,
    sadness: 15,
    fear: 10,
    anger: 12,
    excitement: 28
  });

  const [videoAnalyzing, setVideoAnalyzing] = useState(false);
  const [audioAnalyzing, setAudioAnalyzing] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [analysisHistory, setAnalysisHistory] = useState<EmotionScores[]>([]);
  const [currentSource, setCurrentSource] = useState<'manual' | 'video' | 'audio' | 'combined'>('manual');

  const handleVideoEmotionUpdate = (emotions: EmotionScores) => {
    if (!autoUpdate) return;
    
    if (audioAnalyzing) {
      // Blend video and audio emotions when both are active
      setCurrentEmotions(prev => ({
        joy: Math.round((prev.joy * 0.3 + emotions.joy * 0.7)),
        love: Math.round((prev.love * 0.3 + emotions.love * 0.7)),
        peace: Math.round((prev.peace * 0.3 + emotions.peace * 0.7)),
        calm: Math.round((prev.calm * 0.3 + emotions.calm * 0.7)),
        sadness: Math.round((prev.sadness * 0.3 + emotions.sadness * 0.7)),
        fear: Math.round((prev.fear * 0.3 + emotions.fear * 0.7)),
        anger: Math.round((prev.anger * 0.3 + emotions.anger * 0.7)),
        excitement: Math.round((prev.excitement * 0.3 + emotions.excitement * 0.7))
      }));
      setCurrentSource('combined');
    } else {
      setCurrentEmotions(emotions);
      setCurrentSource('video');
    }
    
    setAnalysisHistory(prev => [...prev.slice(-19), emotions]);
  };

  const handleAudioEmotionUpdate = (emotions: EmotionScores) => {
    if (!autoUpdate) return;
    
    if (videoAnalyzing) {
      // Blend audio and video emotions when both are active
      setCurrentEmotions(prev => ({
        joy: Math.round((prev.joy * 0.7 + emotions.joy * 0.3)),
        love: Math.round((prev.love * 0.7 + emotions.love * 0.3)),
        peace: Math.round((prev.peace * 0.7 + emotions.peace * 0.3)),
        calm: Math.round((prev.calm * 0.7 + emotions.calm * 0.3)),
        sadness: Math.round((prev.sadness * 0.7 + emotions.sadness * 0.3)),
        fear: Math.round((prev.fear * 0.7 + emotions.fear * 0.3)),
        anger: Math.round((prev.anger * 0.7 + emotions.anger * 0.3)),
        excitement: Math.round((prev.excitement * 0.7 + emotions.excitement * 0.3))
      }));
      setCurrentSource('combined');
    } else {
      setCurrentEmotions(emotions);
      setCurrentSource('audio');
    }
    
    setAnalysisHistory(prev => [...prev.slice(-19), emotions]);
  };

  const handleManualEmotionUpdate = (emotions: EmotionScores) => {
    setCurrentEmotions(emotions);
    setCurrentSource('manual');
  };

  const resetEmotions = () => {
    const resetState = {
      joy: 30,
      love: 25,
      peace: 35,
      calm: 40,
      sadness: 15,
      fear: 10,
      anger: 12,
      excitement: 28
    };
    setCurrentEmotions(resetState);
    setCurrentSource('manual');
    setAnalysisHistory([]);
  };

  const toggleAllAnalysis = () => {
    if (videoAnalyzing || audioAnalyzing) {
      setVideoAnalyzing(false);
      setAudioAnalyzing(false);
    } else {
      setVideoAnalyzing(true);
      setAudioAnalyzing(true);
    }
  };

  useEffect(() => {
    if (videoAnalyzing && audioAnalyzing) {
      setCurrentSource('combined');
    }
  }, [videoAnalyzing, audioAnalyzing]);

  const getSourceBadgeVariant = () => {
    switch (currentSource) {
      case 'video': return 'default';
      case 'audio': return 'secondary';
      case 'combined': return 'destructive';
      default: return 'outline';
    }
  };

  const getSourceLabel = () => {
    switch (currentSource) {
      case 'video': return 'Facial Analysis';
      case 'audio': return 'Voice Analysis';
      case 'combined': return 'Multi-Modal';
      default: return 'Manual Input';
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Badge variant={getSourceBadgeVariant()} className="text-sm">
              {getSourceLabel()}
            </Badge>
            
            {analysisHistory.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {analysisHistory.length} analysis samples
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoUpdate}
                onCheckedChange={setAutoUpdate}
                id="auto-update"
              />
              <label htmlFor="auto-update" className="text-sm text-muted-foreground">
                Auto-update radar
              </label>
            </div>

            <Button
              onClick={toggleAllAnalysis}
              variant={videoAnalyzing || audioAnalyzing ? "destructive" : "default"}
              size="sm"
              className="transition-all duration-300"
            >
              {videoAnalyzing || audioAnalyzing ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop All
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start All
                </>
              )}
            </Button>

            <Button
              onClick={resetEmotions}
              variant="outline"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Emotion Radar - Always visible */}
        <div className="order-1">
          <EmotionRadar 
            emotions={currentEmotions}
            onEmotionUpdate={handleManualEmotionUpdate}
            readOnly={currentSource !== 'manual' && autoUpdate}
          />
        </div>

        {/* Analysis Controls */}
        <div className="order-2 space-y-6">
          <Tabs defaultValue="video" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card">
              <TabsTrigger value="video" className="data-[state=active]:bg-primary/20">
                Video Analysis
              </TabsTrigger>
              <TabsTrigger value="audio" className="data-[state=active]:bg-primary/20">
                Audio Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="video" className="mt-6">
              <VideoAnalyzer
                onEmotionUpdate={handleVideoEmotionUpdate}
                isAnalyzing={videoAnalyzing}
                setIsAnalyzing={setVideoAnalyzing}
              />
            </TabsContent>
            
            <TabsContent value="audio" className="mt-6">
              <AudioAnalyzer
                onEmotionUpdate={handleAudioEmotionUpdate}
                isAnalyzing={audioAnalyzing}
                setIsAnalyzing={setAudioAnalyzing}
              />
            </TabsContent>
          </Tabs>

          {/* Analysis Tips */}
          <div className="glass-card rounded-xl p-4 space-y-2">
            <h4 className="font-medium text-foreground">💡 Analysis Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure good lighting for facial analysis</li>
              <li>• Speak naturally and clearly for voice analysis</li>
              <li>• Use both modes together for best results</li>
              <li>• Manual mode allows fine-tuning emotions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeEmotionRadar;