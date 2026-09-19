"use client";

import React from "react";

interface SapcLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const SapcLogo: React.FC<SapcLogoProps> = ({ 
  className = "", 
  size = 40,
  showText = false 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official Emblem Container */}
      <div 
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-md"
        style={{ 
          width: size, 
          height: size,
          background: "linear-gradient(135deg, #F5B800 0%, #E5A800 100%)"
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Maroon Ribbon Arch */}
          <path
            d="M12 50 C12 25 30 10 50 10 C70 10 88 25 88 50 C88 75 70 90 50 90 C30 90 12 75 12 50 Z"
            fill="#70000D"
            stroke="#F5B800"
            strokeWidth="2"
          />
          {/* Inner Cream/White Shield */}
          <path
            d="M24 48 C24 30 35 20 50 20 C65 20 76 30 76 48 C76 68 62 78 50 82 C38 78 24 68 24 48 Z"
            fill="#FFFDF7"
            stroke="#70000D"
            strokeWidth="1.5"
          />
          
          {/* Top Tri-Hearts / Triple Rings */}
          <circle cx="44" cy="34" r="5" fill="#70000D" />
          <circle cx="56" cy="34" r="5" fill="#70000D" />
          <circle cx="50" cy="42" r="5" fill="#70000D" />
          <circle cx="50" cy="38" r="3" fill="#FFFDF7" />

          {/* Roof/House Gable outline */}
          <path
            d="M32 50 L50 36 L68 50"
            stroke="#70000D"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Open Book / Torch on Left and Laurel on Right */}
          {/* Left Book & Flame */}
          <path
            d="M34 68 C38 65 44 65 47 67 L47 55 C44 53 38 53 34 56 Z"
            fill="#70000D"
          />
          <path
            d="M40 50 C38 46 41 42 41 40 C43 43 45 44 44 47 C44 49 42 50 40 50 Z"
            fill="#F5B800"
          />

          {/* Right Laurel Branch */}
          <path
            d="M53 54 C56 52 62 52 66 55 L66 67 C62 64 56 64 53 66 Z"
            fill="#15803D"
          />
          <path
            d="M58 54 C61 57 60 62 56 65"
            stroke="#FFFDF7"
            strokeWidth="1.5"
          />

          {/* Banner bottom ribbon */}
          <path
            d="M20 75 L30 71 L50 78 L70 71 L80 75 L74 83 L50 87 L26 83 Z"
            fill="#70000D"
            stroke="#F5B800"
            strokeWidth="1"
          />
          {/* Year 1979 */}
          <text
            x="50"
            y="76"
            textAnchor="middle"
            fontSize="5.5"
            fontWeight="bold"
            fill="#F5B800"
            fontFamily="Arial, sans-serif"
          >
            1979
          </text>
        </svg>
      </div>

      {showText && (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              SAPC IntellySys
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-amber-50 text-amber-800 border border-amber-300 rounded-md">
              DSS v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            San Antonio de Padua College • Foundation of Pila, Laguna, Inc.
          </p>
        </div>
      )}
    </div>
  );
};
