const mockFetch = jest.fn()

jest.mock('@medusajs/js-sdk', () => ({
	__esModule: true,
	default: class MockMedusa {
		client = {fetch: mockFetch}
		constructor(public config: Record<string, unknown>) {}
	}
}))

import {StackdMedusaSdk, wishlistPlugin} from '../../../src'
import type {StackdClientOptions} from '../../../src'

const medusaConfig = {baseUrl: 'http://localhost:9000'}
const authOptions: StackdClientOptions = {getAuthHeader: async () => ({Authorization: 'Bearer token'})}

beforeEach(() => {
	mockFetch.mockReset()
	mockFetch.mockResolvedValue({})
})

describe('wishlistPlugin', () => {
	it('should have the correct name', () => {
		expect(wishlistPlugin.name).toBe('wishlist')
	})

	describe('list', () => {
		it('should call without query params', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.list()
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists', {
				method: 'GET',
				headers: {}
			})
		})

		it('should append query params', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.list({limit: 5, offset: 10})
			expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/store/wishlists?'), {
				method: 'GET',
				headers: {}
			})
			const url = mockFetch.mock.calls[0][0] as string
			const params = new URLSearchParams(url.split('?')[1])
			expect(params.get('limit')).toBe('5')
			expect(params.get('offset')).toBe('10')
		})

		it('should handle array query params', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.list({items_fields: ['id', 'name']})
			const url = mockFetch.mock.calls[0][0] as string
			const params = new URLSearchParams(url.split('?')[1])
			expect(params.getAll('items_fields')).toEqual(['id', 'name'])
		})

		it('should skip undefined query params', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.list({limit: 5, offset: undefined})
			const url = mockFetch.mock.calls[0][0] as string
			const params = new URLSearchParams(url.split('?')[1])
			expect(params.get('limit')).toBe('5')
			expect(params.has('offset')).toBe(false)
		})

		it('should return empty string for empty query object', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.list({})
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists', {
				method: 'GET',
				headers: {}
			})
		})
	})

	describe('create', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.create({sales_channel_id: 'sc_123', name: 'My List'})
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists', {
				method: 'POST',
				body: {sales_channel_id: 'sc_123', name: 'My List'},
				headers: {}
			})
		})
	})

	describe('retrieve', () => {
		it('should call with id', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.retrieve('wl_123')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123', {
				method: 'GET',
				headers: {}
			})
		})

		it('should append query params', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.retrieve('wl_123', {include_calculated_price: true})
			const url = mockFetch.mock.calls[0][0] as string
			expect(url).toContain('/store/wishlists/wl_123?')
			const params = new URLSearchParams(url.split('?')[1])
			expect(params.get('include_calculated_price')).toBe('true')
		})
	})

	describe('update', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.update('wl_123', {name: 'Renamed'})
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123', {
				method: 'PUT',
				body: {name: 'Renamed'},
				headers: {}
			})
		})
	})

	describe('delete', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.delete('wl_123')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123', {
				method: 'DELETE',
				headers: {}
			})
		})
	})

	describe('listItems', () => {
		it('should call without query params', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.listItems('wl_123')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/items', {
				method: 'GET',
				headers: {}
			})
		})

		it('should append pagination query params', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.listItems('wl_123', {limit: 20, offset: 5})
			const url = mockFetch.mock.calls[0][0] as string
			const params = new URLSearchParams(url.split('?')[1])
			expect(params.get('limit')).toBe('20')
			expect(params.get('offset')).toBe('5')
		})
	})

	describe('addItem', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.addItem('wl_123', {product_variant_id: 'variant_456'})
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/items', {
				method: 'POST',
				body: {product_variant_id: 'variant_456'},
				headers: {}
			})
		})
	})

	describe('removeItem', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.removeItem('wl_123', 'wli_456')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/items/wli_456', {
				method: 'DELETE',
				headers: {}
			})
		})
	})

	describe('generateShareToken', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.generateShareToken('wl_123')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/share', {
				method: 'POST',
				headers: {}
			})
		})
	})

	describe('transfer', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.transfer('wl_123')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/transfer', {
				method: 'POST',
				headers: {}
			})
		})
	})

	describe('import', () => {
		it('should call the correct endpoint', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.import({share_token: 'jwt_token'})
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/import', {
				method: 'POST',
				body: {share_token: 'jwt_token'},
				headers: {}
			})
		})
	})

	describe('getTotalItemsCount', () => {
		it('should call without query params', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.getTotalItemsCount()
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/total-items-count', {
				method: 'GET',
				headers: {}
			})
		})

		it('should append wishlist_id query param', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.getTotalItemsCount({wishlist_id: 'wl_123'})
			const url = mockFetch.mock.calls[0][0] as string
			const params = new URLSearchParams(url.split('?')[1])
			expect(params.get('wishlist_id')).toBe('wl_123')
		})
	})

	describe('auth headers', () => {
		it('should merge auth headers on all endpoints', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const, authOptions)
			await sdk.stackd.wishlist.create({sales_channel_id: 'sc_123'})
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists', {
				method: 'POST',
				body: {sales_channel_id: 'sc_123'},
				headers: {Authorization: 'Bearer token'}
			})
		})

		it('should allow custom headers to override auth headers', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const, authOptions)
			await sdk.stackd.wishlist.list(undefined, {Authorization: 'Bearer other'})
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists', {
				method: 'GET',
				headers: {Authorization: 'Bearer other'}
			})
		})
	})
})
