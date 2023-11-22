import { AxiosError } from "axios"
import React, { useState } from "react"
import { useHistory } from "react-router"

import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { pathRecipeDetail } from "@/paths"
import { useRecipeCreate } from "@/queries/recipeCreate"

function CreateFromURLForm() {
  const [url, setUrl] = useState("")
  const history = useHistory()
  const recipeCreate = useRecipeCreate()

  const handleImport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    recipeCreate.mutate(
      {
        from_url: url,
      },
      {
        onSuccess: (res) => {
          history.push(pathRecipeDetail({ recipeId: res.id.toString() }))
        },
      },
    )
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

        <Button
          variant="primary"
          type="submit"
          loading={recipeCreate.isPending}
        >
          Import
        </Button>
      </div>
      {recipeCreate.isError ? (
        <div className="has-text-danger text-left mb-1">
          Error:{" "}
          {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-member-access
            (recipeCreate.error as AxiosError).response?.data.message ??
              "something went wrong."
          }
        </div>
      ) : null}
    </form>
  )
}

function CreateManuallyForm() {
  const [title, setTitle] = useState("")
  const recipeCreate = useRecipeCreate()
  const history = useHistory()

  const handleManualAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    recipeCreate.mutate(
      {
        name: title,
      },
      {
        onSuccess: (res) => {
          history.push({
            pathname: pathRecipeDetail({ recipeId: res.id.toString() }),
            search: "edit=1",
          })
        },
      },
    )
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
      {recipeCreate.isError ? (
        <div className="has-text-danger text-left mb-1">
          Error:
          {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (recipeCreate.error as Error).message ?? "something went wrong."
          }
        </div>
      ) : null}
      <Button variant="primary" type="submit" loading={recipeCreate.isPending}>
        Add Manually
      </Button>
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
