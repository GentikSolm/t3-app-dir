/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import rehypeHighlight from "rehype-highlight";
await import("./src/env.mjs");

const withMDX = (await import("@next/mdx")).default({
  options: {
    rehypePlugins: [[rehypeHighlight(), {}]],
  },
});

const { withAxiom } = await import("next-axiom");

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
};

export default withAxiom(withMDX( config ));
