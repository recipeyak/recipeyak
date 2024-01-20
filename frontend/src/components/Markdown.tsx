import { omit } from "lodash-es"
import { findAndReplace } from "mdast-util-find-and-replace"
import React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm, { Root } from "remark-gfm"
import smartypants from "remark-smartypants"

import { clx } from "@/classnames"
import { Link } from "@/components/Routing"
import * as settings from "@/settings"
import { normalizeUnitsFracs } from "@/text"
import {
  THEME_CSS_BAKING_POWDER,
  THEME_CSS_BAKING_SODA,
} from "@/themeConstants"

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
  "ol",
  "ul",
  // allow our baking soda, baking powder replacer thing to work
  "span",
]

// Want to support all the styling related tags, but not ones that result in
// layout changing
const ALLOWED_INLINE_MARKDOWN_TYPES: (keyof Components)[] = [
  "text",
  "a",
  "em",
  "strong",
  "s",
]

function renderA({
  href,
  ...props
}: React.DetailedHTMLProps<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>) {
  const linkCss = "underline hover:no-underline"
  if (href?.startsWith(settings.DOMAIN)) {
    // If someone has pasted a raw RecipeYak link, simplify it, otherwise use
    // the actual children which is the `name` in markdown, i.e., [name](url)
    const to = new URL(href).pathname
    const isRecipeYakRecipeLink =
      Array.isArray(props.children) && props.children[0] === href
    const children = isRecipeYakRecipeLink ? to.substring(1) : props.children
    return (
      <Link
        {...omit(props, "node")}
        to={to}
        children={children}
        className={linkCss}
      />
    )
  }
  return <a {...omit(props, "node")} href={href} className={linkCss} />
}

function renderUl({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
>) {
  return (
    // avoid serializing react markdown node prop that gets passed down
    // aka avoid [object Object] in the DOM
    <ul {...omit(props, "node")} className="mb-2 list-inside list-disc">
      {children}
    </ul>
  )
}

function renderOl({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLOListElement>,
  HTMLOListElement
>) {
  return (
    <ol {...omit(props, "node")} className="mb-2 list-inside list-decimal">
      {children}
    </ol>
  )
}

function renderLi({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLLIElement>,
  HTMLLIElement
>) {
  return (
    <li {...omit(props, "node")} className="mb-1 last:mb-0">
      {children}
    </li>
  )
}

function renderP({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>) {
  return (
    // eslint-disable-next-line react/forbid-elements
    <p {...omit(props, "node")} className="mb-2 last:mb-0">
      {children}
    </p>
  )
}

function renderBlockQuote({
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLQuoteElement>,
  HTMLQuoteElement
>) {
  return (
    <blockquote
      {...omit(props, "node")}
      className="mb-2 border-y-0 border-l-[3px] border-r-0 border-solid border-l-[--color-border] pl-2"
    >
      {children}
    </blockquote>
  )
}

// setup a lot of renderers so we can style the individual tags
const renderers = {
  a: renderA,
  ul: renderUl,
  ol: renderOl,
  li: renderLi,
  p: renderP,
  blockquote: renderBlockQuote,
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

export function Markdown({
  children: text,
  inline,
  className,
}: {
  children: string
  inline?: boolean
  className?: string
}) {
  const allowedElements = inline
    ? ALLOWED_INLINE_MARKDOWN_TYPES
    : ALLOWED_MARKDOWN_TYPES
  const markdown = (
    <ReactMarkdown
      allowedElements={allowedElements}
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
  )
  return (
    <div
      children={markdown}
      className={clx(
        "cursor-auto select-text [word-break:break-word]",
        inline && "inline",
        className,
      )}
    />
  )
}
