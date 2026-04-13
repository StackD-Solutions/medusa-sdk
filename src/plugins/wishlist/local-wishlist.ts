
import {ListQuery, WishlistItem, WishlistResponse, WishlistItemResponse, WishlistItemsResponse, DeleteResponse} from '../../types'
import {generateId} from '../../utils/crypto'

class LocalWishlist {
	private readonly storageKey: string
	private items: Array<WishlistItem>
	private readonly storageAvailable: boolean

	constructor(storageKey: string = 'wishlist') {
		this.storageKey = storageKey
		this.storageAvailable = this.isStorageAvailable()
		this.items = this.load()
	}

	private isStorageAvailable(): boolean {
		try {
			const testKey = '__wishlist_storage_test__'
			localStorage.setItem(testKey, 'test')
			localStorage.removeItem(testKey)
			return true
		} catch {
			return false
		}
	}

	private load(): Array<WishlistItem> {
		if (!this.storageAvailable) {
			return []
		}
		try {
			const data = localStorage.getItem(this.storageKey)
			if (!data) {
				return []
			}
			return JSON.parse(data) as Array<WishlistItem>
		} catch {
			return []
		}
	}

	private save(): void {
		if (!this.storageAvailable) {
			return
		}
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.items))
		} catch {
			// Storage full or unavailable
		}
	}

	retrieve(): WishlistResponse {
		const now = new Date().toISOString()
		return {
			data: {
				id: this.storageKey,
				name: this.storageKey,
				customer_id: '',
				sales_channel_id: '',
				visibility: 'private',
				items_count: this.items.length,
				created_at: now,
				updated_at: now,
				deleted_at: null,
			}
		}
	}

	listItems(query?: ListQuery): WishlistItemsResponse {
		const limit = query?.limit ?? 10
		const offset = query?.offset ?? 0
		const filtered = query?.product_variant_id
			? this.items.filter((item) => item.product_variant_id === query.product_variant_id)
			: this.items
		const count = filtered.length
		const page = filtered.slice(offset, offset + limit)
		return {
			data: page,
			page: {offset, limit, count}
		}
	}

	addItem(productVariantId: string): WishlistItemResponse {
		const existing = this.items.find((item) => item.product_variant_id === productVariantId)
		if (existing) {
			return {data: existing}
		}
		const now = new Date().toISOString()
		const item: WishlistItem = {
			id: generateId(),
			product_variant_id: productVariantId,
			wishlist_id: this.storageKey,
			created_at: now,
			updated_at: now,
			deleted_at: null
		}
		this.items.push(item)
		this.save()
		return {data: item}
	}

	removeItem(productVariantId: string): DeleteResponse {
		this.items = this.items.filter((item) => item.product_variant_id !== productVariantId)
		this.save()
		return {id: productVariantId}
	}

	hasItem(productVariantId: string): boolean {
		return this.items.some((item) => item.product_variant_id === productVariantId)
	}

	clear(): void {
		this.items = []
		this.save()
	}

	getItemCount(): number {
		return this.items.length
	}
}

export default LocalWishlist
