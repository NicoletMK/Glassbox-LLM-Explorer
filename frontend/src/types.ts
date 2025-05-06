export interface ModelParams {
    prompt: string;
    temp: number;
    top_k: number;
  }
  
  export interface Prediction {
    text: string;
    tokens?: string[];
    probs?: number[];
    attention?: AttentionData;
  }
  
  export interface AttentionData {
    [layer: number]: {
      [head: number]: number[][];
    };
  }
  
  export interface ControlPanelProps {
    params: ModelParams;
    onParamsChange: (params: ModelParams) => void;
    onPredict: () => Promise<void>;
    onBreakModel: () => Promise<void>;
    loading: boolean;
    attentionData?: AttentionData;
    onConfigChange?: (config: {
      layer: number;
      head: number;
      tokenSize: number;
      showValues: boolean;
      valueThreshold: number;
      colorScheme: string;
    }) => void;
  }