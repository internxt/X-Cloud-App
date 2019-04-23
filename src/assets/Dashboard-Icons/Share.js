import React from 'react';

const SVG = ({
    defaultColors = {},
    color = "#4385F4",
    width = 23,
    height = 17,
}) => {
    // Use default colors if none hex color is set
    color = color.startsWith('#') ? color : defaultColors[color];
    return (    
        <svg xmlns="http://www.w3.org/2000/svg" 
            width={width} 
            height={height} 
            viewBox="0 0 23 17">
        <path 
            fill={color}
            fill-rule="evenodd" 
            d="M865.403337,71.7124578 C863.823913,71.7959162 862.27648,72.040242 860.785602,72.5778591 C858.763765,73.3066688 857.109014,74.4806359 855.987683,76.2517655 C854.464853,78.6553445 854.159427,81.2747163 854.530814,84.0040202 C854.560926,84.2184558 854.655565,84.3799611 854.907936,84.3623177 C855.140233,84.3446742 855.217665,84.1818117 855.227702,83.9755193 C855.290795,82.7309784 855.808442,81.6615147 856.663063,80.7331985 C857.758583,79.5429451 859.181038,78.8562082 860.742584,78.3893358 C862.005873,78.0120377 863.307879,77.8247458 864.624223,77.7229567 C864.879871,77.7035744 865.136432,77.691393 865.397692,77.6813701 C865.48104,79.5245239 865.643038,80.9819007 865.870109,81.2142288 C866.529364,81.8890987 876.413681,75.8400682 876.413681,74.9827532 C876.413681,74.1257924 866.639759,67.9630437 865.870109,68.7512775 C865.636624,68.9901855 865.484121,70.1681275 865.403337,71.7124578 L865.403337,71.7124578 Z" transform="translate(-854 -68)"/>
        </svg>      
    )
};

export default SVG;