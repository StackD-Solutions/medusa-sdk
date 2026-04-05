const mockFetch = jest.fn()

jest.mock('@medusajs/js-sdk', () => ({
	__esModule: true,
	default: class MockMedusa {
		client = {fetch: mockFetch}
		constructor(public config: Record<string, unknown>) {}
	}
}))

import {StackdMedusaSdk, type Plugin, type StackdClientOptions} from '../../src'

beforeEach(() => {
	mockFetch.mockReset()
})

describe('StackdMedusaSdk', () => {
	const medusaConfig = {baseUrl: 'http://localhost:9000'}

	it('should create an instance with no plugins', () => {
		const sdk = new StackdMedusaSdk(medusaConfig, [] as const)
		expect(sdk.stackd).toEqual({})
		expect((sdk as any).medusaConfig).toBe(medusaConfig)
	})

	it('should register a single plugin', () => {
		const plugin: Plugin<'test', {hello: () => string}> = {
			name: 'test',
			endpoints: () => ({hello: () => 'world'})
		}
		const sdk = new StackdMedusaSdk(medusaConfig, [plugin] as const)
		expect(sdk.stackd.test.hello()).toBe('world')
	})

	it('should register multiple plugins', () => {
		const pluginA: Plugin<'a', {foo: () => string}> = {
			name: 'a',
			endpoints: () => ({foo: () => 'bar'})
		}
		const pluginB: Plugin<'b', {baz: () => number}> = {
			name: 'b',
			endpoints: () => ({baz: () => 42})
		}
		const sdk = new StackdMedusaSdk(medusaConfig, [pluginA, pluginB] as const)
		expect(sdk.stackd.a.foo()).toBe('bar')
		expect(sdk.stackd.b.baz()).toBe(42)
	})

	it('should pass sdk instance to plugin endpoints factory', () => {
		const endpointsFn = jest.fn().mockReturnValue({})
		const plugin: Plugin<'test', Record<string, never>> = {
			name: 'test',
			endpoints: endpointsFn
		}
		const sdk = new StackdMedusaSdk(medusaConfig, [plugin] as const)
		expect(endpointsFn).toHaveBeenCalledWith(sdk, undefined, medusaConfig)
	})

	it('should pass options to plugin endpoints factory', () => {
		const endpointsFn = jest.fn().mockReturnValue({})
		const plugin: Plugin<'test', Record<string, never>> = {
			name: 'test',
			endpoints: endpointsFn
		}
		const options: StackdClientOptions = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
		const sdk = new StackdMedusaSdk(medusaConfig, [plugin] as const, options)
		expect(endpointsFn).toHaveBeenCalledWith(sdk, options, medusaConfig)
	})
})
