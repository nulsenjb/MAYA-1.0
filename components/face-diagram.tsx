'use client';

import { useState } from 'react';

type Zone = 'blush' | 'bronzer' | 'highlight' | 'contour' | 'eye';

const zones: Zone[] = ['blush', 'bronzer', 'highlight', 'contour', 'eye'];

const zoneLabels: Record<Zone, string> = {
  blush: 'Blush',
  bronzer: 'Bronzer',
  highlight: 'Highlight',
  contour: 'Contour',
  eye: 'Eye',
};

const zoneColors: Record<Zone, string> = {
  blush: '#C4543A',
  bronzer: '#7A5520',
  highlight: '#B89020',
  contour: '#404040',
  eye: '#5A2870',
};

type LegendItem = { title: string; text: string };

const legendData: Record<Zone, LegendItem[]> = {
  blush: [
    { title: 'Apples of the cheeks', text: 'Smile and apply from the apple upward toward the temple in a soft C-shape. Blend upward, never downward.' },
    { title: 'For warm undertones', text: 'Stay in the peach-rose family. Cool-toned blush will fight your natural warmth.' },
  ],
  bronzer: [
    { title: 'Hairline arc', text: 'Light sweep along the hairline where sun would naturally hit.' },
    { title: 'Under cheekbone — the 3 shape', text: 'Draw an imaginary 3 on each side: hairline → cheekbone → jawline. Blend toward the ear.' },
    { title: 'Jawline (optional)', text: 'A light pass adds warmth without reading as contour.' },
  ],
  highlight: [
    { title: 'Top of cheekbone', text: 'Tap on the highest point just below the outer eye.' },
    { title: 'Forehead center', text: 'A soft glow above the brow bone opens up the face.' },
    { title: "Cupid's bow", text: 'A light touch above the lip center catches light and creates fullness.' },
  ],
  contour: [
    { title: 'Temples', text: 'Recedes the outer forehead and frames the face. Blend thoroughly.' },
    { title: 'Cheek hollows', text: 'Find the hollow by gently sucking in cheeks. Apply below cheekbone, blend upward.' },
    { title: 'Jawline', text: 'Defines the jaw and creates lift. Keep subtle for daytime.' },
  ],
  eye: [
    { title: 'Lid', text: 'Apply transition color first across the entire lid before building depth.' },
    { title: 'Crease', text: 'Windshield-wiper motion in the crease. Build gradually.' },
    { title: 'Lower lashline (optional)', text: 'Soft diffuse below lashes adds depth without liner.' },
  ],
};

export function FaceDiagram() {
  const [zone, setZone] = useState<Zone>('blush');
  const color = zoneColors[zone];

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {zones.map((z) => (
          <button
            key={z}
            onClick={() => setZone(z)}
            className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
              zone === z
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-500 border-neutral-200'
            }`}
          >
            {zoneLabels[z]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex-shrink-0 max-w-[200px] mx-auto sm:mx-0">
          <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" width="200" height="260">
            <defs>
              <filter id="fd-blur" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
              <clipPath id="fd-face">
                <ellipse cx="100" cy="130" rx="72" ry="90" />
              </clipPath>
            </defs>

            {/* Neck */}
            <path d="M85 220 Q88 238 88 250 L112 250 Q112 238 115 220Z" fill="#F0EBE5" stroke="#BCBCBC" strokeWidth="1.5" />
            {/* Face oval */}
            <ellipse cx="100" cy="130" rx="72" ry="90" fill="#F5F0EB" stroke="#BCBCBC" strokeWidth="1.5" />
            {/* Inner highlight plane */}
            <ellipse cx="100" cy="115" rx="38" ry="55" fill="#FAFAFA" opacity="0.7" />

            {/* Brows */}
            <rect x="58" y="91" width="24" height="4" rx="2" fill="#BCBCBC" />
            <rect x="118" y="91" width="24" height="4" rx="2" fill="#BCBCBC" />

            {/* Eyes — almond outlines */}
            <path d="M58 118 Q72 110 86 118 Q72 126 58 118Z" fill="none" stroke="#C4C4C4" strokeWidth="1.2" />
            <path d="M114 118 Q128 110 142 118 Q128 126 114 118Z" fill="none" stroke="#C4C4C4" strokeWidth="1.2" />

            {/* Nose centerline */}
            <line x1="100" y1="108" x2="100" y2="152" stroke="#C4C4C4" strokeWidth="1" opacity="0.45" />

            {/* Lips */}
            <path d="M84 168 Q100 162 116 168" fill="none" stroke="#C4C4C4" strokeWidth="1.3" />
            <path d="M84 168 Q100 178 116 168" fill="none" stroke="#C4C4C4" strokeWidth="1.3" />

            {/* Color washes clipped to face */}
            <g clipPath="url(#fd-face)">
              {zone === 'blush' && <>
                <ellipse cx="55" cy="150" rx="28" ry="18" fill={color} opacity="0.38" filter="url(#fd-blur)" />
                <ellipse cx="145" cy="150" rx="28" ry="18" fill={color} opacity="0.38" filter="url(#fd-blur)" />
              </>}

              {zone === 'bronzer' && <>
                <path d="M38 100 Q60 60 100 52 Q140 60 162 100" fill="none" stroke={color} strokeWidth="14" opacity="0.28" filter="url(#fd-blur)" />
                <path d="M32 148 Q42 168 60 172" fill="none" stroke={color} strokeWidth="14" opacity="0.28" filter="url(#fd-blur)" />
                <path d="M168 148 Q158 168 140 172" fill="none" stroke={color} strokeWidth="14" opacity="0.28" filter="url(#fd-blur)" />
                <path d="M52 205 Q76 222 100 226 Q124 222 148 205" fill="none" stroke={color} strokeWidth="14" opacity="0.28" filter="url(#fd-blur)" />
              </>}

              {zone === 'highlight' && <>
                <ellipse cx="100" cy="80" rx="18" ry="10" fill={color} opacity="0.38" filter="url(#fd-blur)" />
                <ellipse cx="58" cy="148" rx="12" ry="8" fill={color} opacity="0.38" filter="url(#fd-blur)" />
                <ellipse cx="142" cy="148" rx="12" ry="8" fill={color} opacity="0.38" filter="url(#fd-blur)" />
                <ellipse cx="100" cy="198" rx="10" ry="5" fill={color} opacity="0.38" filter="url(#fd-blur)" />
              </>}

              {zone === 'contour' && <>
                <path d="M30 108 Q28 130 34 155" fill="none" stroke={color} strokeWidth="12" opacity="0.28" filter="url(#fd-blur)" />
                <path d="M170 108 Q172 130 166 155" fill="none" stroke={color} strokeWidth="12" opacity="0.28" filter="url(#fd-blur)" />
                <path d="M36 162 Q50 178 68 182" fill="none" stroke={color} strokeWidth="10" opacity="0.28" filter="url(#fd-blur)" />
                <path d="M164 162 Q150 178 132 182" fill="none" stroke={color} strokeWidth="10" opacity="0.28" filter="url(#fd-blur)" />
              </>}

              {zone === 'eye' && <>
                <ellipse cx="72" cy="120" rx="22" ry="10" fill={color} opacity="0.32" filter="url(#fd-blur)" />
                <ellipse cx="128" cy="120" rx="22" ry="10" fill={color} opacity="0.32" filter="url(#fd-blur)" />
                <ellipse cx="72" cy="112" rx="18" ry="7" fill={color} opacity="0.22" filter="url(#fd-blur)" />
                <ellipse cx="128" cy="112" rx="18" ry="7" fill={color} opacity="0.22" filter="url(#fd-blur)" />
              </>}
            </g>

            {/* Dashed indicator rings */}
            {zone === 'blush' && <>
              <ellipse cx="55" cy="150" rx="22" ry="13" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <ellipse cx="145" cy="150" rx="22" ry="13" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <circle cx="55" cy="150" r="4" fill={color} />
              <circle cx="145" cy="150" r="4" fill={color} />
            </>}

            {zone === 'bronzer' && <>
              <path d="M38 100 Q60 60 100 52 Q140 60 162 100" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <path d="M32 148 Q42 168 60 172" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <path d="M168 148 Q158 168 140 172" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <circle cx="100" cy="58" r="4" fill={color} />
              <circle cx="42" cy="162" r="4" fill={color} />
              <circle cx="158" cy="162" r="4" fill={color} />
            </>}

            {zone === 'highlight' && <>
              <ellipse cx="100" cy="80" rx="14" ry="7" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <ellipse cx="58" cy="148" rx="9" ry="6" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <ellipse cx="142" cy="148" rx="9" ry="6" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <ellipse cx="100" cy="198" rx="7" ry="4" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <circle cx="100" cy="80" r="4" fill={color} />
              <circle cx="58" cy="148" r="4" fill={color} />
              <circle cx="142" cy="148" r="4" fill={color} />
              <circle cx="100" cy="198" r="4" fill={color} />
            </>}

            {zone === 'contour' && <>
              <path d="M30 108 Q28 130 34 155" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <path d="M170 108 Q172 130 166 155" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <path d="M36 162 Q50 178 68 182" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <path d="M164 162 Q150 178 132 182" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <circle cx="32" cy="133" r="4" fill={color} />
              <circle cx="168" cy="133" r="4" fill={color} />
              <circle cx="52" cy="175" r="4" fill={color} />
              <circle cx="148" cy="175" r="4" fill={color} />
            </>}

            {zone === 'eye' && <>
              <path d="M52 120 Q72 108 92 120" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <path d="M108 120 Q128 108 148 120" fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="3 2" opacity="0.8" />
              <circle cx="72" cy="116" r="4" fill={color} />
              <circle cx="128" cy="116" r="4" fill={color} />
            </>}
          </svg>
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {legendData[zone].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <div>
                <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-neutral-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
