import { Download } from "react-feather"

import { pathRecipesExportJson, pathRecipesExportYaml } from "@/paths"

function ExportLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-md border border-solid border-[--color-border] bg-[--color-background-card] px-3 py-2 font-medium"
    >
      <Download size={20} />
      <span>{children}</span>
    </a>
  )
}

export function Export() {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xl font-bold">Export</label>
      <div className="flex gap-2">
        <ExportLink href={pathRecipesExportYaml({})}>recipes.yaml</ExportLink>
        <ExportLink href={pathRecipesExportJson({})}>recipes.json</ExportLink>
      </div>
    </div>
  )
}
