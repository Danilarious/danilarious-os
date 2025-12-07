// src/windows/ProjectsWindowContent.jsx
import { PROJECTS } from "../data/projects";

export function ProjectsWindowContent() {
  return (
    <div className="space-y-3 text-[12px] leading-relaxed">
      <p>
        Explore ongoing and completed projects. Each will eventually open its
        own window or deep-link into a gallery / case study.
      </p>

      <div className="space-y-2">
        {PROJECTS.map((project) => (
          <div
            key={project.id}
            className="border border-black/40 bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.35)] flex items-start justify-between px-3 py-2"
          >
            <div className="pr-4">
              <div className="font-bold mb-1">{project.title}</div>
              <div>{project.shortDescription}</div>
              <div className="text-[10px] mt-1 opacity-60">
                {project.tags.join(" • ")} • {project.year}
              </div>
            </div>

            <button className="text-[11px] uppercase border border-black px-2 py-1 bg-[#F5F4EF] hover:bg-black hover:text-white transition">
              {project.status === "in-progress" ? "OPEN" : project.status}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
