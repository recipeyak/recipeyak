export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-b-2 border-solid border-[var(--color-border)] bg-[var(--color-background)] px-[0.2rem] py-[0.1rem] text-[var(--color-text)]">
      {children}
    </kbd>
  )
}
