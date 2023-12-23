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

export function Cell({
  children,
  ...rest
}: Omit<CellProps, "className" | "children"> & { children: React.ReactNode }) {
  return (
    <AriaCell
      className="group-selected:focus-visible:outline-white truncate px-4 py-2 align-middle focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-slate-600"
      {...rest}
    >
      <div className="flex items-center">{children}</div>
    </AriaCell>
  )
}

export function Table({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="relative max-h-[280px] w-full overflow-auto rounded-md border border-solid border-[var(--color-border)] bg-[var(--color-background-calendar-day)] shadow">
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
      className="sticky top-0 cursor-default whitespace-nowrap border-0 border-b border-solid border-[var(--color-border)] p-0 text-left font-bold outline-none first:rounded-tl-md last:rounded-tr-md focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-slate-600"
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
