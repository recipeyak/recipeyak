import invites, {
  initialState,
  IInvitesState,
  IInvite
} from "@/store/reducers/invites"
import * as t from "@/store/reducers/invites"

const basicInvite: IInvite = {
  id: 1,
  active: false,
  team: {
    id: 1,
    name: "foo"
  },
  status: "open",
  creator: {
    id: 1,
    email: "foo@foo.com",
    avatar_url: "foo.com"
  }
}

describe("Invites", () => {
  it("sets invites", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open"
        }
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      loading: true,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open"
        }
      }
    }

    expect(invites(beforeState, t.fetchInvites.request())).toEqual(afterState)
  })
  it("sets invites", () => {
    const beforeState: IInvitesState = {
      loading: true,
      byId: {}
    }

    const newInvites: IInvite[] = [
      {
        ...basicInvite,
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      },
      {
        ...basicInvite,
        id: 2,
        active: false,
        team: {
          id: 2,
          name: "bar"
        },
        status: "open"
      }
    ]

    const afterState: IInvitesState = {
      loading: false,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open"
        },
        2: {
          ...basicInvite,
          id: 2,
          active: false,
          team: {
            id: 2,
            name: "bar"
          },
          status: "open"
        }
      }
    }

    expect(invites(beforeState, t.fetchInvites.success(newInvites))).toEqual(
      afterState
    )
  })

  it("sets invite to accepting", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open"
        },
        2: {
          ...basicInvite,
          id: 2,
          active: false,
          team: {
            id: 2,
            name: "bar"
          },
          status: "open"
        }
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open",
          accepting: true
        },
        2: {
          ...basicInvite,
          id: 2,
          active: false,
          team: {
            id: 2,
            name: "bar"
          },
          status: "open"
        }
      }
    }

    expect(invites(beforeState, t.acceptInvite.request(1))).toEqual(afterState)
  })

  it("sets invite to declining", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open"
        }
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open",
          declining: true
        }
      }
    }

    expect(invites(beforeState, t.declineInvite.request(1))).toEqual(afterState)
  })

  it("decline invite", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open"
        }
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "declined",
          declining: false
        }
      }
    }

    expect(invites(beforeState, t.declineInvite.success(1))).toEqual(afterState)
  })

  it("accept invite", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "open"
        }
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      byId: {
        1: {
          ...basicInvite,
          id: 1,
          active: false,
          team: {
            id: 1,
            name: "foo"
          },
          status: "accepted",
          accepting: false
        }
      }
    }

    expect(invites(beforeState, t.acceptInvite.success(1))).toEqual(afterState)
  })
})
