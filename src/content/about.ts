/**
 * About page copy. Only facts you have given are used. Add real dates and
 * milestones to `journey` when you want them shown.
 */
export const aboutContent = {
  opening:
    "I'm Mohamed Suhail, a student of Computer Science and Engineering with a specialisation in Cyber Security.",
  background: [
    "I'm interested in software development, cybersecurity, technology innovation and entrepreneurship. I like exploring ideas, building practical projects, taking part in hackathons and turning concepts into working products.",
    "Studying cybersecurity changes how I build. I try to think about how something could fail or be abused while I'm still making it, rather than after.",
  ],
  interests: [
    { title: "Software", text: "Writing software that solves a concrete problem, from the first idea to something that runs." },
    { title: "Web", text: "Building websites and web applications that are fast, clear and pleasant to use." },
    { title: "Cybersecurity", text: "How systems are attacked and how they are defended. It is the focus of my degree." },
    { title: "Emerging technology", text: "Trying new tools early, mostly in hackathons and side projects." },
  ],
  building: [
    "Practical software: things a person can use today.",
    "Prototypes that answer a question quickly.",
    "Ideas that might become products, which is what NightBerrieZ is for.",
  ],
  approach: [
    { step: "Build the useful version", text: "Start with the smallest thing that works end to end." },
    { step: "Try to break it", text: "Look for the input, the edge case or the assumption that fails." },
    { step: "Fix it and keep what you learned", text: "Each failure becomes a better next version." },
  ],
  /** Add dated milestones here when you want them on the page. */
  journey: [
    { label: "Now", title: "Studying", text: "Pursuing a B.Tech in Computer Science and Engineering (Cyber Security)." },
    { label: "Now", title: "Competing", text: "Taking part in hackathons, including ones I've won." },
    { label: "Now", title: "Building", text: "Software projects, and NightBerrieZ." },
  ],
} as const;
