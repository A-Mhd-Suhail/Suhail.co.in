/**
 * NightBerrieZ: keep the exact capitalization.
 * It is presented as something being built. Do not add hiring, funding, revenue,
 * customers, team members or a logo here unless they are real.
 */
export const startup = {
  name: "NightBerrieZ",
  statement: "I'm building NightBerrieZ.",
  status: "In progress",
  invitation:
    "Something interesting is taking shape at NightBerrieZ. If you're curious about what we're building, enjoy solving problems, or would like to contribute ideas and collaborate, you're always welcome to connect.",
  /** Introductory positioning, not a verified mission. Edit freely. */
  belief:
    "NightBerrieZ is something I'm building with an interest in turning ideas into meaningful products. I believe interesting things happen when curious people come together.",
  /** Ways someone might join in. Edit to match what's true. */
  ways: [
    { title: "Explore ideas", text: "Bring a half-formed idea and think it through together." },
    { title: "Share a perspective", text: "Tell me what you'd build, or what you think is broken." },
    { title: "Build something", text: "If we click, make a small first version of it." },
  ],
  website: null as string | null,
  logo: "/startup/nightberriez-logo.webp" as string | null,
} as const;
