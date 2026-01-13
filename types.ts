
export interface SwingMetric {
  name: string;
  score: number;
  description: string;
  status: 'excellent' | 'good' | 'average' | 'needs-work';
}

export interface SwingAnalysis {
  overallScore: number;
  summary: string;
  metrics: SwingMetric[];
  pros: string[];
  improvements: string[];
  drills: string[];
}

export interface VideoFile {
  file: File;
  previewUrl: string;
}
