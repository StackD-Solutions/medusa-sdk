import {ClientHeaders} from '@medusajs/js-sdk'

export type StackdFetchWithBody = {
	method: 'POST' | 'PUT' | 'PATCH'
	body?: Record<string, any>
	headers?: ClientHeaders
}

export type StackdFetchWithoutBody = {
	method: 'GET' | 'DELETE'
	headers?: ClientHeaders
}

export type StackdFetchOptions = StackdFetchWithBody | StackdFetchWithoutBody

export type StackdFetch = <T>(path: string, options: StackdFetchOptions) => Promise<T>
