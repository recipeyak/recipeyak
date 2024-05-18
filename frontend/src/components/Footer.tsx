import { clx } from "@/classnames"
import { GIT_SHA } from "@/settings"

export const Footer = (props: { className?: string }) => (
  <footer
    className={clx(
      "mt-auto flex items-center px-4 py-2 text-[14px]",
      props.className,
    )}
  >
    <span className="font-semibold print:hidden">
      Recipe Yak •{" "}
      <a
        href={`https://github.com/recipeyak/recipeyak/commit/${GIT_SHA}`}
        className="font-medium"
      >
        {GIT_SHA.slice(0, 7)}
      </a>
    </span>
  </footer>
)
