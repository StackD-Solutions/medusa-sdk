import Medusa from '@medusajs/js-sdk'
import type {StackdClientOptions, StackdFetch, StackdFetchOptions} from '..'

export const createFetch =
	(sdk: Medusa, options?: StackdClientOptions): StackdFetch =>
	async <T>(path: string, opts: StackdFetchOptions): Promise<T> => {
		const {method, headers} = opts
		return sdk.client.fetch<T>(path, {
			method,
			...('body' in opts && {body: opts.body}),
			headers: {
				...(await options?.getAuthHeader?.()),
				...headers
			}
		})
	}

export const toQueryString = (params?: Record<string, unknown>): string => {
	if (!params) {
		return ''
	}
	const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
	if (entries.length === 0) {
		return ''
	}
	const searchParams = new URLSearchParams()
	entries.forEach(([k, v]) => {
		if (Array.isArray(v)) {
			v.forEach(item => searchParams.append(k, String(item)))
		} else {
			searchParams.append(k, String(v))
		}
	})
	return `?${searchParams.toString()}`
}
