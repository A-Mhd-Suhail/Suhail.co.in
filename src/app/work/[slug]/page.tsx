import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicProjects } from "@/content/projects";
import { CaseStudy } from "@/components/work/CaseStudy";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return publicProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = publicProjects().find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default async function WorkCaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const all = publicProjects();
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const next = all[(index + 1) % all.length];
  return <CaseStudy project={all[index]} next={next.slug !== slug ? next : undefined} />;
}
