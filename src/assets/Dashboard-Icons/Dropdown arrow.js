import React from 'react';

const SVG = ({
  defaultColors = {},
  color = '#000',
  width = 14,
  height = 9
}) => {
  // Use default colors if none hex color is set
  color = color.startsWith('#') ? color : defaultColors[color];
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 9">
      <path
        fillRule="evenodd"
        stroke={color}
        stroke-width="1.2"
        d="M770.784441,151.044544 L766.258411,155.774419 C765.969883,156.075194 765.502985,156.075194 765.215339,155.774419 C764.92822,155.473645 764.92822,154.985738 765.215339,154.685148 L769.220186,150.499908 L765.216044,146.315405 C764.92822,146.01463 764.92822,145.526908 765.216044,145.226133 C765.50369,144.924622 765.970588,144.924622 766.258411,145.226133 L770.784441,149.956009 C770.928441,150.106304 771,150.30283 771,150.499908 C771,150.696986 770.928441,150.894985 770.784441,151.044544 Z" transform="matrix(0 1 1 0 -143.5 -763.5)"/>
    </svg>
  );
};

export default SVG;