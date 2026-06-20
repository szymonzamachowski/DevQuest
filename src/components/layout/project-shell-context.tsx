"use client";

import { createContext, useContext } from "react";

export type ProjectShellData = {
  id: string;
  title: string;
  campaignTitle: string;
  chapterTitle?: string | null;
};

const ProjectShellContext = createContext<ProjectShellData | null>(null);

export function ProjectShellProvider({
  project,
  children,
}: {
  project: ProjectShellData;
  children: React.ReactNode;
}) {
  return <ProjectShellContext.Provider value={project}>{children}</ProjectShellContext.Provider>;
}

export function useProjectShell() {
  return useContext(ProjectShellContext);
}
