/**
 * Copy for the About part of the journey. Edit here; nothing is hard-coded in the component.
 * Only facts supplied by Mohamed Suhail. Do not add achievements, results, competition names,
 * statistics or professional claims that are not his. Interests are interests, not credentials.
 */
export const beyond = {
  title: "Beyond the profile",

  /** Moment 01 */
  identity: {
    label: "A little about me",
    name: "Mohamed Suhail",
    text: "I'm Mohamed Suhail, currently pursuing Computer Science and Engineering with a specialization in Cyber Security at VIT University.",
    text2: "I'm interested in exploring how technology works, how ideas become products, and how engineering can solve meaningful problems.",
  },

  /** Moment 02 */
  interests: {
    label: "Always exploring what's next.",
    items: ["Cybersecurity", "Artificial Intelligence", "AI Agents", "Quantum Computing", "Cryptography"],
    productLead: "Beyond the technology, I'm drawn to how meaningful products come to exist:",
    product: ["Real-world problems", "What people actually need", "Product discovery", "Product strategy", "Product management"],
  },

  /** Moment 03 */
  journey: {
    headline: "Curious by nature. Always building.",
    text: "I enjoy participating in hackathons and innovation challenges, experimenting with new ideas, solving technical problems and bringing people together to build. Winning is rewarding, but I also value what I learn from challenges that do not go as planned.",
    team: "I also like organizing teams and working with people who see problems differently.",
  },

  /** Moment 04 */
  focus: {
    label: "Currently developing",
    name: "NightBerrieZ",
    href: "/#building",
    cta: "About NightBerrieZ",
  },

  /** Drop a portrait at public/images/mohamed-suhail.jpg (any name works if you change it here). */
  photo: {
    src: "/images/mohamed-suhail.jpg",
    alt: "Portrait of Mohamed Suhail",
    caption: "Portrait",
    initials: "MS",
  },
} as const;
