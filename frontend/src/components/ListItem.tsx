import React from "react"
import Textarea from "react-textarea-autosize"
import { IRecipe } from "@/store/reducers/recipes"
import GlobalEvent from "@/components/GlobalEvent"
import { Markdown } from "@/components/Markdown"
import { Button, ButtonLink } from "@/components/Buttons"
import { hasSelection } from "@/utils/general"
import { normalizeUnitsFracs } from "@/text"

interface IListItemProps {
  readonly id: number
  readonly text?: string
  readonly recipeID?: IRecipe["id"]
  readonly delete: (id: IRecipe["id"]) => void
  readonly update: (
    recipeID: IRecipe["id"],
    id: number,
    data: { text: string },
  ) => void
  readonly removing?: boolean
  readonly updating?: boolean
}

interface IListItemState {
  readonly text: string
  readonly editing: boolean
  readonly unsavedChanges: boolean
}

export default class ListItem extends React.Component<
  IListItemProps,
  IListItemState
> {
  constructor(props: IListItemProps) {
    super(props)
    this.state = {
      text: props.text || "",
      editing: false,
      unsavedChanges: false,
    }
  }

  element = React.createRef<HTMLDivElement>()

  static defaultProps = {
    recipeID: -1,
    removing: false,
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.cancel()
    }
  }

  // ensures that the list item closes when the user clicks outside of the item
  handleGeneralClick = (e: MouseEvent) => {
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */
    const target = e.target as HTMLElement | null
    const el = this.element.current

    if (el == null || target == null) {
      return
    }

    const clickedInComponent = el.contains(target)
    if (clickedInComponent) {
      return
    }
    this.setState((prevState, { text }) => ({
      editing: false,
      unsavedChanges:
        (prevState.editing && prevState.text !== text) ||
        prevState.unsavedChanges,
    }))
  }

  handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    /* eslint-disable @typescript-eslint/consistent-type-assertions */
    this.setState(({
      [e.target.name]: e.target.value,
    } as unknown) as IListItemState)
    /* eslint-enable @typescript-eslint/consistent-type-assertions */
  }

  enableEditing = () => {
    if (hasSelection()) {
      return
    }

    this.setState({
      editing: true,
      unsavedChanges: false,
    })
  }

  discardChanges = () => {
    this.setState((_, props) => ({
      editing: false,
      text: props.text || "",
      unsavedChanges: false,
    }))
  }

  handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.target.select()
  }

  handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    this.cancel()
  }

  cancel = () => {
    this.setState((_, props) => ({
      editing: false,
      text: props.text || "",
    }))
  }

  update = async (e: React.KeyboardEvent | React.MouseEvent) => {
    e.stopPropagation()
    // if the text is empty, we should just delete the item instead of updating
    if (this.state.text === "") {
      this.delete()
    } else if (this.props.recipeID) {
      this.props.update(this.props.recipeID, this.props.id, {
        text: this.state.text,
      })
    } else {
      this.props.update(-1, this.props.id, {
        text: this.state.text,
      })
    }
    this.setState({
      editing: false,
      unsavedChanges: false,
    })
  }

  delete = () => this.props.delete(this.props.id)

  render() {
    const { updating, removing } = this.props

    const inner = this.state.editing ? (
      <form>
        <GlobalEvent
          mouseUp={this.handleGeneralClick}
          keyDown={this.handleKeyDown}
        />
        <div className="field">
          <div className="control">
            <Textarea
              autoFocus
              onFocus={this.handleFocus}
              onChange={this.handleInputChange}
              onKeyPress={e => {
                if (this.state.text === "") {
                  return
                }
                if (e.shiftKey && e.key === "Enter") {
                  e.preventDefault()
                  this.update(e)
                }
              }}
              defaultValue={this.state.text}
              className="my-textarea"
              placeholder="Add you text here"
              name="text"
            />
          </div>
        </div>
        <section className="listitem-button-container">
          <div className="field is-grouped">
            <p className="control">
              <Button
                size="small"
                onClick={this.update}
                loading={updating}
                name="save">
                Save
              </Button>
            </p>
            <p className="control">
              <Button
                size="small"
                name="cancel edit"
                onClick={this.handleButtonClick}>
                Cancel
              </Button>
            </p>
          </div>
          <div className="field is-grouped">
            <p className="control">
              <Button
                onClick={this.delete}
                size="small"
                loading={removing}
                type="button"
                name="delete">
                Delete
              </Button>
            </p>
          </div>
        </section>
      </form>
    ) : (
      <Markdown>{normalizeUnitsFracs(this.state.text)}</Markdown>
    )

    return (
      <div ref={this.element}>
        <section
          className="cursor-pointer"
          title="click to edit"
          onClick={this.enableEditing}>
          {inner}
        </section>
        {this.state.unsavedChanges && (
          <section className="d-flex justify-space-between align-center">
            <span className="is-italic">Unsaved Changes</span>
            <section>
              <ButtonLink size="small" onClick={this.enableEditing}>
                View Edits
              </ButtonLink>
              <ButtonLink size="small" onClick={this.discardChanges}>
                Discard
              </ButtonLink>
            </section>
          </section>
        )}
      </div>
    )
  }
}
