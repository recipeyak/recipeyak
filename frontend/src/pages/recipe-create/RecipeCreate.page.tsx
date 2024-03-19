import { AxiosError } from "axios"
import React, { useState } from "react"
import { useHistory } from "react-router"

import { Button } from "@/components/Buttons"
import { NavPage } from "@/components/Page"
import { TextInput } from "@/components/TextInput"
import { useRecipeCreate } from "@/queries/useRecipeCreate"
import { recipeURL } from "@/urls"

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
          history.push(recipeURL(res.id, res.name))
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
        <div className="mb-1 text-left text-[--color-danger]">
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
            pathname: recipeURL(res.id, res.name),
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
          <div className="mb-1 text-left text-[--color-danger]">
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
    <NavPage title="Add Recipe">
      <div className="mx-auto max-w-[500px] flex-col text-center">
        <h1 className="my-2 text-left text-lg font-medium">Add Recipe</h1>
        <CreateFromURLForm />
        <div className="mt-2 text-center">or</div>
        <CreateManuallyForm />
      </div>
    </NavPage>
  )
}
