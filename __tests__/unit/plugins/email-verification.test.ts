const mockFetch = jest.fn()

jest.mock('@medusajs/js-sdk', () => ({
	__esModule: true,
	default: class MockMedusa {
		client = {fetch: mockFetch}
		constructor(public config: Record<string, unknown>) {}
	}
}))

import {StackdMedusaSdk, emailVerificationPlugin} from '../../../src'

const medusaConfig = {baseUrl: 'http://localhost:9000'}

beforeEach(() => {
	mockFetch.mockReset()
	mockFetch.mockResolvedValue({})
})

describe('emailVerificationPlugin', () => {
	it('should have the correct name', () => {
		expect(emailVerificationPlugin.name).toBe('emailVerification')
	})

	describe('sendVerificationEmail', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [emailVerificationPlugin] as const)
			await sdk.stackd.emailVerification.sendVerificationEmail({callback_url: 'https://example.com/verify'})
			expect(mockFetch).toHaveBeenCalledWith('/store/email/verify/send', {
				method: 'POST',
				body: {callback_url: 'https://example.com/verify'},
				headers: {}
			})
		})

		it('should merge auth headers', async () => {
			const options = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
			const sdk = new StackdMedusaSdk(medusaConfig, [emailVerificationPlugin] as const, options)
			await sdk.stackd.emailVerification.sendVerificationEmail({callback_url: 'https://example.com/verify'})
			expect(mockFetch).toHaveBeenCalledWith('/store/email/verify/send', {
				method: 'POST',
				body: {callback_url: 'https://example.com/verify'},
				headers: {Authorization: 'Bearer token'}
			})
		})

		it('should merge custom headers with auth headers', async () => {
			const options = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
			const sdk = new StackdMedusaSdk(medusaConfig, [emailVerificationPlugin] as const, options)
			await sdk.stackd.emailVerification.sendVerificationEmail({callback_url: 'https://example.com/verify'}, {'X-Custom': 'value'})
			expect(mockFetch).toHaveBeenCalledWith('/store/email/verify/send', {
				method: 'POST',
				body: {callback_url: 'https://example.com/verify'},
				headers: {Authorization: 'Bearer token', 'X-Custom': 'value'}
			})
		})
	})

	describe('verifyToken', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [emailVerificationPlugin] as const)
			await sdk.stackd.emailVerification.verifyToken({token: 'abc123'})
			expect(mockFetch).toHaveBeenCalledWith('/store/email/verify', {
				method: 'POST',
				body: {token: 'abc123'},
				headers: {}
			})
		})

		it('should merge auth headers', async () => {
			const options = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
			const sdk = new StackdMedusaSdk(medusaConfig, [emailVerificationPlugin] as const, options)
			await sdk.stackd.emailVerification.verifyToken({token: 'abc123'})
			expect(mockFetch).toHaveBeenCalledWith('/store/email/verify', {
				method: 'POST',
				body: {token: 'abc123'},
				headers: {Authorization: 'Bearer token'}
			})
		})
	})

	describe('getVerificationStatus', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [emailVerificationPlugin] as const)
			await sdk.stackd.emailVerification.getVerificationStatus()
			expect(mockFetch).toHaveBeenCalledWith('/store/email/verify/status', {
				method: 'GET',
				headers: {}
			})
		})

		it('should merge auth headers', async () => {
			const options = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}
			const sdk = new StackdMedusaSdk(medusaConfig, [emailVerificationPlugin] as const, options)
			await sdk.stackd.emailVerification.getVerificationStatus()
			expect(mockFetch).toHaveBeenCalledWith('/store/email/verify/status', {
				method: 'GET',
				headers: {Authorization: 'Bearer token'}
			})
		})

		it('should pass custom headers', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [emailVerificationPlugin] as const)
			await sdk.stackd.emailVerification.getVerificationStatus({'X-Custom': 'value'})
			expect(mockFetch).toHaveBeenCalledWith('/store/email/verify/status', {
				method: 'GET',
				headers: {'X-Custom': 'value'}
			})
		})
	})
})
