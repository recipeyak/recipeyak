import { teams } from './teams'

import {
  addTeam,
  setLoadingTeam,
  setLoadingTeamMembers,
  setLoadingTeamInvites,
  setTeam404,
  setTeamMembers,
  setTeamInvites,
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
  setMovingTeam,
  setCopyingTeam,
  deleteTeam,
} from '../actions'

describe('Teams', () => {
  it('Adds team to team object', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name'
      },
      allIds: [1],
    }
    const recipe = {
      id: 123,
      name: 'other team name',
    }
    const afterState = {
      ...beforeState,
      [recipe.id]: recipe,
      allIds: [1, recipe.id],
    }

    expect(
      teams(beforeState, addTeam(recipe))
    ).toEqual(afterState)
  })

  it('Updates team object', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name',
        loading: false,
      },
      allIds: [1],
    }
    const recipe = {
      id: 1,
      name: 'other team name',
    }

    const afterState = {
      1: {
        id: 1,
        name: 'other team name',
        loading: false,
      },
      allIds: [1],
    }

    expect(
      teams(beforeState, addTeam(recipe))
    ).toEqual(afterState)
  })

  it('Adds all teams given', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'add all teams'
      },
      4: {
        id: 4,
        name: 'blah',
        loadingTeam: false,
      },
      allIds: [1, 4],
    }

    const data = [{
      id: 2,
      name: 'another name',
    }, {
      id: 3,
      name: 'yet another name',
    }, {
      id: 4,
      name: 'blah',
    }]

    const afterState = {
      1: {
        id: 1,
        name: 'add all teams'
      },
      2: {
        id: 2,
        name: 'another name'
      },
      3: {
        id: 3,
        name: 'yet another name',
      },
      4: {
        id: 4,
        name: 'blah',
        loadingTeam: false,
      },
      allIds: [1, 4, 2, 3],
    }

    expect(
      teams(beforeState, setTeams(data))
    ).toEqual(afterState)
  })

  it('Sets loading team data', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name',
      }
    }

    const afterState = {
      1: {
        id: 1,
        name: 'team name',
        loadingTeam: true,
      }
    }

    expect(
      teams(beforeState, setLoadingTeam(1, true))
    ).toEqual(afterState)
  })

  it('Sets loading team members', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name'
      }
    }

    const afterState = {
      1: {
        id: 1,
        name: 'team name',
        loadingMembers: true,
      }
    }

    expect(
      teams(beforeState, setLoadingTeamMembers(1, true))
    ).toEqual(afterState)
  })

  it('Sets loading team invites', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name'
      }
    }

    const afterState = {
      1: {
        id: 1,
        name: 'team name',
        loadingInvites: true,
      }
    }

    expect(
      teams(beforeState, setLoadingTeamInvites(1, true))
    ).toEqual(afterState)
  })

  it('Sets loading team recipes', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name'
      }
    }

    const afterState = {
      1: {
        id: 1,
        name: 'team name',
        loadingRecipes: true,
      }
    }

    expect(
      teams(beforeState, setLoadingTeamRecipes(1, true))
    ).toEqual(afterState)
  })

  it('Sets team to 404', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name'
      },
      2: {
        id: 2,
        name: 'another team name'
      },
    }

    const afterState = {
      1: {
        id: 1,
        name: 'team name',
        error404: true,
      },
      2: {
        id: 2,
        name: 'another team name'
      },
    }

    expect(
      teams(beforeState, setTeam404(1, true))
    ).toEqual(afterState)
  })

  it('Sets team members', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name'
      },
      2: {
        id: 2,
        name: 'another team name'
      },
    }

    const members = [{
      id: 1,
      user: {
        id: 2,
        email: 'blah@blah.com',
        avatar_url: 'http://lksjdflsjdf'
      }
    }]

    const afterState = {
      1: {
        id: 1,
        name: 'team name',
        members: {
          1: members[0]
        }
      },
      2: {
        id: 2,
        name: 'another team name'
      },
    }

    expect(
      teams(beforeState, setTeamMembers(1, members))
    ).toEqual(afterState)
  })

  it('Sets team invites', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name'
      },
      2: {
        id: 2,
        name: 'another team name'
      },
    }

    const invites = [{
      id: 1,
      user: {
        id: 2,
        email: 'blah@blah.com',
        avatar_url: 'http://lksjdflsjdf'
      }
    }]

    const afterState = {
      1: {
        id: 1,
        name: 'team name',
        invites: {
          1: invites[0]
        }
      },
      2: {
        id: 2,
        name: 'another team name'
      },
    }

    expect(
      teams(beforeState, setTeamInvites(1, invites))
    ).toEqual(afterState)
  })

  it('Sets team recipes', () => {
    const beforeState = {
      1: {
        id: 1,
        name: 'team name'
      },
      2: {
        id: 2,
        name: 'another team name'
      },
    }

    const recipes = [{
      id: 1,
      user: {
        id: 2,
        email: 'blah@blah.com',
        avatar_url: 'http://lksjdflsjdf'
      }
    }]

    const afterState = {
      1: {
        id: 1,
        name: 'team name',
        recipes: [
          1
        ]
      },
      2: {
        id: 2,
        name: 'another team name'
      },
    }

    expect(
      teams(beforeState, setTeamRecipes(1, recipes))
    ).toEqual(afterState)
  })

  it('Sets updating membership data', () => {
    const beforeState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      }
    }

    const afterState = {
      1: {
        id: 1,
        updating: true,
        user: {
          id: 2,
        }
      }
    }

    expect(
      teams(beforeState, setUpdatingUserTeamLevel(1, true))
    ).toEqual(afterState)
  })

  it('Sets user team membership level', () => {
    const beforeState = {
      1: {
        id: 1,
        members: {
          1: {
            level: 'admin',
            user: {
              id: 1
            }
          },
          2: {
            level: 'contributor',
            user: {
              id: 2,
            }
          },
        }
      }
    }

    const afterState = {
      1: {
        id: 1,
        members: {
          1: {
            level: 'admin',
            user: {
              id: 1
            }
          },
          2: {
            level: 'admin',
            user: {
              id: 2,
            }
          },
        }
      }
    }

    expect(
      teams(beforeState, setUserTeamLevel(1, 2, 'admin'))
    ).toEqual(afterState)
  })

  it('Sets team membership to deleting', () => {
    const beforeState = {
      1: {
        id: 1,
        members: {
          1: {
            level: 'admin',
            user: {
              id: 1
            }
          },
          2: {
            level: 'admin',
            user: {
              id: 2,
            }
          },
        }
      }
    }

    const afterState = {
      1: {
        id: 1,
        members: {
          1: {
            level: 'admin',
            user: {
              id: 1
            }
          },
          2: {
            deleting: true,
            level: 'admin',
            user: {
              id: 2,
            }
          },
        }
      }
    }
    expect(
      teams(beforeState, setDeletingMembership(1, 2, true))
    ).toEqual(afterState)
  })

  it('deletes team membership', () => {
    const beforeState = {
      1: {
        id: 1,
        members: {
          1: {
            level: 'admin',
            user: {
              id: 1
            }
          },
          2: {
            level: 'admin',
            user: {
              id: 2,
            }
          },
        }
      }
    }

    const afterState = {
      1: {
        id: 1,
        members: {
          1: {
            level: 'admin',
            user: {
              id: 1
            }
          },
        }
      }
    }
    expect(
      teams(beforeState, deleteMembership(1, 2, true))
    ).toEqual(afterState)
  })

  it('Sets the sending team invites in team', () => {
    const beforeState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
      2: {
        id: 2,
        user: {
          id: 3
        }
      }
    }

    const afterState = {
      1: {
        id: 1,
        sendingTeamInvites: true,
        user: {
          id: 2,
        }
      },
      2: {
        id: 2,
        user: {
          id: 3
        }
      }
    }

    expect(
      teams(beforeState, setSendingTeamInvites(1, true))
    ).toEqual(afterState)
  })

  it('Sets teams to loading', () => {
    const beforeState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
      2: {
        id: 2,
        user: {
          id: 3
        }
      }
    }

    const afterState = {
      loading: true,
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
      2: {
        id: 2,
        user: {
          id: 3
        }
      }
    }

    expect(
      teams(beforeState, setLoadingTeams(true))
    ).toEqual(afterState)
  })

  it('Sets team to have a creating attribute', () => {
    const beforeState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
    }

    const afterState = {
      creating: true,
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
    }

    expect(
      teams(beforeState, setCreatingTeam(true))
    ).toEqual(afterState)
  })

  it('Sets team to have a creating attribute', () => {
    const beforeState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
    }

    const afterState = {
      creating: true,
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
    }

    expect(
      teams(beforeState, setCreatingTeam(true))
    ).toEqual(afterState)
  })

  it('Sets team', () => {
    const beforeState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
      allIds: [1]
    }

    const team = {
      id: 2,
      user: {
        id: 3
      }
    }

    const afterState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
      [team.id]: team,
      allIds: [1, team.id],
    }

    expect(
      teams(beforeState, setTeam(team.id, team))
    ).toEqual(afterState)
  })

  it('deletes team', () => {
    const beforeState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
      2: {
        id: 2,
        user: {
          id: 3
        }
      },
      3: {
        id: 3,
        user: {
          id: 3
        }
      },
      allIds: [1, 3, 2]
    }

    const afterState = {
      1: {
        id: 1,
        user: {
          id: 2,
        }
      },
      3: {
        id: 3,
        user: {
          id: 3
        }
      },
      allIds: [1, 3],
    }

    expect(
      teams(beforeState, deleteTeam(2))
    ).toEqual(afterState)
  })

  it('sets moving team status', () => {
    const beforeState = {
    }
    const afterState = {
      moving: true,
    }
    expect(
      teams(beforeState, setMovingTeam(true))
    ).toEqual(afterState)
  })

  it('sets copying team status', () => {
    const beforeState = {
    }
    const afterState = {
      copying: true,
    }
    expect(
      teams(beforeState, setCopyingTeam(true))
    ).toEqual(afterState)
  })
})
