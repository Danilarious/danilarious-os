// Static manifest for Canvas Explorer (can be replaced by admin-provided feed)
export const CANVAS_MANIFEST = [
  {
    id: 'core-shapes',
    name: 'Core Shapes',
    description: 'Baseline vector shapes bundled with the OS.',
    category: 'shapes',
    items: [
      { id: 'circle', name: 'Circle', svg: '/assets/canvas/circle.svg' },
      { id: 'square', name: 'Square', svg: '/assets/canvas/square.svg' },
      { id: 'triangle', name: 'Triangle', svg: '/assets/canvas/triangle.svg' },
      { id: 'star', name: 'Star', svg: '/assets/canvas/star.svg' },
      { id: 'pentagon', name: 'Pentagon', svg: '/assets/canvas/pentagon.svg' },
    ],
  },
  {
    id: 'geo-brights',
    name: 'Geo Brights (stub)',
    description: 'Placeholder pack to illustrate manifest-driven assets.',
    category: 'icons',
    items: [
      { id: 'geo-01', name: 'Geo 01', svg: '/assets/canvas/circle.svg' },
      { id: 'geo-02', name: 'Geo 02', svg: '/assets/canvas/square.svg' },
      { id: 'geo-03', name: 'Geo 03', svg: '/assets/canvas/triangle.svg' },
    ],
  },
];
