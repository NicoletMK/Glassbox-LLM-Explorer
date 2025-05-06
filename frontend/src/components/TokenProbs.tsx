import React from 'react';
import { scaleLinear } from 'd3-scale';
import './TokenProbs.css';

interface TokenProbsProps {
  tokens: string[];
  probs: number[];
}

const TokenProbs: React.FC<TokenProbsProps> = ({ tokens, probs }) => {
  // Safety checks
  if (!probs || probs.length === 0 || !tokens || tokens.length === 0) {
    return (
      <div className="token-probs-error">
        No probability data available for these tokens
      </div>
    );
  }

  if (tokens.length !== probs.length) {
    console.error('Mismatch between tokens and probabilities');
    return (
      <div className="token-probs-error">
        Data mismatch: {tokens.length} tokens vs {probs.length} probabilities
      </div>
    );
  }

  // Create color scale (blue gradient)
  const colorScale = scaleLinear<string>()
    .domain([0, 1])
    .range(['#ebedf0', '#0369a1']);

  return (
    <div className="token-probs">
      <h3>Token Probabilities</h3>
      <div className="prob-bars-container">
        {tokens.map((token, index) => (
          <div key={index} className="prob-bar">
            <span className="token-text">
              {token.replace(/Ġ/g, ' ')}  {/* Handle GPT-2's space tokens */}
            </span>
            <div className="bar-container">
              <div
                className="probability-bar"
                style={{
                  width: `${probs[index] * 100}%`,
                  backgroundColor: colorScale(probs[index]),
                }}
              />
            </div>
            <span className="probability-value">
              {(probs[index] * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenProbs;