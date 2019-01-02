import { teams, ITeamsState, ITeam } from "@/store/reducers/teams"
import * as a from "@/store/reducers/teams"
import { baseRecipe } from "@/store/reducers/recipes.test"

function teamStateWith(team: ITeam | ITeam[]): ITeamsState {
  if (Array.isArray(team)) {
    return teams(undefined, a.fetchTeams.success(team))
  }
  return teams(undefined, a.setTeam(team.id, team))
}

const baseMember: a.IMember = {
  id: 1,
  user: {
    id: 2,
    email: "bar",
    avatar_url: "bar.com",
    dark_mode_enabled: false,
    selected_team: null
  },
  level: "read",
  is_active: true
}

describe("Teams", () => {
  it("Adds team to team object", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: []
    })
    const recipe = {
      id: 123,
      name: "other team name",
      members: []
    }
    const afterState = {
      ...beforeState,
      byId: {
        ...beforeState.byId,
        [recipe.id]: recipe
      },
      allIds: [1, recipe.id]
    }

    expect(teams(beforeState, a.addTeam(recipe))).toEqual(afterState)
  })

  it("Updates team object", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: []
    })
    const recipe = {
      id: 1,
      name: "other team name",
      members: []
    }

    const afterState = teamStateWith({
      id: 1,
      name: "other team name",
      members: []
    })

    expect(teams(beforeState, a.addTeam(recipe))).toEqual(afterState)
  })

  it("Adds all teams given", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "add all teams",
        members: []
      },
      {
        id: 4,
        name: "blah",
        loadingTeam: false,
        members: []
      }
    ])

    const data: ITeam[] = [
      {
        id: 2,
        name: "another name",
        members: []
      },
      {
        id: 3,
        name: "yet another name",
        members: []
      },
      {
        id: 4,
        name: "blah",
        members: []
      }
    ]

    const afterState = {
      byId: {
        1: {
          id: 1,
          name: "add all teams",
          members: []
        },
        2: {
          id: 2,
          name: "another name",
          members: []
        },
        3: {
          id: 3,
          name: "yet another name",
          members: []
        },
        4: {
          id: 4,
          name: "blah",
          loadingTeam: false,
          members: []
        }
      },
      allIds: [1, 4, 2, 3],
      loading: false
    }

    expect(teams(beforeState, a.fetchTeams.success(data))).toEqual(afterState)
  })

  it("Sets loading team data", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: []
    })

    const afterState = teamStateWith({
      id: 1,
      name: "team name",
      loadingTeam: true,
      members: []
    })

    expect(teams(beforeState, a.setLoadingTeam(1, true))).toEqual(afterState)
  })

  it("Sets loading team members", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: []
    })

    const afterState = teamStateWith({
      id: 1,
      name: "team name",
      loadingMembers: true,
      members: []
    })

    expect(teams(beforeState, a.setLoadingTeamMembers(1, true))).toEqual(
      afterState
    )
  })

  it("Sets loading team recipes", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "team name",
      members: []
    })

    const afterState = teamStateWith({
      id: 1,
      name: "team name",
      loadingRecipes: true,
      members: []
    })

    expect(teams(beforeState, a.setLoadingTeamRecipes(1, true))).toEqual(
      afterState
    )
  })

  it("Sets team to 404", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "team name",
        members: []
      },
      {
        id: 2,
        name: "another team name",
        members: []
      }
    ])

    const afterState = teamStateWith([
      {
        id: 1,
        name: "team name",
        error404: true,
        members: []
      },
      {
        id: 2,
        name: "another team name",
        members: []
      }
    ])

    expect(teams(beforeState, a.setTeam404(1, true))).toEqual(afterState)
  })

  it("Sets team members", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "team name",
        members: []
      },
      {
        id: 2,
        name: "another team name",
        members: []
      }
    ])

    const members: a.IMember[] = [
      {
        ...baseMember,
        id: 1,
        user: {
          id: 2,
          email: "blah@blah.com",
          avatar_url: "http://lksjdflsjdf",
          has_usable_password: false,
          dark_mode_enabled: false,
          selected_team: null
        }
      }
    ]

    const afterState = teamStateWith([
      {
        id: 1,
        name: "team name",
        members: {
          [members[0].id]: members[0]
        }
      },
      {
        id: 2,
        name: "another team name",
        members: []
      }
    ])

    expect(teams(beforeState, a.setTeamMembers(1, members))).toEqual(afterState)
  })

  it("Sets team recipes", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "team name",
        members: []
      },
      {
        id: 2,
        name: "another team name",
        members: []
      }
    ])

    const recipes = [
      {
        ...baseRecipe,
        id: 1,
        user: {
          id: 2,
          email: "blah@blah.com",
          avatar_url: "http://lksjdflsjdf",
          dark_mode_enabled: false,
          selected_team: null
        }
      }
    ]

    const afterState = teamStateWith([
      {
        id: 1,
        name: "team name",
        members: [],
        recipes: [1]
      },
      {
        id: 2,
        name: "another team name",
        members: []
      }
    ])

    expect(teams(beforeState, a.setTeamRecipes(1, recipes))).toEqual(afterState)
  })

  it("Sets updating membership data", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "foo",
      members: []
    })

    const afterState = teamStateWith({
      id: 1,
      name: "foo",
      updating: true,
      members: []
    })

    expect(teams(beforeState, a.setUpdatingUserTeamLevel(1, true))).toEqual(
      afterState
    )
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "contributor",
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
    })

    expect(teams(beforeState, a.setUserTeamLevel(1, 2, "admin"))).toEqual(
      afterState
    )
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          deleting: true,
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
    })

    expect(teams(beforeState, a.setDeletingMembership(1, 2, true))).toEqual(
      afterState
    )
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          deleting: true,
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
    })

    expect(teams(beforeState, a.deleteMembership(1, 2))).toEqual(afterState)
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
    })

    expect(teams(beforeState, a.setSendingTeamInvites(1, true))).toEqual(
      afterState
    )
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
            avatar_url: "foo.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
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
              avatar_url: "foo.com",
              dark_mode_enabled: false,
              selected_team: null
            }
          },
          2: {
            ...baseMember,
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com",
              dark_mode_enabled: false,
              selected_team: null
            }
          }
        }
      }),
      loading: true
    }

    expect(teams(beforeState, a.fetchTeams.request())).toEqual(afterState)
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
            avatar_url: "foo.com",

            dark_mode_enabled: false,
            selected_team: null
          }
        },
        2: {
          ...baseMember,
          id: 2,
          level: "admin",
          user: {
            id: 2,
            email: "bar",
            avatar_url: "bar.com",
            dark_mode_enabled: false,
            selected_team: null
          }
        }
      }
    })

    const afterState: ITeamsState = {
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
                avatar_url: "foo.com",
                dark_mode_enabled: false,
                selected_team: null
              }
            },
            2: {
              ...baseMember,
              id: 2,
              level: "admin",
              user: {
                id: 2,
                email: "bar",
                avatar_url: "bar.com",
                dark_mode_enabled: false,
                selected_team: null
              }
            }
          }
        }
      },
      allIds: [1]
    }

    expect(teams(beforeState, a.setCreatingTeam(true))).toEqual(afterState)
  })

  it("Sets team", () => {
    const team: ITeam = {
      id: 2,
      name: "buzz",
      members: {}
    }

    const beforeState: ITeamsState = {
      byId: {
        1: {
          id: 1,
          name: "foobar",
          members: {}
        }
      },
      allIds: [1]
    }

    const afterState: ITeamsState = {
      byId: {
        1: {
          id: 1,
          name: "foobar",
          members: {}
        },
        [team.id]: team
      },
      allIds: [1, team.id]
    }

    expect(teams(beforeState, a.setTeam(team.id, team))).toEqual(afterState)
  })

  it("deletes team", () => {
    const beforeState = teamStateWith([
      {
        id: 1,
        name: "foo",
        members: []
      },
      {
        id: 2,
        name: "bar",
        members: []
      },
      {
        id: 3,
        name: "buzz",
        members: []
      }
    ])

    const afterState = teamStateWith([
      {
        id: 1,
        name: "foo",
        members: []
      },
      {
        id: 3,
        name: "buzz",
        members: []
      }
    ])

    expect(teams(beforeState, a.deleteTeam(2))).toEqual(afterState)
  })

  it("sets copying team status", () => {
    const beforeState: ITeamsState = {
      byId: {},
      allIds: []
    }
    const afterState: ITeamsState = {
      copying: true,
      byId: {},
      allIds: []
    }
    expect(teams(beforeState, a.setCopyingTeam(true))).toEqual(afterState)
  })

  it("updates team partially", () => {
    const beforeState = teamStateWith({
      id: 1,
      name: "Acme Inc.",
      members: []
    })
    const afterState = teamStateWith({
      id: 1,
      name: "InnoTech",
      members: []
    })
    expect(
      teams(
        beforeState,
        a.updateTeamById(1, { id: 1, name: "InnoTech", members: [] })
      )
    ).toEqual(afterState)
  })
})
