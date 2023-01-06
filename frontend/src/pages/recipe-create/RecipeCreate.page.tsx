import React, { useState } from "react"
import { useHistory } from "react-router"

import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
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
          history.push(`/recipes/${res.id}`)
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
          loading={recipeCreate.isLoading}
        >
          Import
        </Button>
      </div>
      {recipeCreate.isError ? (
        <div className="c-danger text-left mb-1">
          Error:{" "}
          {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (recipeCreate.error as Error).message ?? "something went wrong."
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
          history.push(`/recipes/${res.id}?edit=1`)
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
        <div className="c-danger text-left mb-1">
          Error:
          {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (recipeCreate.error as Error).message ?? "something went wrong."
          }
        </div>
      ) : null}
      <Button variant="primary" type="submit" loading={recipeCreate.isLoading}>
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
