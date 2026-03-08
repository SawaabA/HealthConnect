import React from 'react';

export default function Logo({ className = "w-9 h-9" }) {
    return (
        <div className={`flex items-center justify-center bg-[#011a12] rounded-full p-1.5 shadow-sm overflow-hidden ${className}`}>
            <svg viewBox="0 10 340 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
                <g>
                    <line x1="170" y1="56" x2="170" y2="298" stroke="white" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="170" cy="43" r="14" fill="white" />
                    <circle cx="170" cy="43" r="8.5" fill="#34d399" />
                    <circle cx="166" cy="39" r="2.5" fill="rgba(255,255,255,0.65)" />
                </g>
                <g>
                    <path d="M 170,62 C 148,44 116,22 80,24 C 48,26 14,46 8,68 C 8,84 14,100 22,96 C 28,92 36,70 44,70 C 44,88 50,104 58,100 C 64,96 74,71 82,71 C 82,89 90,104 98,100 C 104,96 114,73 122,73 C 122,89 130,101 138,97 C 144,93 152,76 160,75 C 162,82 165,79 170,78" fill="white" opacity="0.96" />
                    <path d="M 170,66 C 148,50 118,32 84,36 C 54,40 22,56 14,74" fill="none" stroke="rgba(186,255,230,0.5)" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 170,71 C 150,58 124,44 94,48 C 68,52 40,64 28,80" fill="none" stroke="rgba(186,255,230,0.32)" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M 170,76 C 152,66 130,56 106,58 C 86,60 64,70 52,84" fill="none" stroke="rgba(186,255,230,0.2)" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M 10,72 C 8,82 14,92 24,94" fill="none" stroke="rgba(186,255,230,0.4)" strokeWidth="2" strokeLinecap="round" />
                </g>
                <g>
                    <path d="M 170,62 C 192,44 224,22 260,24 C 292,26 326,46 332,68 C 332,84 326,100 318,96 C 312,92 304,70 296,70 C 296,88 290,104 282,100 C 276,96 266,71 258,71 C 258,89 250,104 242,100 C 236,96 226,73 218,73 C 218,89 210,101 202,97 C 196,93 188,76 180,75 C 178,82 175,79 170,78" fill="white" opacity="0.96" />
                    <path d="M 170,66 C 192,50 222,32 256,36 C 286,40 318,56 326,74" fill="none" stroke="rgba(186,255,230,0.5)" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M 170,71 C 190,58 216,44 246,48 C 272,52 300,64 312,80" fill="none" stroke="rgba(186,255,230,0.32)" strokeWidth="2.8" strokeLinecap="round" />
                    <path d="M 170,76 C 188,66 210,56 234,58 C 254,60 276,70 288,84" fill="none" stroke="rgba(186,255,230,0.2)" strokeWidth="2.2" strokeLinecap="round" />
                    <path d="M 330,72 C 332,82 326,92 316,94" fill="none" stroke="rgba(186,255,230,0.4)" strokeWidth="2" strokeLinecap="round" />
                </g>
                <g>
                    <path d="M 170,295 Q 194,280 170,264 Q 141,248 170,232 Q 204,212 170,192 Q 132,170 170,148 Q 216,122 170,98 Q 130,78 138,68" fill="none" stroke="#6ee7b7" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                    <ellipse cx="135" cy="63" rx="10" ry="8" fill="#6ee7b7" transform="rotate(-35 135 63)" />
                    <circle cx="131" cy="59" r="2.5" fill="#011a12" />
                    <path d="M 127,66 L 120,70 M 127,66 L 122,73" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" />
                </g>
                <g>
                    <path d="M 170,295 Q 146,280 170,264 Q 199,248 170,232 Q 136,212 170,192 Q 208,170 170,148 Q 124,122 170,98 Q 210,78 202,68" fill="none" stroke="#a7f3d0" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                    <ellipse cx="205" cy="63" rx="10" ry="8" fill="#a7f3d0" transform="rotate(35 205 63)" />
                    <circle cx="209" cy="59" r="2.5" fill="#011a12" />
                    <path d="M 213,66 L 220,70 M 213,66 L 218,73" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" />
                </g>
            </svg>
        </div>
    );
}
