import { clx } from "@/classnames"
import { GIT_SHA } from "@/settings"
import { useSentryFeedback } from "@/useSentryFeedback"

export const Footer = (props: { className?: string }) => {
  const feedback = useSentryFeedback()
  return (
    <footer
      className={clx(
        "mt-auto flex items-center justify-between px-4 py-6 text-[14px]",
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
        </a>{" "}
      </span>
      {feedback && (
        <span className="font-semibold print:hidden">
          <div
            className="cursor-pointer "
            onClick={() => {
              void feedback.open()
            }}
          >
            Send Feedback
          </div>
        </span>
      )}
    </footer>
  )
}
