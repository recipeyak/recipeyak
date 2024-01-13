import { AxiosError } from "axios"
import React, { useState } from "react"
import { useHistory } from "react-router"

import { Button } from "@/components/Buttons"
import { TextInput } from "@/components/Forms"
import { Helmet } from "@/components/Helmet"
import { NavPage } from "@/components/Page"
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
      <div className="text-left text-[14px] font-medium">URL</div>
      <div className="flex flex-col gap-2">
        <TextInput
          placeholder="https://cooking.nytimes.com..."
          name="recipe url"
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
          {recipeCreate.isPending ? "Importing..." : "Import"}
        </Button>
      </div>
      {recipeCreate.isError ? (
        <div className="mb-1 text-left text-[var(--color-danger)]">
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
      <div className="text-left text-[14px] font-medium">Title</div>
      <div className="flex flex-col gap-2">
        <TextInput
          placeholder="Butternutt Squash Soup"
          name="recipe url"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
          }}
        />
        {recipeCreate.isError ? (
          <div className="mb-1 text-left text-[var(--color-danger)]">
            Error:
            {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              (recipeCreate.error as Error).message ?? "something went wrong."
            }
          </div>
        ) : null}
        <Button type="submit" loading={recipeCreate.isPending}>
          Add Manually
        </Button>
      </div>
    </form>
  )
}

export function RecipeCreatePage() {
  return (
    <NavPage>
      {/* eslint-disable-next-line no-restricted-syntax */}
      <div style={{ maxWidth: 500 }} className="mx-auto flex-col text-center">
        <Helmet title="Add Recipe" />
        <h1 className="my-2 text-left text-lg font-medium">Add Recipe</h1>
        <CreateFromURLForm />
        <div className="mt-2 text-center">or</div>
        <CreateManuallyForm />
      </div>
    </NavPage>
  )
}
