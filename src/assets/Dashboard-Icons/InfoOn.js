import React from 'react';

const SVG = ({
    defaultColors = {},
    color = "#4385F4",
    width = 30,
    height = 30,
}) => {
    // Use default colors if none hex color is set
    color = color.startsWith('#') ? color : defaultColors[color];
    return (    
        <svg xmlns="http://www.w3.org/2000/svg" 
            width={width} 
            height={height} 
            viewBox="0 0 30 30">
        <path 
            fill={color}
            fill-rule="nonzero" 
            d="M14.83 0C6.64 0 0 6.64 0 14.83c0 8.189 6.64 14.83 14.83 14.83 8.189 0 14.83-6.641 14.83-14.83C29.66 6.64 23.019 0 14.83 0zm3.087 22.984c-.764.3-1.371.53-1.827.688-.455.158-.983.237-1.585.237-.924 0-1.643-.226-2.155-.677-.512-.45-.767-1.022-.767-1.716 0-.27.019-.546.056-.827.04-.282.1-.598.185-.953l.955-3.375c.084-.324.157-.631.215-.918a4.07 4.07 0 0 0 .085-.794c0-.43-.089-.731-.266-.9-.18-.17-.517-.253-1.02-.253-.247 0-.5.036-.76.113-.257.08-.48.15-.664.221l.252-1.04a23.796 23.796 0 0 1 1.795-.654 5.304 5.304 0 0 1 1.62-.273c.918 0 1.626.223 2.124.665.496.443.746 1.02.746 1.728 0 .147-.018.405-.052.774-.033.37-.098.708-.19 1.018l-.95 3.365c-.079.27-.148.579-.21.924a4.886 4.886 0 0 0-.092.786c0 .447.1.752.3.914.198.162.546.243 1.038.243.232 0 .492-.041.786-.121.291-.08.502-.152.635-.214l-.254 1.039zm-.169-13.657a2.268 2.268 0 0 1-1.6.617c-.623 0-1.16-.205-1.607-.617-.445-.412-.67-.913-.67-1.498 0-.584.226-1.086.67-1.502a2.275 2.275 0 0 1 1.607-.623 2.25 2.25 0 0 1 1.6.623c.443.416.666.918.666 1.502 0 .586-.223 1.086-.666 1.498z"/>
        </svg>    
    )
};

export default SVG;