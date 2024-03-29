import {
  Cell as AriaCell,
  CellProps,
  Column as AriaColumn,
  Row as AriaRow,
  RowProps,
  Table as AriaTable,
  TableBody as AriaTableBody,
  TableHeader as AriaTableHeader,
} from "react-aria-components"

import { clx } from "@/classnames"

export function Cell({
  children,
  className,
  ...rest
}: Omit<CellProps, "children" | "className"> & {
  children: React.ReactNode
  className?: string
}) {
  return (
    <AriaCell
      className="group-selected:focus-visible:outline-white truncate px-4 py-2 align-middle focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-slate-600"
      {...rest}
    >
      <div className={clx("flex items-center", className)}>{children}</div>
    </AriaCell>
  )
}

export function Table({
  label,
  children,
  className,
  ...rest
}: {
  label: string
  children: React.ReactNode
  ["data-testid"]?: string
  className?: string
}) {
  return (
    <div
      className={clx(
        "relative w-full overflow-auto rounded-md border border-solid border-[--color-border] bg-[--color-background-calendar-day] shadow",
        className,
      )}
      {...rest}
    >
      <AriaTable
        aria-label={label}
        className="border-separate border-spacing-0"
      >
        {children}
      </AriaTable>
    </div>
  )
}

export const TableHeader = AriaTableHeader
export const TableBody = AriaTableBody

export function Column({
  isRowHeader,
  children,
}: {
  isRowHeader: boolean
  children: React.ReactNode
}) {
  return (
    <AriaColumn
      isRowHeader={isRowHeader}
      className="sticky top-0 cursor-default whitespace-nowrap border-0 border-b border-solid border-[--color-border] p-0 text-left font-bold outline-none first:rounded-tl-md last:rounded-tr-md focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-slate-600"
    >
      <div className="py-1 pl-4">{children}</div>
    </AriaColumn>
  )
}

export function Row<T extends object>(props: Omit<RowProps<T>, "className">) {
  return (
    <AriaRow<T>
      className="cursor-default outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-slate-600"
      {...props}
    />
  )
}
