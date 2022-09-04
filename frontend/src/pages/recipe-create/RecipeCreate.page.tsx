import React, { useState } from "react"
import { useHistory } from "react-router"

import * as api from "@/api"
import { ButtonPrimary } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { useDispatch, useTeamId } from "@/hooks"
import { isOk } from "@/result"
import { createRecipe } from "@/store/reducers/recipes"

function CreateFromURLForm() {
  const [url, setUrl] = useState("")
  const [status, setStatus] = useState<
    { type: "creating" } | { type: "error"; err: Error } | { type: "idle" }
  >({ type: "idle" })

  const dispatch = useDispatch()

  const history = useHistory()
  const teamId = useTeamId()

  const handleImport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus({ type: "creating" })
    const team = teamId === "personal" ? undefined : teamId
    void api
      .createRecipe({
        team,
        from_url: url,
      })
      .then((res) => {
        if (isOk(res)) {
          // store in cache
          dispatch(createRecipe.success(res.data))
          history.push(`/recipes/${res.data.id}?edit=1`)
          setStatus({ type: "idle" })
        } else {
          setStatus({ type: "error", err: res.error })
        }
      })
  }
  return (
    <form onSubmit={handleImport}>
      <div className="text-left fw-bold fs-14px">URL</div>
      <div className="d-flex">
        <TextInput
          placeholder="https://cooking.nytimes.com..."
          name="recipe url"
          className="mr-2"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
          }}
        />

        <ButtonPrimary type="submit" loading={status.type === "creating"}>
          Import
        </ButtonPrimary>
      </div>
      {status.type === "error" ? (
        <div className="c-danger text-left mb-1">
          Error: {status.err.message ?? "something went wrong."}
        </div>
      ) : null}
    </form>
  )
}

function CreateManuallyForm() {
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<
    { type: "creating" } | { type: "error"; err: Error } | { type: "idle" }
  >({ type: "idle" })

  const dispatch = useDispatch()

  const history = useHistory()
  const teamId = useTeamId()

  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus({ type: "creating" })
    const team = teamId === "personal" ? undefined : teamId
    void api
      .createRecipe({
        team,
        name: title,
      })
      .then((res) => {
        if (isOk(res)) {
          // store in cache
          dispatch(createRecipe.success(res.data))
          history.push(`/recipes/${res.data.id}?edit=1`)
          setStatus({ type: "idle" })
        } else {
          setStatus({ type: "error", err: res.error })
        }
      })
  }
  return (
    <form onSubmit={handleManualAdd}>
      <div className="text-left fw-bold fs-14px">Title</div>
      <TextInput
        placeholder="Butternutt Squash Soup"
        name="recipe url"
        className="mb-2"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
        }}
      />
      {status.type === "error" ? (
        <div className="c-danger text-left mb-1">
          Error: {status.err.message ?? "something went wrong."}
        </div>
      ) : null}
      <ButtonPrimary type="submit" loading={status.type === "creating"}>
        Add Manually
      </ButtonPrimary>
    </form>
  )
}

export default function RecipeCreate() {
  return (
    <div style={{ maxWidth: 500 }} className="mx-auto text-center">
      <Helmet title="Add Recipe" />
      <h1 className="fs-2rem mb-2">Add Recipe</h1>
      <CreateFromURLForm />
      <div className="text-center mt-4">or</div>
      <CreateManuallyForm />
    </div>
  )
}
