import LocalWishlist from '../../../src/plugins/wishlist/local-wishlist'

const createMockStorage = (): Storage & {_store: Record<string, string>} => {
	const store: Record<string, string> = {}
	return {
		_store: store,
		getItem: jest.fn((key: string): string | null => store[key] ?? null),
		setItem: jest.fn((key: string, value: string): void => {
			store[key] = value
		}),
		removeItem: jest.fn((key: string): void => {
			delete store[key]
		}),
		clear: jest.fn((): void => {
			Object.keys(store).forEach(k => delete store[k])
		}),
		get length(): number {
			return Object.keys(store).length
		},
		key: jest.fn((): string | null => null)
	}
}

let mockStorage: ReturnType<typeof createMockStorage>

beforeEach(() => {
	mockStorage = createMockStorage()
	Object.defineProperty(globalThis, 'localStorage', {value: mockStorage, writable: true, configurable: true})
})

afterEach(() => {
	delete (globalThis as Record<string, unknown>).localStorage
})

describe('LocalWishlist', () => {
	describe('constructor', () => {
		it('should initialize with empty items', () => {
			const wishlist = new LocalWishlist()
			expect(wishlist.getItemCount()).toBe(0)
		})

		it('should load existing items from localStorage', () => {
			const existing = [{id: 'x', product_variant_id: 'v_1', wishlist_id: 'wishlist', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z', deleted_at: null}]
			mockStorage._store['wishlist'] = JSON.stringify(existing)
			const wishlist = new LocalWishlist()
			expect(wishlist.getItemCount()).toBe(1)
			expect(wishlist.hasItem('v_1')).toBe(true)
		})

		it('should use custom storage key', () => {
			const existing = [{id: 'x', product_variant_id: 'v_1', wishlist_id: 'my-list', created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z', deleted_at: null}]
			mockStorage._store['my-list'] = JSON.stringify(existing)
			const wishlist = new LocalWishlist('my-list')
			expect(wishlist.getItemCount()).toBe(1)
		})

		it('should handle corrupted localStorage data', () => {
			mockStorage._store['wishlist'] = 'not-json'
			const wishlist = new LocalWishlist()
			expect(wishlist.getItemCount()).toBe(0)
		})

		it('should handle empty localStorage value', () => {
			mockStorage._store['wishlist'] = ''
			const wishlist = new LocalWishlist()
			expect(wishlist.getItemCount()).toBe(0)
		})
	})

	describe('retrieve', () => {
		it('should return wishlist response with correct shape', () => {
			const wishlist = new LocalWishlist()
			const result = wishlist.retrieve()
			expect(result.data.id).toBe('wishlist')
			expect(result.data.name).toBe('wishlist')
			expect(result.data.customer_id).toBe('')
			expect(result.data.sales_channel_id).toBe('')
			expect(result.data.visibility).toBe('private')
			expect(result.data.items_count).toBe(0)
			expect(result.data.created_at).toBeDefined()
			expect(result.data.updated_at).toBeDefined()
			expect(result.data.deleted_at).toBeNull()
		})

		it('should use storage key as id and name', () => {
			const wishlist = new LocalWishlist('my-list')
			const result = wishlist.retrieve()
			expect(result.data.id).toBe('my-list')
			expect(result.data.name).toBe('my-list')
		})

		it('should reflect current item count', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			const result = wishlist.retrieve()
			expect(result.data.items_count).toBe(2)
		})
	})

	describe('addItem', () => {
		it('should add item and persist to localStorage', () => {
			const wishlist = new LocalWishlist()
			const result = wishlist.addItem('v_1')
			expect(result.data.id).toBeDefined()
			expect(result.data.product_variant_id).toBe('v_1')
			expect(result.data.wishlist_id).toBe('wishlist')
			expect(result.data.created_at).toBeDefined()
			expect(result.data.updated_at).toBeDefined()
			expect(result.data.deleted_at).toBeNull()
			expect(wishlist.getItemCount()).toBe(1)
			expect(JSON.parse(mockStorage._store['wishlist'])).toHaveLength(1)
		})

		it('should use storageKey as wishlist_id', () => {
			const wishlist = new LocalWishlist('my-list')
			const result = wishlist.addItem('v_1')
			expect(result.data.wishlist_id).toBe('my-list')
		})

		it('should generate unique ids', () => {
			const wishlist = new LocalWishlist()
			const a = wishlist.addItem('v_1')
			const b = wishlist.addItem('v_2')
			expect(a.data.id).not.toBe(b.data.id)
		})

		it('should return existing item when adding duplicate', () => {
			const wishlist = new LocalWishlist()
			const first = wishlist.addItem('v_1')
			const second = wishlist.addItem('v_1')
			expect(second.data.id).toBe(first.data.id)
			expect(second.data.product_variant_id).toBe(first.data.product_variant_id)
			expect(wishlist.getItemCount()).toBe(1)
		})

		it('should add multiple different items', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			expect(wishlist.getItemCount()).toBe(2)
		})
	})

	describe('removeItem', () => {
		it('should remove an existing item and return delete response', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			const result = wishlist.removeItem('v_1')
			expect(result.id).toBe('v_1')
			expect(wishlist.getItemCount()).toBe(1)
			expect(wishlist.hasItem('v_1')).toBe(false)
			expect(wishlist.hasItem('v_2')).toBe(true)
		})

		it('should be a no-op for non-existent item', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			const result = wishlist.removeItem('v_999')
			expect(result.id).toBe('v_999')
			expect(wishlist.getItemCount()).toBe(1)
		})
	})

	describe('hasItem', () => {
		it('should return true for existing item', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			expect(wishlist.hasItem('v_1')).toBe(true)
		})

		it('should return false for non-existent item', () => {
			const wishlist = new LocalWishlist()
			expect(wishlist.hasItem('v_1')).toBe(false)
		})
	})

	describe('listItems', () => {
		it('should return paginated response with defaults', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			wishlist.addItem('v_3')
			const result = wishlist.listItems()
			expect(result.data).toHaveLength(3)
			expect(result.page.count).toBe(3)
			expect(result.page.offset).toBe(0)
			expect(result.page.limit).toBe(10)
		})

		it('should paginate with custom limit and offset', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			wishlist.addItem('v_3')
			wishlist.addItem('v_4')
			wishlist.addItem('v_5')
			const result = wishlist.listItems({limit: 2, offset: 2})
			expect(result.data).toHaveLength(2)
			expect(result.data[0].product_variant_id).toBe('v_3')
			expect(result.data[1].product_variant_id).toBe('v_4')
			expect(result.page.count).toBe(5)
			expect(result.page.offset).toBe(2)
			expect(result.page.limit).toBe(2)
		})

		it('should return empty page when offset exceeds items', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			const result = wishlist.listItems({limit: 10, offset: 100})
			expect(result.data).toHaveLength(0)
			expect(result.page.count).toBe(1)
		})

		it('should return last page correctly', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			wishlist.addItem('v_3')
			const result = wishlist.listItems({limit: 2, offset: 2})
			expect(result.data).toHaveLength(1)
			expect(result.data[0].product_variant_id).toBe('v_3')
		})

		it('should return empty response for empty wishlist', () => {
			const wishlist = new LocalWishlist()
			const result = wishlist.listItems()
			expect(result.data).toEqual([])
			expect(result.page.count).toBe(0)
		})

		it('should filter by product_variant_id', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			wishlist.addItem('v_3')
			const result = wishlist.listItems({product_variant_id: 'v_2'})
			expect(result.data).toHaveLength(1)
			expect(result.data[0].product_variant_id).toBe('v_2')
			expect(result.page.count).toBe(1)
		})

		it('should return empty when filter matches nothing', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			const result = wishlist.listItems({product_variant_id: 'v_999'})
			expect(result.data).toHaveLength(0)
			expect(result.page.count).toBe(0)
		})
	})

	describe('clear', () => {
		it('should remove all items', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			wishlist.clear()
			expect(wishlist.getItemCount()).toBe(0)
			expect(wishlist.listItems().data).toEqual([])
			expect(JSON.parse(mockStorage._store['wishlist'])).toEqual([])
		})
	})

	describe('getItemCount', () => {
		it('should return 0 for empty wishlist', () => {
			const wishlist = new LocalWishlist()
			expect(wishlist.getItemCount()).toBe(0)
		})

		it('should return correct count', () => {
			const wishlist = new LocalWishlist()
			wishlist.addItem('v_1')
			wishlist.addItem('v_2')
			wishlist.addItem('v_3')
			expect(wishlist.getItemCount()).toBe(3)
		})
	})
})

describe('LocalWishlist without localStorage', () => {
	beforeEach(() => {
		delete (globalThis as Record<string, unknown>).localStorage
	})

	it('should fall back to in-memory storage', () => {
		const wishlist = new LocalWishlist()
		const result = wishlist.addItem('v_1')
		expect(result.data.product_variant_id).toBe('v_1')
		expect(wishlist.getItemCount()).toBe(1)
		expect(wishlist.hasItem('v_1')).toBe(true)
	})

	it('should not persist to localStorage when unavailable', () => {
		const wishlist = new LocalWishlist()
		wishlist.addItem('v_1')
		wishlist.removeItem('v_1')
		expect(wishlist.getItemCount()).toBe(0)
	})

	it('should support clear in-memory', () => {
		const wishlist = new LocalWishlist()
		wishlist.addItem('v_1')
		wishlist.clear()
		expect(wishlist.getItemCount()).toBe(0)
	})
})

describe('LocalWishlist with storage errors', () => {
	it('should handle setItem throwing on save', () => {
		const storage = createMockStorage()
		storage.setItem = jest.fn().mockImplementation((key: string): void => {
			if (key !== '__wishlist_storage_test__') {
				throw new Error('QuotaExceededError')
			}
			storage._store[key] = 'test'
		})
		Object.defineProperty(globalThis, 'localStorage', {value: storage, writable: true, configurable: true})

		const wishlist = new LocalWishlist()
		const result = wishlist.addItem('v_1')
		expect(result.data.product_variant_id).toBe('v_1')
		expect(wishlist.getItemCount()).toBe(1)
	})

	it('should treat storage as unavailable when setItem always throws', () => {
		const storage = createMockStorage()
		storage.setItem = jest.fn().mockImplementation((): void => {
			throw new Error('SecurityError')
		})
		Object.defineProperty(globalThis, 'localStorage', {value: storage, writable: true, configurable: true})

		const wishlist = new LocalWishlist()
		wishlist.addItem('v_1')
		expect(wishlist.getItemCount()).toBe(1)
		expect(wishlist.hasItem('v_1')).toBe(true)
	})
})
