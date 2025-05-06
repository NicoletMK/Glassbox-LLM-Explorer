import { useState } from 'react';
import { getPrediction, breakModel } from './api';
import ControlPanel from './components/ControlPanel';
import AttentionViz from './components/AttentionViz';
import TokenProbs from './components/TokenProbs';
import { Prediction, ModelParams } from './types';
import './App.css';

export default function App() {
  const [params, setParams] = useState<ModelParams>({
    prompt: "The cat sat on the",
    temp: 0.7,
    top_k: 40
  });
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending params:', params); // Debug log
      const result = await getPrediction(params);
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBreak = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await breakModel();
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Model broke as expected!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Glass-Box LLM Explorer</h1>
      
      <ControlPanel
        params={params}
        onParamsChange={setParams}
        onPredict={handlePredict}
        onBreakModel={handleBreak}
        loading={loading}
        attentionData={prediction?.attention}
      />

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {prediction && (
        <div className="results">
          <div className="text-output">
            <h3>Generated Text:</h3>
            <p>{prediction.text}</p>
          </div>
          
          {prediction.tokens && prediction.probs && (
            <TokenProbs tokens={prediction.tokens} probs={prediction.probs} />
          )}
          
          {prediction.attention && (
            <AttentionViz 
              data={prediction.attention} 
              layer={0}
              head={0}
            />
          )}
        </div>
      )}
    </div>
  );
}