import { path } from "static-path"

export const pathLogin = path("/login")
export const pathSignup = path("/signup")
export const pathPasswordReset = path("/password-reset")
export const pathPasswordConfirm = path("/password-reset/confirm/:uid/:token")
export const pathHome = path("/")
export const pathSchedule = path("/schedule")
export const pathRecipesExportYaml = path("/recipes.yaml")
export const pathRecipesExportJson = path("/recipes.json")
export const pathDeprecatedSchedule = path("/t/:id/schedule")
export const pathRecipeAdd = path("/recipes/add")
export const pathRecipesList = path("/recipes")
// ideally we'd have: path("/recipes/:id(\d+)(.*)")
export const pathRecipeDetail = path("/recipes/:recipeId")
export const pathCookDetail = path("/cook/:recipeId")
export const pathSettings = path("/settings")
export const pathProfileById = path("/profile/:userId")
export const pathProfileByIdComments = path("/profile/:userId/comments")
export const pathProfileByIdPhotos = path("/profile/:userId/photos")
export const pathPassword = path("/password")
export const pathTeamCreate = path("/t/create")
// ideally we'd have: path("/t/:id(d+)(.*)/invite")
export const pathTeamInvite = path("/t/:teamId/invite")
// ideally we'd have: path("/t/:id(\d+)(.*)/settings")
export const pathTeamSettings = path("/t/:teamId/settings")
// ideally we'd have: path("/t/:id(\d+)(.*)")
export const pathTeamDetail = path("/t/:teamId")
export const pathTeamList = path("/t/")
