// src/data/canvasAssets.js
// SVG assets for Canvas app

export const CANVAS_ASSETS = {
  shapes: [
    {
      id: 'circle',
      name: 'Circle',
      svg: '/assets/canvas/circle.svg',
      category: 'shapes',
    },
    {
      id: 'square',
      name: 'Square',
      svg: '/assets/canvas/square.svg',
      category: 'shapes',
    },
    {
      id: 'triangle',
      name: 'Triangle',
      svg: '/assets/canvas/triangle.svg',
      category: 'shapes',
    },
    {
      id: 'star',
      name: 'Star',
      svg: '/assets/canvas/star.svg',
      category: 'shapes',
    },
    {
      id: 'pentagon',
      name: 'Pentagon',
      svg: '/assets/canvas/pentagon.svg',
      category: 'shapes',
    },
  ],
};

// Flatten all assets for easy access
export const ALL_ASSETS = [
  ...CANVAS_ASSETS.shapes,
];

// Get asset by ID
export const getAsset = (id) => ALL_ASSETS.find((a) => a.id === id);
