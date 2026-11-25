/**
 * Copy for the "Beyond the profile" world-map section. Edit here; nothing is hard-coded in the component.
 * Only facts supplied by Mohamed Suhail. Do not add achievements, experience or skills that are not his.
 */
export const beyond = {
  title: "Beyond the profile",

  identity: {
    label: "About me",
    name: "Mohamed Suhail",
    lines: ["Computer Science & Engineering", "Cyber Security · VIT University"],
  },

  interests: {
    label: "Areas of interest",
    items: ["Cybersecurity", "Artificial Intelligence", "AI Agents", "Quantum Computing", "Cryptography"],
  },

  journey: {
    headline: "Curious by nature. Driven by innovation.",
    text: "I enjoy exploring emerging technologies, taking part in hackathons and innovation challenges, solving hard problems, and connecting with people who love building meaningful things.",
  },

  focus: {
    label: "Currently focused on",
    lead: "Developing",
    name: "NightBerrieZ.",
    href: "/nightberriez",
    cta: "About NightBerrieZ",
  },

  /** Drop a portrait at public/images/profile-placeholder.jpg (any name works if you change it here). */
  photo: {
    src: "/images/profile-placeholder.jpg",
    alt: "Portrait of Mohamed Suhail",
    caption: "Portrait",
    initials: "MS",
  },
} as const;
