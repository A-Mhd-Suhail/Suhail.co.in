/**
 * Personal profile: the single source of truth for name and contact details.
 * The email is temporary, so change it here and every page updates.
 *
 * NAME RULE: the name is always "Mohamed Suhail".
 */
export const profile = {
  name: "Mohamed Suhail",
  headline: "Make it work. Then try to break it.",
  lede: "I build software and test ideas the way a security person would: build the useful version first, then look for where it fails.",
  roles: ["Developer", "Cybersecurity enthusiast"],

  education: {
    degree: "B.Tech in Computer Science and Engineering (Cyber Security)",
    status: "Currently pursuing",
  },

  contact: {
    email: "amhdsuhail2007@gmail.com",
    phoneDisplay: "+91 81489 50249",
    /** E.164, used for tel: links */
    phoneE164: "+918148950249",
    /** Digits with country code, used for wa.me links */
    whatsapp: "918148950249",
    country: "India",
  },

  /** Text engraved on the hero visiting card. Edit here; nothing else is hard-coded. */
  card: {
    label: "Personal identity",
    index: "01 / 01",
    name: "SUHAIL.",
    role: "Cyber Security Enthusiast",
    school: "VIT University",
    building: "Building NightBerrieZ",
  },

  /** Path to a PDF in /public (e.g. "/resume.pdf"). null hides the download link. */
  resumeUrl: null as string | null,

  /** Replace with the real domain once deployed. */
  siteUrl: "https://suhail.co.in",
} as const;
