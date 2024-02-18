import { formatAbsoluteDateTime, formatHumanDateTime } from "@/date"

export function NoteTimeStamp({ created }: { readonly created: string }) {
  const date = new Date(created)
  const prettyDate = formatAbsoluteDateTime(date, { includeYear: true })
  const humanizedDate = formatHumanDateTime(date)
  return (
    <time
      title={prettyDate}
      dateTime={created}
      className="text-[0.85rem] text-[--color-text-muted] print:text-black"
    >
      {humanizedDate}
    </time>
  )
}
