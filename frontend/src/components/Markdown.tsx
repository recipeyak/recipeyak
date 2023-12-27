import { findAndReplace } from "mdast-util-find-and-replace"
import React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm, { Root } from "remark-gfm"
import smartypants from "remark-smartypants"

import { Link } from "@/components/Routing"
import * as settings from "@/settings"
import { normalizeUnitsFracs } from "@/text"
import { styled } from "@/theme"
import {
  THEME_CSS_BAKING_POWDER,
  THEME_CSS_BAKING_SODA,
} from "@/themeConstants"

const MarkdownWrapper = styled.div`
  a {
    text-decoration: underline;
  }
  a:hover {
    text-decoration: none;
  }
  ul {
    list-style-type: disc;
    padding-left: 1.5rem;
  }

  ol {
    padding-left: 1.5rem;
  }

  p:not(:last-child) {
    margin-bottom: 0.5rem;
  }

  blockquote {
    padding-left: 0.25rem;
    border-left: 3px solid var(--color-border);
    & > p {
      margin-bottom: 0rem;
    }

    &:last-of-type > p {
      margin-bottom: 0.5rem;
    }
  }
`

const ALLOWED_MARKDOWN_TYPES: (keyof Components)[] = [
  "text",
  "s",
  "br",
  "blockquote",
  "p",
  "strong",
  "em",
  "li",
  "a",
  "link",
  "ol",
  "ul",
  // allow our baking soda, baking powder replacer thing to work
  "span",
]

function renderLink({
  href,
  ...props
}: React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>) {
  if (href?.startsWith(settings.DOMAIN)) {
    const to = new URL(href).pathname
    return <Link {...props} to={to} children={to.substring(1)} />
  }
  return <a {...props} href={href} />
}

const renderers = {
  a: renderLink,
}

function remarkHighlightBakingSodaAndPowder() {
  return (tree: Root): undefined => {
    findAndReplace(tree, [
      /(baking soda|baking powder)/gi,
      (value: string) => {
        // Took me a while to figure out how to inject a <span> into the markdown
        // Spelunking through the various packages lead me to:
        // https://github.com/rhysd/remark-emoji/blob/e4b9918ede15cddd6316f410cc53b83ed9afe549/index.js#L22-L37
        //
        // We need to dupe the value otherwise it doesn't typecheck, runtime seems fine
        const cls =
          value === "baking soda"
            ? THEME_CSS_BAKING_SODA
            : THEME_CSS_BAKING_POWDER
        return {
          type: "text",
          value,
          data: {
            hName: "span",
            hProperties: {
              class: cls,
            },
            hChildren: [{ type: "text", value }],
          },
        }
      },
    ])
  }
}

export function Markdown({ children: text }: { children: string }) {
  return (
    <MarkdownWrapper className="cursor-auto select-text [word-break:break-word]">
      <ReactMarkdown
        allowedElements={ALLOWED_MARKDOWN_TYPES}
        remarkPlugins={[
          // enable auto-linking of urls & other github flavored markdown features
          remarkGfm,
          // make new lines behave like github comments
          //
          //   Mars is
          //   the fourth planet
          //
          // becomes:
          //
          //   <p>Mars is<br>
          //   the fourth planet</p>
          //
          // instead of without the plugin:
          //
          //   <p>Mars is
          //   the fourth planet</p>
          //
          remarkBreaks,
          // auto convert -- to em dash and similar
          smartypants,
          remarkHighlightBakingSodaAndPowder,
        ]}
        children={normalizeUnitsFracs(text)}
        components={renderers}
        unwrapDisallowed
      />
    </MarkdownWrapper>
  )
}
