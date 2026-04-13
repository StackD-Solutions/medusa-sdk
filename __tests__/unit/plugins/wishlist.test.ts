const mockFetch = jest.fn()

jest.mock('@medusajs/js-sdk', () => ({
	__esModule: true,
	default: class MockMedusa {
		client = {fetch: mockFetch}
		authenticated = true
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
			const url = mockFetch.mock.calls[0][0] as string
			const params = new URLSearchParams(url.split('?')[1])
			expect(params.get('limit')).toBe('5')
			expect(params.get('offset')).toBe('10')
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

		it('should filter by product_variant_id', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.list({product_variant_id: 'v_1'})
			const url = mockFetch.mock.calls[0][0] as string
			const params = new URLSearchParams(url.split('?')[1])
			expect(params.get('product_variant_id')).toBe('v_1')
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
		it('should call with id', async () => {
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
			await sdk.stackd.wishlist.removeItem('wl_123', 'variant_456')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/items/variant_456', {
				method: 'DELETE',
				headers: {}
			})
		})
	})

	describe('local fallback', () => {
		beforeEach(() => {
			Object.defineProperty(globalThis, 'localStorage', {
				value: {
					getItem: jest.fn((): string | null => null),
					setItem: jest.fn(),
					removeItem: jest.fn()
				},
				writable: true,
				configurable: true
			})
		})

		afterEach(() => {
			delete (globalThis as Record<string, unknown>).localStorage
		})

		it('should use local wishlist for retrieve when id matches localId', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			const result = await sdk.stackd.wishlist.retrieve('wishlist')
			expect(result.data.id).toBe('wishlist')
			expect(result.data.visibility).toBe('private')
			expect(mockFetch).not.toHaveBeenCalled()
		})

		it('should use server for retrieve when id does not match localId', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.retrieve('wl_123')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123', {
				method: 'GET',
				headers: {}
			})
		})

		it('should use local wishlist for addItem when id matches localId', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			const result = await sdk.stackd.wishlist.addItem('wishlist', {product_variant_id: 'v_1'})
			expect(result.data.product_variant_id).toBe('v_1')
			expect(result.data.id).toBeDefined()
			expect(mockFetch).not.toHaveBeenCalled()
		})

		it('should use server for addItem when id does not match localId', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.addItem('wl_123', {product_variant_id: 'v_1'})
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/items', {
				method: 'POST',
				body: {product_variant_id: 'v_1'},
				headers: {}
			})
		})

		it('should use local wishlist for removeItem when id matches localId', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.addItem('wishlist', {product_variant_id: 'v_1'})
			const result = await sdk.stackd.wishlist.removeItem('wishlist', 'v_1')
			expect(result.id).toBe('v_1')
			expect(mockFetch).not.toHaveBeenCalled()
		})

		it('should use server for removeItem when id does not match localId', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.removeItem('wl_123', 'v_1')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/items/v_1', {
				method: 'DELETE',
				headers: {}
			})
		})

		it('should use local wishlist for listItems when id matches localId', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.addItem('wishlist', {product_variant_id: 'v_1'})
			await sdk.stackd.wishlist.addItem('wishlist', {product_variant_id: 'v_2'})
			const result = await sdk.stackd.wishlist.listItems('wishlist')
			expect(result.data).toHaveLength(2)
			expect(result.page.count).toBe(2)
			expect(mockFetch).not.toHaveBeenCalled()
		})

		it('should use server for listItems when id does not match localId', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const)
			await sdk.stackd.wishlist.listItems('wl_123')
			expect(mockFetch).toHaveBeenCalledWith('/store/wishlists/wl_123/items', {
				method: 'GET',
				headers: {}
			})
		})

		it('should use custom localWishlistId from options', async () => {
			const sdk = new StackdMedusaSdk(medusaConfig, [wishlistPlugin] as const, {localWishlistId: 'my-local'})
			const result = await sdk.stackd.wishlist.retrieve('my-local')
			expect(result.data.id).toBe('my-local')
			expect(mockFetch).not.toHaveBeenCalled()
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
