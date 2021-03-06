import React from 'react';

const SVG = ({
  defaultColors = {},
  color = '#FFF',
  width = 10,
  height = 18
}) => {
  // Use default colors if none hex color is set
  color = color.startsWith('#') ? color : defaultColors[color];
  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 10 18">
      <path
        fill={color}
        stroke={color}
        stroke-width=".83"
        d="M1169.7488,699.700894 L1163.27683,706.743815 C1162.86514,707.192062 1162.19764,707.192062 1161.78615,706.743815 C1161.37462,706.295968 1161.37462,705.569602 1161.78615,705.121791 L1167.51284,698.889882 L1161.78631,692.658191 C1161.37478,692.210162 1161.37478,691.483869 1161.78631,691.036022 C1162.19784,690.587993 1162.8653,690.587993 1163.277,691.036022 L1169.74897,698.079051 C1169.95473,698.303084 1170.0575,698.596392 1170.0575,698.889846 C1170.0575,699.183444 1169.95453,699.476971 1169.7488,699.700894 Z" transform="translate(-1161 -690)"/>
    </svg>
  );
};

export default SVG;