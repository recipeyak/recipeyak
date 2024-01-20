interface IFormErrorHandlerProps {
  readonly error: string[] | null | undefined
}

export const FormErrorHandler = ({ error }: IFormErrorHandlerProps) => {
  if (!error) {
    return null
  }
  return (
    <div className="mt-1 block text-xs text-[--color-danger]">
      <ul>
        {error.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  )
}
