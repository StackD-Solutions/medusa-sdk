import {toQueryString, createFetch} from '../../../src/utils/http'

describe('toQueryString', () => {
	it('should return empty string for undefined', () => {
		expect(toQueryString(undefined)).toBe('')
	})

	it('should return empty string for empty object', () => {
		expect(toQueryString({})).toBe('')
	})

	it('should skip undefined values', () => {
		expect(toQueryString({a: 'foo', b: undefined})).toBe('?a=foo')
	})

	it('should skip null values', () => {
		expect(toQueryString({a: 'foo', b: null})).toBe('?a=foo')
	})

	it('should return empty string when all values are null or undefined', () => {
		expect(toQueryString({a: null, b: undefined})).toBe('')
	})

	it('should serialize string values', () => {
		expect(toQueryString({limit: '10', offset: '0'})).toBe('?limit=10&offset=0')
	})

	it('should serialize number values', () => {
		expect(toQueryString({limit: 10, offset: 0})).toBe('?limit=10&offset=0')
	})

	it('should serialize boolean values', () => {
		expect(toQueryString({active: true})).toBe('?active=true')
	})

	it('should serialize array values as repeated keys', () => {
		expect(toQueryString({fields: ['name', 'price']})).toBe('?fields=name&fields=price')
	})

	it('should handle mixed types', () => {
		const result = toQueryString({q: 'test', limit: 5, fields: ['a', 'b'], missing: undefined})
		expect(result).toContain('q=test')
		expect(result).toContain('limit=5')
		expect(result).toContain('fields=a')
		expect(result).toContain('fields=b')
		expect(result).not.toContain('missing')
	})
})

describe('createFetch', () => {
	const mockFetch = jest.fn()
	const mockSdk = {client: {fetch: mockFetch}} as any

	beforeEach(() => {
		mockFetch.mockReset()
	})

	it('should call sdk.client.fetch with merged headers', async () => {
		mockFetch.mockResolvedValue({ok: true})
		const options = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
		const fetch = createFetch(mockSdk, options)

		await fetch('/test', {method: 'GET'})

		expect(mockFetch).toHaveBeenCalledWith('/test', {
			method: 'GET',
			headers: {Authorization: 'Bearer token'}
		})
	})

	it('should let caller headers override auth headers', async () => {
		mockFetch.mockResolvedValue({ok: true})
		const options = {getAuthHeader: async () => ({Authorization: 'Bearer default'})}
		const fetch = createFetch(mockSdk, options)

		await fetch('/test', {method: 'GET', headers: {Authorization: 'Bearer override'}})

		expect(mockFetch).toHaveBeenCalledWith('/test', {
			method: 'GET',
			headers: {Authorization: 'Bearer override'}
		})
	})

	it('should work without options', async () => {
		mockFetch.mockResolvedValue({ok: true})
		const fetch = createFetch(mockSdk)

		await fetch('/test', {method: 'POST', body: {key: 'value'}})

		expect(mockFetch).toHaveBeenCalledWith('/test', {
			method: 'POST',
			body: {key: 'value'},
			headers: {}
		})
	})

	it('should propagate fetch errors to the caller', async () => {
		const error = new Error('Network error')
		mockFetch.mockRejectedValue(error)
		const fetch = createFetch(mockSdk)

		await expect(fetch('/test', {method: 'GET'})).rejects.toThrow('Network error')
	})

	it('should propagate fetch errors when auth headers are provided', async () => {
		const error = new Error('Internal Server Error')
		mockFetch.mockRejectedValue(error)
		const options = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
		const fetch = createFetch(mockSdk, options)

		await expect(fetch('/test', {method: 'POST', body: {key: 'value'}})).rejects.toThrow('Internal Server Error')
	})

	it('should work when getAuthHeader is undefined', async () => {
		mockFetch.mockResolvedValue({ok: true})
		const fetch = createFetch(mockSdk, {})

		await fetch('/test', {method: 'GET'})

		expect(mockFetch).toHaveBeenCalledWith('/test', {
			method: 'GET',
			headers: {}
		})
	})
})
