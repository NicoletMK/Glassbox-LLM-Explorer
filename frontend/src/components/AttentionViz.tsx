import './AttentionViz.css';
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface CellData {
  i: number;
  j: number;
  value: number;
}

interface AttentionData {
  [layer: number]: {
    [head: number]: number[][];
  };
}

interface AttentionVizProps {
    data: AttentionData;  // Changed from 'attention' to 'data' to match component
    layer: number;
    head: number;
    tokenSize?: number;
    padding?: number;
    colorScale?: (value: number) => string;
    showValues?: boolean;
    valueThreshold?: number;
    onHeadSelect?: (layer: number, head: number, i: number, j: number, value: number) => void;
    // Remove tokens if not needed
  }

const AttentionViz: React.FC<AttentionVizProps> = ({
  data,
  layer,
  head,
  tokenSize = 20,
  padding = 10,
  colorScale = d3.interpolateBlues,
  showValues = false,
  valueThreshold = 0.1,
  onHeadSelect,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const attentionMatrix = data[layer][head];
    const numTokens = attentionMatrix.length;

    if (numTokens === 0) return;

    const cellSize = tokenSize + padding;
    const width = numTokens * cellSize;
    const height = numTokens * cellSize;

    svg.attr('width', width).attr('height', height);

    // Create a group for the matrix
    const matrixGroup = svg.append('g');

    // Add column labels (input tokens)
    matrixGroup
      .selectAll('.column-label')
      .data(attentionMatrix[0])
      .enter()
      .append('text')
      .attr('class', 'column-label')
      .attr('x', (_, i: number) => i * cellSize + cellSize / 2)
      .attr('y', -5)
      .attr('text-anchor', 'middle')
      .attr('font-size', tokenSize * 0.6)
      .text((_, i: number) => i.toString());

    // Add row labels (output tokens)
    matrixGroup
      .selectAll('.row-label')
      .data(attentionMatrix)
      .enter()
      .append('text')
      .attr('class', 'row-label')
      .attr('x', -5)
      .attr('y', (_, i: number) => i * cellSize + cellSize / 2)
      .attr('text-anchor', 'end')
      .attr('font-size', tokenSize * 0.6)
      .text((_, i: number) => i.toString());

    // Create cells for the attention matrix
    const cells = matrixGroup
      .selectAll<SVGGElement, CellData>('.cell')
      .data(attentionMatrix.flatMap((row: number[], i: number) => 
        row.map((value: number, j: number) => ({ i, j, value }))
      ))
      .enter()
      .append('g')
      .attr('class', 'cell')
      .attr('transform', (d: CellData) => `translate(${d.j * cellSize}, ${d.i * cellSize})`);

    // Add rectangles for each cell
    cells
      .append('rect')
      .attr('width', tokenSize)
      .attr('height', tokenSize)
      .attr('rx', 2)
      .attr('fill', (d: CellData) => colorScale(d.value))
      .on('mouseover', function(event: MouseEvent, d: CellData) {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'block';
          tooltipRef.current.innerHTML = `
            <div>Layer ${layer}, Head ${head}</div>
            <div>From: ${d.j}, To: ${d.i}</div>
            <div>Value: ${d.value.toFixed(4)}</div>
          `;
          tooltipRef.current.style.left = `${event.pageX + 10}px`;
          tooltipRef.current.style.top = `${event.pageY + 10}px`;
        }
      })
      .on('mouseout', () => {
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      })
      .on('click', (event: MouseEvent, d: CellData) => {
        if (onHeadSelect) {
          onHeadSelect(layer, head, d.i, d.j, d.value);
        }
      });

    // Add text values if enabled
    if (showValues) {
      cells
        .append('text')
        .attr('x', tokenSize / 2)
        .attr('y', tokenSize / 2)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('font-size', tokenSize * 0.5)
        .attr('fill', (d: CellData) => (d.value > valueThreshold ? 'white' : 'black'))
        .text((d: CellData) => (d.value > valueThreshold ? d.value.toFixed(2) : ''));
    }
  }, [data, layer, head, tokenSize, padding, colorScale, showValues, valueThreshold, onHeadSelect]);

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} />
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          display: 'none',
          background: 'white',
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '3px',
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
    </div>
  );
};

export default AttentionViz;