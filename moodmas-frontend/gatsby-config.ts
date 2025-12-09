import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: `MoodMas`,
    siteUrl: `https://moodmas.local`,
    description: `AI-powered morning mood battle - Team Left vs Team Right!`,
  },
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-typescript",
  ],
};

export default config;

