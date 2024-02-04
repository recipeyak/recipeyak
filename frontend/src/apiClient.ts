import { AxiosRequestConfig } from "axios"
import { omit } from "lodash-es"

import { assertNever } from "@/assert"
import { toISODateString } from "@/date"
import { baseHttp } from "@/http"

function replacePathParams(
  url: string,
  pathParamNames: string[],
  params: Record<string, unknown>,
): string {
  for (const paramName of pathParamNames) {
    const paramValue = params[paramName]
    url = url.replaceAll(`{${paramName}}`, String(paramValue))
  }
  return url
}

export async function http<T>(args: {
  url: string
  method: "get" | "post" | "delete" | "patch" | "put" | "head"
  params?: Record<string, unknown>
  pathParamNames?: string[]
}): Promise<T> {
  const requestData: Record<string, unknown> | undefined = args.params
    ? omit(args.params, args.pathParamNames ?? [])
    : undefined

  if (requestData != null) {
    for (const [param, value] of Object.entries(requestData)) {
      if (value instanceof Date) {
        requestData[param] = toISODateString(value)
      }
    }
  }
  const requestConfig: AxiosRequestConfig = {
    url: replacePathParams(
      args.url,
      args.pathParamNames ?? [],
      args.params ?? {},
    ),
    method: args.method,
  }
  // Serialize request data to query params for get requests since they don't
  // have request bodies, everything else (except for head, which I'm not sure
  // what to do with) gets it put in the request body
  if (
    args.method === "get" ||
    args.method === "delete" ||
    args.method === "head"
  ) {
    requestConfig.params = requestData
  } else if (
    args.method === "patch" ||
    args.method === "post" ||
    args.method === "put"
  ) {
    requestConfig.data = requestData
  } else {
    assertNever(args.method)
  }
  const r = await baseHttp.request<T>(requestConfig)
  return r.data
}
