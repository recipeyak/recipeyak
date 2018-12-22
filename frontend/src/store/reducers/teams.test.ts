import { teams, ITeamsState, ITeam } from "./teams"

import {
  addTeam,
  setLoadingTeam,
  setLoadingTeamMembers,
  setTeam404,
  setTeamMembers,
  setLoadingTeamRecipes,
  setTeamRecipes,
  setUpdatingUserTeamLevel,
  setUserTeamLevel,
  setDeletingMembership,
  deleteMembership,
  setSendingTeamInvites,
  setTeams,
  setLoadingTeams,
  setCreatingTeam,
  setTeam,
  setCopyingTeam,
  deleteTeam,
  updateTeamById
} from "../actions"

describe("Teams", () => {
  it("Adds team to team object", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        members: []
      },
      allIds: [1]
    }
    const recipe = {
      id: 123,
      name: "other team name",
      members: []
    }
    const afterState: ITeamsState = {
      ...beforeState,
      [recipe.id]: recipe,
      allIds: [1, recipe.id]
    }

    expect(teams(beforeState, addTeam(recipe))).toEqual(afterState)
  })

  it("Updates team object", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        loading: false,
        members: []
      },
      allIds: [1]
    }
    const recipe = {
      id: 1,
      name: "other team name"
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "other team name",
        loading: false,
        members: []
      },
      allIds: [1]
    }

    expect(teams(beforeState, addTeam(recipe))).toEqual(afterState)
  })

  it("Adds all teams given", () => {
    const beforeState = {
      1: {
        id: 1,
        name: "add all teams",
        members: []
      },
      4: {
        id: 4,
        name: "blah",
        loadingTeam: false,
        members: []
      },
      allIds: [1, 4]
    }

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

    const afterState: ITeamsState = {
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
      },
      allIds: [1, 4, 2, 3]
    }

    expect(teams(beforeState, setTeams(data))).toEqual(afterState)
  })

  it("Sets loading team data", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        members: []
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        loadingTeam: true,
        members: []
      },
      allIds: []
    }

    expect(teams(beforeState, setLoadingTeam(1, true))).toEqual(afterState)
  })

  it("Sets loading team members", () => {
    const beforeState = {
      1: {
        id: 1,
        name: "team name",
        members: []
      },
      allIds: []
    }

    const afterState = {
      1: {
        id: 1,
        name: "team name",
        loadingMembers: true,
        members: []
      },
      allIds: []
    }

    expect(teams(beforeState, setLoadingTeamMembers(1, true))).toEqual(
      afterState
    )
  })

  it("Sets loading team recipes", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        members: []
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        loadingRecipes: true,
        members: []
      },
      allIds: []
    }

    expect(teams(beforeState, setLoadingTeamRecipes(1, true))).toEqual(
      afterState
    )
  })

  it("Sets team to 404", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        members: []
      },
      2: {
        id: 2,
        name: "another team name",
        members: []
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        error404: true,
        members: []
      },
      2: {
        id: 2,
        name: "another team name",
        members: []
      },
      allIds: []
    }

    expect(teams(beforeState, setTeam404(1, true))).toEqual(afterState)
  })

  it("Sets team members", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        members: []
      },
      2: {
        id: 2,
        name: "another team name",
        members: []
      },
      allIds: []
    }

    const members = [
      {
        id: 1,
        user: {
          id: 2,
          email: "blah@blah.com",
          avatar_url: "http://lksjdflsjdf",
          has_usable_password: false
        }
      }
    ]

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        members: {
          1: members[0]
        }
      },
      2: {
        id: 2,
        name: "another team name",
        members: []
      },
      allIds: []
    }

    expect(teams(beforeState, setTeamMembers(1, members))).toEqual(afterState)
  })

  it("Sets team recipes", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        members: []
      },
      2: {
        id: 2,
        name: "another team name",
        members: []
      },
      allIds: []
    }

    const recipes = [
      {
        id: 1,
        user: {
          id: 2,
          email: "blah@blah.com",
          avatar_url: "http://lksjdflsjdf"
        }
      }
    ]

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "team name",
        members: [],
        recipes: [1]
      },
      2: {
        id: 2,
        name: "another team name",
        members: []
      },
      allIds: []
    }

    expect(teams(beforeState, setTeamRecipes(1, recipes))).toEqual(afterState)
  })

  it("Sets updating membership data", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foo",
        members: []
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "foo",
        updating: true,
        members: []
      },
      allIds: []
    }

    expect(teams(beforeState, setUpdatingUserTeamLevel(1, true))).toEqual(
      afterState
    )
  })

  it("Sets user team membership level", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "contributor",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    expect(teams(beforeState, setUserTeamLevel(1, 2, "admin"))).toEqual(
      afterState
    )
  })

  it("Sets team membership to deleting", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            deleting: true,
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    expect(teams(beforeState, setDeletingMembership(1, 2, true))).toEqual(
      afterState
    )
  })

  it("deletes team membership", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            deleting: true,
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          }
        }
      },
      allIds: []
    }

    expect(teams(beforeState, deleteMembership(1, 2))).toEqual(afterState)
  })

  it("Sets the sending team invites in team", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        sendingTeamInvites: true,
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    expect(teams(beforeState, setSendingTeamInvites(1, true))).toEqual(
      afterState
    )
  })

  it("Sets teams to loading", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      loading: true,
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    expect(teams(beforeState, setLoadingTeams(true))).toEqual(afterState)
  })

  it("Sets team to have a creating attribute", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    const afterState: ITeamsState = {
      creating: true,
      1: {
        id: 1,
        name: "foobar",
        members: {
          1: {
            id: 1,
            level: "admin",
            user: {
              id: 1,
              email: "foo",
              avatar_url: "foo.com"
            }
          },
          2: {
            id: 2,
            level: "admin",
            user: {
              id: 2,
              email: "bar",
              avatar_url: "bar.com"
            }
          }
        }
      },
      allIds: []
    }

    expect(teams(beforeState, setCreatingTeam(true))).toEqual(afterState)
  })

  it("Sets team", () => {
    const team: ITeam = {
      id: 2,
      name: "buzz",
      members: {}
    }

    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {}
      },
      allIds: [1]
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "foobar",
        members: {}
      },
      [team.id]: team,
      allIds: [1, team.id]
    }

    expect(teams(beforeState, setTeam(team.id, team))).toEqual(afterState)
  })

  it("deletes team", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "foo",
        members: []
      },
      2: {
        id: 2,
        name: "bar",
        members: []
      },
      3: {
        id: 3,
        name: "buzz",
        members: []
      },
      allIds: [1, 3, 2]
    }

    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "foo",
        members: []
      },
      3: {
        id: 3,
        name: "buzz",
        members: []
      },
      allIds: [1, 3]
    }

    expect(teams(beforeState, deleteTeam(2))).toEqual(afterState)
  })

  it("sets copying team status", () => {
    const beforeState: ITeamsState = {
      allIds: []
    }
    const afterState: ITeamsState = {
      copying: true,
      allIds: []
    }
    expect(teams(beforeState, setCopyingTeam(true))).toEqual(afterState)
  })

  it("updates team partially", () => {
    const beforeState: ITeamsState = {
      1: {
        id: 1,
        name: "Acme Inc.",
        members: [],
        loading: false
      },
      allIds: [1]
    }
    const afterState: ITeamsState = {
      1: {
        id: 1,
        name: "InnoTech",
        members: [],
        loading: false
      },
      allIds: [1]
    }
    expect(teams(beforeState, updateTeamById(1, { name: "InnoTech" }))).toEqual(
      afterState
    )
  })
})
