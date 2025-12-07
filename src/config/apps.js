// src/config/apps.js
// Central app registry for the Danilarious OS

import { AboutWindowContent } from "../windows/AboutWindowContent";
import { SettingsWindowContent } from "../windows/SettingsWindowContent";
import { ProjectsWindowContent } from "../windows/ProjectsWindowContent";
import { CanvasAppShell } from "../apps/CanvasApp/CanvasAppShell";

// Icon imports
import aboutIcon from "../assets/icons/eye.svg";
import settingsIcon from "../assets/icons/radio.svg";
import projectsIcon from "../assets/icons/yellow.svg";
import canvasIcon from "../assets/icons/canvas.svg";

export const APPS = {
  about: {
    id: "about",
    title: "About",
    iconId: "about",
    iconSrc: aboutIcon,
    emoji: "🧠",
    component: AboutWindowContent,
    defaultWindow: {
      x: 300,
      y: 140,
      width: 420,
      height: 260,
    },
  },
  settings: {
    id: "settings",
    title: "Settings",
    iconId: "settings",
    iconSrc: settingsIcon,
    emoji: "⚙️",
    component: SettingsWindowContent,
    defaultWindow: {
      x: 220,
      y: 160,
      width: 320,
      height: 260,
    },
  },
  projects: {
    id: "projects",
    title: "Projects",
    iconId: "projects",
    iconSrc: projectsIcon,
    emoji: "📁",
    component: ProjectsWindowContent,
    defaultWindow: {
      x: 260,
      y: 200,
      width: 420,
      height: 280,
    },
  },
  canvas: {
    id: "canvas",
    title: "Danilarious Canvas",
    iconId: "canvas",
    iconSrc: canvasIcon,
    emoji: "🎨",
    component: CanvasAppShell,
    defaultWindow: {
      x: 100,
      y: 100,
      width: 900,
      height: 700,
    },
  },
};

// Desktop icon configuration
export const DESKTOP_ICONS = [
  {
    id: "about",
    label: "About.me",
    appId: "about",
  },
  {
    id: "settings",
    label: "Settings",
    appId: "settings",
  },
  {
    id: "projects",
    label: "Projects",
    appId: "projects",
  },
  {
    id: "canvas",
    label: "Canvas",
    appId: "canvas",
  },
];
