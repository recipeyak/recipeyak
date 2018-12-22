import invites, { initialState, IInvitesState, IInvite } from "./invites"

import {
  setInvites,
  setLoadingInvites,
  setAcceptingInvite,
  setDecliningInvite,
  setDeclinedInvite,
  setAcceptedInvite
} from "../actions"

describe("Invites", () => {
  it("sets invites", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      loading: true,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      }
    }

    expect(invites(beforeState, setLoadingInvites(true))).toEqual(afterState)
  })
  it("sets invites", () => {
    const beforeState: IInvitesState = {
      loading: true
    }

    const newInvites: IInvite[] = [
      {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      },
      {
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
      loading: true,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      },
      2: {
        id: 2,
        active: false,
        team: {
          id: 2,
          name: "bar"
        },
        status: "open"
      }
    }

    expect(invites(beforeState, setInvites(newInvites))).toEqual(afterState)
  })

  it("sets invite to accepting", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      },
      2: {
        id: 2,
        active: false,
        team: {
          id: 2,
          name: "bar"
        },
        status: "open"
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      1: {
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
        id: 2,
        active: false,
        team: {
          id: 2,
          name: "bar"
        },
        status: "open"
      }
    }

    expect(invites(beforeState, setAcceptingInvite(1, true))).toEqual(
      afterState
    )
  })

  it("sets invite to declining", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      1: {
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

    expect(invites(beforeState, setDecliningInvite(1, true))).toEqual(
      afterState
    )
  })

  it("decline invite", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "declined"
      }
    }

    expect(invites(beforeState, setDeclinedInvite(1))).toEqual(afterState)
  })

  it("accept invite", () => {
    const beforeState: IInvitesState = {
      ...initialState,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "open"
      }
    }

    const afterState: IInvitesState = {
      ...initialState,
      1: {
        id: 1,
        active: false,
        team: {
          id: 1,
          name: "foo"
        },
        status: "accepted"
      }
    }

    expect(invites(beforeState, setAcceptedInvite(1))).toEqual(afterState)
  })
})
