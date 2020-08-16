import {
  getType,
  createAsyncAction,
  ActionType,
  createStandardAction,
} from "typesafe-actions"

export const passwordUpdate = createAsyncAction(
  "PASSWORD_UPDATE_START",
  "PASSWORD_UPDATE_SUCCESS",
  "PASSWORD_UPDATE_FAILURE",
)<void, void, IPasswordUpdateError | void>()

export const clearPasswordUpdateError = createStandardAction(
  "CLEAR_PASSWORD_UPDATE_ERROR",
)()

export type PasswordChangeActions =
  | ActionType<typeof passwordUpdate>
  | ActionType<typeof clearPasswordUpdateError>

interface IPasswordUpdateError {
  readonly newPasswordAgain?: string[]
  readonly newPassword?: string[]
  readonly oldPassword?: string[]
}

export interface IPasswordChangeState {
  readonly loadingPasswordUpdate: boolean
  readonly errorPasswordUpdate: IPasswordUpdateError
}

export const initialState: IPasswordChangeState = {
  loadingPasswordUpdate: false,
  errorPasswordUpdate: {},
}

export const passwordChange = (
  state: IPasswordChangeState = initialState,
  action: PasswordChangeActions,
): IPasswordChangeState => {
  switch (action.type) {
    case getType(passwordUpdate.request):
      return { ...state, loadingPasswordUpdate: true, errorPasswordUpdate: {} }
    case getType(passwordUpdate.success):
      return { ...state, loadingPasswordUpdate: false }
    case getType(passwordUpdate.failure):
      return {
        ...state,
        loadingPasswordUpdate: false,
        errorPasswordUpdate: action.payload || {},
      }
    case getType(clearPasswordUpdateError):
      return {
        ...state,
        errorPasswordUpdate: {},
      }
    default:
      return state
  }
}

export default passwordChange
