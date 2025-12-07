// src/data/projects.js
// Project metadata for the Projects window gallery
// Acts as a file-based "database" until backend is added

export const PROJECTS = [
  {
    id: "plastic-thoughts",
    title: "Plastic Thoughts",
    type: "series",
    status: "in-progress",
    slug: "plastic-thoughts",
    thumb: "/art/plastic-thoughts/thumb.svg",
    images: [
      "/art/plastic-thoughts/01.svg",
      "/art/plastic-thoughts/02.svg",
    ],
    tags: ["sculpture", "desk", "memphis"],
    shortDescription:
      "Surreal desk sculptures and characters, bold color blocks and Memphis energy.",
    year: 2025,
  },
  {
    id: "danilarious-world-level-1",
    title: "Danilarious World: Level 1",
    type: "interactive",
    status: "in-progress",
    slug: "danilarious-world-level-1",
    thumb: "/art/danilarious-world/thumb.svg",
    images: [
      "/art/danilarious-world/hero-scene.svg",
    ],
    tags: ["characters", "world-building", "interactive"],
    shortDescription:
      "Intro world with core characters and interactive hero scene.",
    year: 2025,
  },
];

// Helper to get project by ID or slug
export const getProject = (idOrSlug) => {
  return PROJECTS.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug
  );
};

// Helper to filter by status
export const getProjectsByStatus = (status) => {
  return PROJECTS.filter((p) => p.status === status);
};

// Helper to filter by tag
export const getProjectsByTag = (tag) => {
  return PROJECTS.filter((p) => p.tags.includes(tag));
};
