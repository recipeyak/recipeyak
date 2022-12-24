import {
  deleteMembership,
  deleteTeam,
  fetchTeam,
  fetchTeamMembers,
  fetchTeams,
  IMember,
  ITeam,
  ITeamsState,
  setCreatingTeam,
  setDeletingMembership,
  setSendingTeamInvites,
  setTeam,
  setUpdatingUserTeamLevel,
  setUserTeamLevel,
  teams,
  updateTeamById,
} from "@/store/reducers/teams"

function teamStateWith(team: ITeam | ITeam[]): ITeamsState {
  if (Array.isArray(team)) {
    return teams(undefined, fetchTeams.success(team))
  }
  return teams(undefined, setTeam({ id: team.id, team }))
}

const baseMember: IMember = {
  id: 1,
  user: {
    id: 2,
    email: "bar",
    name: "bar@example.com",
    avatar_url: "bar.com",
    dark_mode_enabled: false,
    schedule_team: null,
  },
  level: "read",
  is_active: true,
}

describe("Teams", () => {
  it("Adds team to team object", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: [],
    })
    const recipe = {
      id: 123,
      name: "other team name",
      members: [],
    }
    const afterState = {
      ...beforeState,
      byId: {
        ...beforeState.byId,
        [recipe.id]: {
          ...recipe,
          loadingTeam: false,
        },
      },
      allIds: [1, recipe.id],
    }

    expect(teams(beforeState, fetchTeam.success(recipe))).toEqual(afterState)
  })

  it("Updates team object", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: [],
    })
    const recipe = {
      id: 1,
      name: "other team name",
      members: [],
    }

    const afterState = teamStateWith({
      id: 1,
      name: "other team name",
      members: [],
      loadingTeam: false,
    })

    expect(teams(beforeState, fetchTeam.success(recipe))).toEqual(afterState)
  })

  it("Adds all teams given", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "add all teams",
        members: [],
      },
      {
        id: 4,
        name: "blah",
        loadingTeam: false,
        members: [],
      },
    ])

    const data: ITeam[] = [
      {
        id: 2,
        name: "another name",
        members: [],
      },
      {
        id: 3,
        name: "yet another name",
        members: [],
      },
      {
        id: 4,
        name: "blah",
        members: [],
      },
    ]

    const afterState: ITeamsState = {
      byId: {
        1: {
          id: 1,
          name: "add all teams",
          members: [],
        },
        2: {
          id: 2,
          name: "another name",
          members: [],
        },
        3: {
          id: 3,
          name: "yet another name",
          members: [],
        },
        4: {
          id: 4,
          name: "blah",
          loadingTeam: false,
          members: [],
        },
      },
      allIds: [1, 4, 2, 3],
      status: "success",
    }

    expect(teams(beforeState, fetchTeams.success(data))).toEqual(afterState)
  })

  it("Sets loading team data", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: [],
    })

    const afterState = teamStateWith({
      id: 1,
      name: "team name",
      loadingTeam: true,
      members: [],
    })

    expect(teams(beforeState, fetchTeam.request(1))).toEqual(afterState)
  })

  it("Sets loading team members", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: [],
    })

    const afterState = teamStateWith({
      id: 1,
      name: "team name",
      loadingMembers: true,
      members: [],
    })

    expect(teams(beforeState, fetchTeamMembers.request(1))).toEqual(afterState)
  })

  it("Sets team to 404", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "team name",
        members: [],
      },
      {
        id: 2,
        name: "another team name",
        members: [],
      },
    ])

    const afterState = teamStateWith([
      {
        id: 1,
        name: "team name",
        error404: true,
        members: [],
        loadingTeam: false,
      },
      {
        id: 2,
        name: "another team name",
        members: [],
      },
    ])

    expect(
      teams(beforeState, fetchTeam.failure({ id: 1, error404: true })),
    ).toEqual(afterState)
  })

  it("Sets team members", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "team name",
        members: [],
      },
      {
        id: 2,
        name: "another team name",
        members: [],
      },
    ])

    const members: IMember[] = [
      {
        ...baseMember,
        id: 1,
        user: {
          id: 2,
          email: "blah@blah.com",
          name: "bar@example.com",
          avatar_url: "http://lksjdflsjdf",
          has_usable_password: false,
          dark_mode_enabled: false,
          schedule_team: null,
        },
      },
    ]

    const afterState = teamStateWith([
      {
        id: 1,
        loadingMembers: false,
        name: "team name",
        members: {
          [members[0].id]: members[0],
        },
      },
      {
        id: 2,
        name: "another team name",
        members: [],
      },
    ])

    expect(
      teams(beforeState, fetchTeamMembers.success({ id: 1, members })),
    ).toEqual(afterState)
  })

  it("Sets updating membership data", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "foo",
      members: [],
    })

    const afterState = teamStateWith({
      id: 1,
      name: "foo",
      updating: true,
      members: [],
    })

    expect(
      teams(beforeState, setUpdatingUserTeamLevel({ id: 1, updating: true })),
    ).toEqual(afterState)
  })

  it("Sets user team membership level", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "contributor",
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    const afterState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    expect(
      teams(
        beforeState,
        setUserTeamLevel({ teamID: 1, membershipID: 2, level: "admin" }),
      ),
    ).toEqual(afterState)
  })

  it("Sets team membership to deleting", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    const afterState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          deleting: true,
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    expect(
      teams(
        beforeState,
        setDeletingMembership({ teamID: 1, membershipID: 2, val: true }),
      ),
    ).toEqual(afterState)
  })

  it("deletes team membership", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          deleting: true,
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    const afterState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    expect(
      teams(beforeState, deleteMembership({ teamID: 1, membershipID: 2 })),
    ).toEqual(afterState)
  })

  it("Sets the sending team invites in team", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    const afterState = teamStateWith({
      id: 1,
      name: "foobar",
      sendingTeamInvites: true,
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    expect(
      teams(beforeState, setSendingTeamInvites({ teamID: 1, val: true })),
    ).toEqual(afterState)
  })

  it("Sets teams to loading", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    const afterState: ITeamsState = {
      ...teamStateWith({
        id: 1,
        name: "foobar",
        members: {
          1: {
            ...baseMember,
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              name: "bar@example.com",
              avatar_url: "foo.com",
              dark_mode_enabled: false,
              schedule_team: null,
            },
          },
          2: {
            ...baseMember,
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              name: "bar@example.com",
              avatar_url: "bar.com",
              dark_mode_enabled: false,
              schedule_team: null,
            },
          },
        },
      }),
      status: "loading",
    }

    expect(teams(beforeState, fetchTeams.request())).toEqual(afterState)
  })

  it("Sets team to have a creating attribute", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "foobar",
      members: {
        1: {
          ...baseMember,
          id: 1,
          level: "admin",
          user: {
            id: 1,
            email: "foo",
            name: "bar@example.com",
            avatar_url: "foo.com",

            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            name: "bar@example.com",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            schedule_team: null,
          },
        },
      },
    })

    const afterState: ITeamsState = {
      status: "initial",
      creating: true,
      byId: {
        1: {
          id: 1,
          name: "foobar",
          members: {
            1: {
              ...baseMember,
              id: 1,
              level: "admin",
              user: {
                id: 1,
                email: "foo",
                name: "bar@example.com",
                avatar_url: "foo.com",
                dark_mode_enabled: false,
                schedule_team: null,
              },
            },
            2: {
              ...baseMember,
              id: 2,
              level: "admin",
              user: {
                id: 2,
                email: "bar",
                name: "bar@example.com",
                avatar_url: "bar.com",
                dark_mode_enabled: false,
                schedule_team: null,
              },
            },
          },
        },
      },
      allIds: [1],
    }

    expect(teams(beforeState, setCreatingTeam(true))).toEqual(afterState)
  })

  it("Sets team", () => {
    const team: ITeam = {
      id: 2,
      name: "buzz",
      members: {},
    }

    const beforeState: ITeamsState = {
      status: "initial",
      byId: {
        1: {
          id: 1,
          name: "foobar",
          members: {},
        },
      },
      allIds: [1],
    }

    const afterState: ITeamsState = {
      status: "initial",
      byId: {
        1: {
          id: 1,
          name: "foobar",
          members: {},
        },
        [team.id]: team,
      },
      allIds: [1, team.id],
    }

    expect(teams(beforeState, setTeam({ id: team.id, team }))).toEqual(
      afterState,
    )
  })

  it("deletes team", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "foo",
        members: [],
      },
      {
        id: 2,
        name: "bar",
        members: [],
      },
      {
        id: 3,
        name: "buzz",
        members: [],
      },
    ])

    const afterState = teamStateWith([
      {
        id: 1,
        name: "foo",
        members: [],
      },
      {
        id: 3,
        name: "buzz",
        members: [],
      },
    ])

    expect(teams(beforeState, deleteTeam(2))).toEqual(afterState)
  })

  it("updates team partially", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "Acme Inc.",
      members: [],
    })
    const afterState = teamStateWith({
      id: 1,
      name: "InnoTech",
      members: [],
    })
    expect(
      teams(
        beforeState,
        updateTeamById({
          id: 1,
          teamKeys: { id: 1, name: "InnoTech", members: [] },
        }),
      ),
    ).toEqual(afterState)
  })
})
