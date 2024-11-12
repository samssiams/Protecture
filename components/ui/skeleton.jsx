// components/ui/Skeleton.jsx

import React, { useEffect } from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '4px', className = '', style = {} }) => {
  useEffect(() => {
    // Check if `document` is available (client-side only)
    if (typeof document !== 'undefined') {
      const shimmerStyle = document.createElement('style');
      shimmerStyle.innerHTML = `
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `;
      document.head.appendChild(shimmerStyle);
      return () => document.head.removeChild(shimmerStyle);
    }
  }, []);

  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(-90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
    />
  );
};

export default Skeleton;
