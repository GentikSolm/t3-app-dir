import type { MDXComponents } from "mdx/types";
import Image from "next/image";

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from
// other libraries.

// This file is required to use MDX in `app` directory.
export const MDXStyles = {
  h1: ({ children }) => <h1 className="mb-2 mt-5">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-5">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-3">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-2 mt-3">{children}</h4>,
  h5: ({ children }) => <h5 className="mb-2 mt-3">{children}</h5>,
  p: ({ children }) => <p className="my-0">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="my-1">{children}</blockquote>
  ),
  a: ({ children, href }) => (
    <a href={href} className="my-0">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-0">{children}</ul>,
  ol: ({ children }) => <ol className="my-0">{children}</ol>,
  li: ({ children }) => <li className="my-0">{children}</li>,
  pre: ({ children }) => <pre className="my-2">{children}</pre>,
  img: ({ children, src, alt }) => (
    <Image
      alt={alt ?? ""}
      src={src ?? ""}
      quality={100}
      className="my-2 rounded-xl"
      width={1920}
      height={1080}
    >
      {children}
    </Image>
  ),
} as MDXComponents;

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    ...MDXStyles,
    ...components,
  };
}
