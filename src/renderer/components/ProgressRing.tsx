import * as React from 'react';
import styled from '@emotion/styled';

type Props = React.HTMLAttributes<SVGSVGElement> & {
  value: number;
  maxValue?: number;
  minValue?: number;
  size?: number;
  barWidth?: number;
  color?: string;
  bgColor?: string;
};

const ProgressRing = ({
  value,
  minValue = 0,
  maxValue = 100,
  size = 20,
  barWidth = 3,
  color = '#333',
  bgColor = '#eee',
  ...p
}: Props) => {
  const radius = size / 2 - barWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const boundedValue = Math.min(Math.max(value, minValue), maxValue);
  const progress = (boundedValue - minValue) / (maxValue - minValue);
  const percent = progress * 100;
  const progressOffset = (1 - progress) * circumference;

  return (
    <RingSvg height={radius * 2 + barWidth} width={radius * 2 + barWidth} {...p}>
      <RingBackground
        r={radius}
        barWidth={barWidth}
        cx={radius + barWidth / 2}
        cy={radius + barWidth / 2}
        color={bgColor}
      />
      <RingBar
        strokeDashoffset={progressOffset}
        circumference={circumference}
        r={radius}
        barWidth={barWidth}
        cx={radius + barWidth / 2}
        cy={radius + barWidth / 2}
        color={color}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle">
        {percent.toFixed(0)}
      </text>
    </RingSvg>
  );
};

const RingSvg = styled('svg')`
  display: flex;
`;

const RingBackground = styled('circle')<{color: string; barWidth: number}>`
  fill: none;
  stroke: ${p => p.color};
  stroke-width: ${p => p.barWidth}px;
  transition: stroke 100ms;
`;

const RingBar = styled('circle')<{
  color: string;
  circumference: number;
  barWidth: number;
}>`
  fill: none;
  stroke: ${p => p.color};
  stroke-width: ${p => p.barWidth}px;
  stroke-dasharray: ${p => p.circumference} ${p => p.circumference};
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
`;

export default ProgressRing;
