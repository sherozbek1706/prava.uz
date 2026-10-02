const fs = require('fs');
const path = require('path');

const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const signs = {
  'glavnaya_doroga.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <rect x="100" y="-40" width="140" height="140" transform="rotate(45 100 100)" fill="#FFFFFF" rx="10" stroke="#333" stroke-width="2"/>
  <rect x="100" y="-20" width="115" height="115" transform="rotate(45 100 100)" fill="#FFD700" rx="6" stroke="#DAA520" stroke-width="2"/>
</svg>`.trim(),

  'kirish_taqiqlangan.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <circle cx="100" cy="100" r="92" fill="#D32F2F" stroke="#B71C1C" stroke-width="4"/>
  <rect x="35" y="82" width="130" height="36" rx="6" fill="#FFFFFF"/>
</svg>`.trim(),

  'tezlik_60.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <circle cx="100" cy="100" r="92" fill="#FFFFFF" stroke="#D32F2F" stroke-width="22"/>
  <text x="100" y="125" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="74" fill="#111827" text-anchor="middle">60</text>
</svg>`.trim(),

  'piyodalar_otish.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <rect x="10" y="10" width="180" height="180" rx="16" fill="#1E88E5" stroke="#1565C0" stroke-width="4"/>
  <polygon points="100,28 172,168 28,168" fill="#FFFFFF"/>
  <!-- Zebras -->
  <line x1="45" y1="158" x2="155" y2="158" stroke="#1E88E5" stroke-width="6"/>
  <line x1="55" y1="145" x2="145" y2="145" stroke="#1E88E5" stroke-width="6"/>
  <line x1="65" y1="132" x2="135" y2="132" stroke="#1E88E5" stroke-width="6"/>
  <!-- Walking figure -->
  <circle cx="100" cy="62" r="10" fill="#1E88E5"/>
  <path d="M100 75 L100 110 L84 135 M100 110 L116 135 M90 90 L115 95" stroke="#1E88E5" stroke-width="7" stroke-linecap="round"/>
</svg>`.trim(),

  'aylanma_harakat.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <circle cx="100" cy="100" r="92" fill="#1E88E5" stroke="#1565C0" stroke-width="4"/>
  <!-- 3 curved circular arrows -->
  <path d="M100,32 A68,68 0 0,1 160,135" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/>
  <polygon points="172,130 152,148 162,118" fill="#FFFFFF"/>
  <path d="M140,155 A68,68 0 0,1 42,125" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/>
  <polygon points="36,132 46,108 58,135" fill="#FFFFFF"/>
  <path d="M50,85 A68,68 0 0,1 125,36" fill="none" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/>
  <polygon points="120,24 140,42 112,48" fill="#FFFFFF"/>
</svg>`.trim(),

  'quvib_otish_taqiq.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <circle cx="100" cy="100" r="92" fill="#FFFFFF" stroke="#D32F2F" stroke-width="20"/>
  <!-- Red car (left) -->
  <rect x="42" y="80" width="42" height="52" rx="8" fill="#D32F2F"/>
  <rect x="48" y="90" width="30" height="22" rx="4" fill="#FFFFFF"/>
  <!-- Black car (right) -->
  <rect x="116" y="80" width="42" height="52" rx="8" fill="#212121"/>
  <rect x="122" y="90" width="30" height="22" rx="4" fill="#FFFFFF"/>
</svg>`.trim(),

  'svetofor.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <rect x="65" y="15" width="70" height="170" rx="18" fill="#263238" stroke="#37474F" stroke-width="4"/>
  <!-- Red light glowing -->
  <circle cx="100" cy="50" r="22" fill="#FF1744" stroke="#D50000" stroke-width="3"/>
  <circle cx="95" cy="45" r="6" fill="#FFA4A2" opacity="0.6"/>
  <!-- Yellow light dim -->
  <circle cx="100" cy="100" r="22" fill="#5D4037" stroke="#3E2723" stroke-width="2"/>
  <!-- Green light dim -->
  <circle cx="100" cy="150" r="22" fill="#1B5E20" stroke="#004D40" stroke-width="2"/>
</svg>`.trim(),

  'chorraha_tartibi.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="450" height="450">
  <!-- Crossroad layout -->
  <rect width="300" height="300" fill="#4CAF50"/>
  <!-- Roads -->
  <rect x="105" y="0" width="90" height="300" fill="#37474F"/>
  <rect x="0" y="105" width="300" height="90" fill="#37474F"/>
  <!-- Road markings -->
  <line x1="150" y1="0" x2="150" y2="105" stroke="#FFFFFF" stroke-dasharray="10 8" stroke-width="3"/>
  <line x1="150" y1="195" x2="150" y2="300" stroke="#FFFFFF" stroke-dasharray="10 8" stroke-width="3"/>
  <line x1="0" y1="150" x2="105" y2="150" stroke="#FFFFFF" stroke-dasharray="10 8" stroke-width="3"/>
  <line x1="195" y1="150" x2="300" y2="150" stroke="#FFFFFF" stroke-dasharray="10 8" stroke-width="3"/>
  
  <!-- Sign 2.1 (Main road) on vertical road bottom -->
  <g transform="translate(112, 210) scale(0.18)">
    <rect x="100" y="-40" width="140" height="140" transform="rotate(45 100 100)" fill="#FFFFFF" rx="10"/>
    <rect x="100" y="-20" width="115" height="115" transform="rotate(45 100 100)" fill="#FFD700" rx="6"/>
  </g>
  
  <!-- Car 1 (Blue - on main road moving straight) -->
  <rect x="156" y="220" width="30" height="50" rx="6" fill="#1E88E5" stroke="#fff" stroke-width="2"/>
  <text x="171" y="252" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">1</text>
  
  <!-- Car 2 (Red - on secondary road waiting to turn) -->
  <rect x="30" y="115" width="50" height="30" rx="6" fill="#E53935" stroke="#fff" stroke-width="2"/>
  <text x="55" y="136" font-size="16" font-weight="bold" fill="#fff" text-anchor="middle">2</text>
</svg>`.trim(),

  'bolalar.svg': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
  <polygon points="100,15 190,175 10,175" fill="#FFFFFF" stroke="#D32F2F" stroke-width="18" stroke-linejoin="round"/>
  <!-- Children silhouette running -->
  <circle cx="85" cy="80" r="8" fill="#111"/>
  <path d="M85 88 L85 118 L70 142 M85 118 L100 142 M75 102 L105 100" stroke="#111" stroke-width="6" stroke-linecap="round"/>
  <circle cx="120" cy="95" r="6" fill="#111"/>
  <path d="M120 101 L120 125 L110 145 M120 125 L132 145 M112 112 L132 110" stroke="#111" stroke-width="5" stroke-linecap="round"/>
</svg>`.trim()
};

for (const [filename, content] of Object.entries(signs)) {
  fs.writeFileSync(path.join(uploadDir, filename), content);
  console.log(`Generated sign image: ${filename}`);
}
