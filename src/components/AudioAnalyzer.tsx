import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface AudioAnalyzerProps {
  onEmotionUpdate: (emotions: EmotionScores) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({
  onEmotionUpdate,
  isAnalyzing,
  setIsAnalyzing
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [dominantFrequency, setDominantFrequency] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isAnalyzing]);

  const checkPermissions = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasPermission(result.state === 'granted');
    } catch (error) {
      console.log('Permission check not supported');
      setHasPermission(null);
    }
  };

  const startAudio = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Create audio context and analyzer
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 2048;
      streamRef.current = stream;
      
      setHasPermission(true);
      setIsAnalyzing(true);
      
      toast({
        title: "Microphone activated",
        description: "Real-time voice emotion analysis started",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasPermission(false);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to analyze voice emotions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    analyserRef.current = null;
    setIsAnalyzing(false);
    setAudioLevel(0);
    setDominantFrequency(0);
    
    toast({
      title: "Voice analysis stopped",
      description: "Audio emotion detection paused",
    });
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const timeDataArray = new Uint8Array(analyserRef.current.fftSize);
    
    analyserRef.current.getByteFrequencyData(dataArray);
    analyserRef.current.getByteTimeDomainData(timeDataArray);

    // Calculate audio level (volume)
    const sum = timeDataArray.reduce((acc, val) => acc + Math.abs(val - 128), 0);
    const avgLevel = sum / timeDataArray.length;
    setAudioLevel(avgLevel);

    // Find dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const frequency = (maxIndex * sampleRate) / (2 * dataArray.length);
    setDominantFrequency(frequency);

    // Analyze emotions based on audio characteristics
    const emotions = analyzeVoiceEmotions(avgLevel, frequency, dataArray);
    onEmotionUpdate(emotions);

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  };

  const analyzeVoiceEmotions = (
    volume: number, 
    dominantFreq: number, 
    frequencyData: Uint8Array
  ): EmotionScores => {
    // Simplified voice emotion analysis based on acoustic features
    // In production, you'd use trained ML models
    
    // Volume-based emotions
    const volumeNormalized = Math.min(volume / 50, 1);
    
    // Frequency-based emotions (Hz ranges)
    const lowFreq = dominantFreq < 200;   // Calm, sad tones
    const midFreq = dominantFreq < 800;   // Normal speech
    const highFreq = dominantFreq >= 800; // Excited, stressed tones
    
    // Energy distribution analysis
    const energySum = frequencyData.reduce((sum, val) => sum + val, 0);
    const energyVariance = frequencyData.reduce((sum, val) => sum + Math.pow(val - energySum / frequencyData.length, 2), 0) / frequencyData.length;
    
    const emotions: EmotionScores = {
      joy: Math.min(volumeNormalized * 60 + (highFreq ? 20 : 0), 80),
      excitement: Math.min(volumeNormalized * 70 + (highFreq ? 25 : 0), 85),
      calm: Math.min((1 - volumeNormalized) * 50 + (lowFreq ? 30 : 0), 70),
      peace: Math.min((1 - volumeNormalized) * 45 + (lowFreq ? 25 : 0), 65),
      love: Math.min(volumeNormalized * 40 + (midFreq ? 20 : 0), 60),
      sadness: Math.min((1 - volumeNormalized) * 35 + (lowFreq ? 20 : 0), 55),
      anger: Math.min(volumeNormalized * 45 + (energyVariance > 1000 ? 25 : 0), 70),
      fear: Math.min(volumeNormalized * 30 + (highFreq && energyVariance > 800 ? 20 : 0), 50)
    };

    return emotions;
  };

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Voice Emotion Analysis
        </h3>
        
        <Button
          onClick={isAnalyzing ? stopAudio : startAudio}
          disabled={isLoading}
          variant={isAnalyzing ? "destructive" : "default"}
          size="sm"
          className="transition-all duration-300"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
          ) : isAnalyzing ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Listening
            </>
          )}
        </Button>
      </div>

      {hasPermission === false && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">
            Microphone access is required for voice emotion analysis
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Audio Visualizer */}
        <div className="bg-secondary/20 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Audio Level</span>
            <span className="font-mono text-primary">{Math.round(audioLevel)}</span>
          </div>
          
          <div className="w-full bg-secondary/30 rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-100"
              style={{ width: `${Math.min((audioLevel / 50) * 100, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Dominant Frequency</span>
            <span className="font-mono text-accent">{Math.round(dominantFrequency)} Hz</span>
          </div>

          {isAnalyzing && audioLevel > 5 && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Analyzing voice patterns...
            </div>
          )}
        </div>

        {!isAnalyzing && (
          <div className="text-center text-muted-foreground py-8">
            <Mic className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Click "Start Listening" to begin</p>
            <p className="text-xs mt-1">voice emotion analysis</p>
          </div>
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <p>• Your audio is processed locally in real-time</p>
        <p>• No recordings are saved or transmitted</p>
        <p>• Speak naturally for best emotion detection</p>
      </div>
    </div>
  );
};

export default AudioAnalyzer;