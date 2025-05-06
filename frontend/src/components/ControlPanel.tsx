import './ControlPanel.css';
import React, { useState, useEffect, useMemo } from 'react';
import { ControlPanelProps, ModelParams } from '../types';

interface RangeControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}

const RangeControl: React.FC<RangeControlProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
}) => (
  <div className="control-group">
    <label>{label}: {value.toFixed(1)}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  </div>
);

const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onParamsChange,
  onPredict,
  onBreakModel,
  loading,
  attentionData,
  onConfigChange,
}) => {
  const [localParams, setLocalParams] = useState<ModelParams>({...params});

  useEffect(() => {
    setLocalParams({...params});
  }, [params]);

  const handleTempChange = (temp: number) => {
    const newParams = {...localParams, temp};
    setLocalParams(newParams);
    onParamsChange(newParams);
  };

  const handleTopKChange = (top_k: number) => {
    const newParams = {...localParams, top_k};
    setLocalParams(newParams);
    onParamsChange(newParams);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = {...localParams, prompt: e.target.value};
    setLocalParams(newParams);
    onParamsChange(newParams);
  };

  return (
    <div className="control-panel">
      <div className="section">
        <h3>Generation Parameters</h3>
        <div className="control-group">
          <label htmlFor="prompt">Prompt:</label>
          <input
            id="prompt"
            type="text"
            value={localParams.prompt}
            onChange={handlePromptChange}
          />
        </div>

        <RangeControl
          label="Temperature"
          value={localParams.temp}
          onChange={handleTempChange}
          min={0}
          max={2}
          step={0.1}
        />

        <RangeControl
          label="Top-k"
          value={localParams.top_k}
          onChange={handleTopKChange}
          min={1}
          max={100}
          step={1}
        />

        <div className="button-group">
          <button 
            onClick={onPredict} 
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <button 
            onClick={onBreakModel} 
            disabled={loading}
          >
            Break Model
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;