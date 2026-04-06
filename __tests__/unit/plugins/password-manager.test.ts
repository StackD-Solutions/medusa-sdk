const mockFetch = jest.fn()

jest.mock('@medusajs/js-sdk', () => ({
	__esModule: true,
	default: class MockMedusa {
		client = {fetch: mockFetch}
		constructor(public config: Record<string, unknown>) {}
	}
}))

import {StackdMedusaSdk, passwordManagerPlugin} from '../../../src'

const medusaConfig = {baseUrl: 'http://localhost:9000'}

beforeEach(() => {
	mockFetch.mockReset()
	mockFetch.mockResolvedValue({})
})

describe('passwordManagerPlugin', () => {
	it('should have the correct name', () => {
		expect(passwordManagerPlugin.name).toBe('passwordManager')
	})

	describe('changePassword', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [passwordManagerPlugin] as const)
			await sdk.stackd.passwordManager.changePassword({current_password: 'old', new_password: 'new'})
			expect(mockFetch).toHaveBeenCalledWith('/store/customers/me/password/change', {
				method: 'POST',
				body: {current_password: 'old', new_password: 'new'},
				headers: {}
			})
		})

		it('should merge auth headers', async () => {
			const options = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
			const sdk = new StackdMedusaSdk(medusaConfig, [passwordManagerPlugin] as const, options)
			await sdk.stackd.passwordManager.changePassword({current_password: 'old', new_password: 'new'})
			expect(mockFetch).toHaveBeenCalledWith('/store/customers/me/password/change', {
				method: 'POST',
				body: {current_password: 'old', new_password: 'new'},
				headers: {Authorization: 'Bearer token'}
			})
		})

		it('should merge custom headers with auth headers', async () => {
			const options = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
			const sdk = new StackdMedusaSdk(medusaConfig, [passwordManagerPlugin] as const, options)
			await sdk.stackd.passwordManager.changePassword({current_password: 'old', new_password: 'new'}, {'X-Custom': 'value'})
			expect(mockFetch).toHaveBeenCalledWith('/store/customers/me/password/change', {
				method: 'POST',
				body: {current_password: 'old', new_password: 'new'},
				headers: {Authorization: 'Bearer token', 'X-Custom': 'value'}
			})
		})
	})
})
