import invites from "./invites";

import {
  setInvites,
  setLoadingInvites,
  setAcceptingInvite,
  setDecliningInvite,
  setDeclinedInvite,
  setAcceptedInvite
} from "../actions";

describe("Invites", () => {
  it("sets invites", () => {
    const beforeState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1
      }
    };

    const afterState = {
      loading: true,
      1: {
        id: 1,
        name: "blah",
        teamID: 1
      }
    };

    expect(invites(beforeState, setLoadingInvites(true))).toEqual(afterState);
  });
  it("sets invites", () => {
    const beforeState = {
      loading: true
    };

    const newInvites = [
      {
        id: 1,
        name: "blah",
        teamID: 1
      },
      {
        id: 2,
        name: "cool",
        teamID: 2
      }
    ];

    const afterState = {
      loading: true,
      1: {
        id: 1,
        name: "blah",
        teamID: 1
      },
      2: {
        id: 2,
        name: "cool",
        teamID: 2
      }
    };

    expect(invites(beforeState, setInvites(newInvites))).toEqual(afterState);
  });

  it("sets invite to accepting", () => {
    const beforeState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1
      }
    };

    const afterState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1,
        accepting: true
      }
    };

    expect(invites(beforeState, setAcceptingInvite(1, true))).toEqual(
      afterState
    );
  });

  it("sets invite to declining", () => {
    const beforeState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1
      }
    };

    const afterState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1,
        declining: true
      }
    };

    expect(invites(beforeState, setDecliningInvite(1, true))).toEqual(
      afterState
    );
  });

  it("decline invite", () => {
    const beforeState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1
      }
    };

    const afterState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1,
        status: "declined"
      }
    };

    expect(invites(beforeState, setDeclinedInvite(1))).toEqual(afterState);
  });

  it("accept invite", () => {
    const beforeState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1
      }
    };

    const afterState = {
      1: {
        id: 1,
        name: "blah",
        teamID: 1,
        status: "accepted"
      }
    };

    expect(invites(beforeState, setAcceptedInvite(1))).toEqual(afterState);
  });
});
