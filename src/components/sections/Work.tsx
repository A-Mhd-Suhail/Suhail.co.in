import { Headline } from "@/components/ui/Reveal";
import { WorkList } from "@/components/work/WorkList";
import { visibleProjects } from "@/content/projects";

export function Work() {
  const projects = visibleProjects();
  return (
    <section id="work" className="section rule-top" data-tone="light" aria-labelledby="work-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="label" style={{ marginBottom: "1rem" }}>Work</p>
            <Headline as="h2" className="h2" lines={["Things I've built"]} />
          </div>
          <p className="lede" id="work-title">Software from hackathons, coursework and my own experiments.</p>
        </div>
        {projects.length > 0 ? (
          <WorkList projects={projects} />
        ) : (
          <>
            <div className="frame-grid">
              {[0, 1, 2].map((i) => (
                <div className="frame" key={i}>
                  <strong>Project</strong>
                  <span>Overview, screenshots, features and links</span>
                </div>
              ))}
            </div>
            <p className="note">Projects are shown here once their details, screenshots and links are confirmed.</p>
          </>
        )}
      </div>
    </section>
  );
}
