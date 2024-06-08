import { Link } from "react-router-dom"

import { GIT_SHA } from "@/settings"

export const Footer = () => (
  <footer className="mt-auto flex items-center justify-between px-4 py-6 text-[14px]">
    <span className="font-semibold print:hidden">
      Recipe Yak •{" "}
      <a
        href={`https://github.com/recipeyak/recipeyak/commit/${GIT_SHA}`}
        className="font-medium"
      >
        {GIT_SHA.slice(0, 7)}
      </a>{" "}
    </span>
    <span className="font-semibold print:hidden">
      <Link to="">Send Feedback</Link>
    </span>
  </footer>
)
