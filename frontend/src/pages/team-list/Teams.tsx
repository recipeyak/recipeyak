import { assertNever } from "@/assert"
import { Loader } from "@/components/Loader"
import { Link } from "@/components/Routing"
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "@/components/Table"
import { formatHumanDateTime } from "@/date"
import { pathTeamDetail } from "@/paths"
import { useTeamList } from "@/queries/teamList"

export function TeamsList() {
  const teams = useTeamList()
  if (teams.isPending) {
    return <Loader />
  }

  if (teams.isError) {
    return <div>failure loading</div>
  }

  if (teams.data.length === 0) {
    return (
      <div className="self-center text-sm text-[var(--color-text-muted)]">
        No teams.
      </div>
    )
  }

  const columns = [
    {
      id: "teamName" as const,
      name: "Name",
    },
    {
      id: "createdAt" as const,
      name: "Created",
    },
    {
      id: "members" as const,
      name: "Members",
    },
  ]

  return (
    <Table label="invites">
      <TableHeader columns={columns}>
        {(column) => {
          return <Column isRowHeader>{column.name}</Column>
        }}
      </TableHeader>
      <TableBody items={teams.data}>
        {(team) => {
          return (
            <Row columns={columns}>
              {(column) => {
                if (column.id === "members") {
                  return (
                    <Cell>{new Intl.NumberFormat().format(team.members)}</Cell>
                  )
                } else if (column.id === "teamName") {
                  return (
                    <Cell>
                      <Link
                        to={pathTeamDetail({
                          teamId: team.id.toString(),
                        })}
                      >
                        {team.name}
                      </Link>
                    </Cell>
                  )
                } else if (column.id === "createdAt") {
                  return (
                    <Cell>{formatHumanDateTime(new Date(team.created))}</Cell>
                  )
                } else {
                  assertNever(column)
                }
              }}
            </Row>
          )
        }}
      </TableBody>
    </Table>
  )
}
