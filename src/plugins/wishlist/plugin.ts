import Medusa, {ClientHeaders} from '@medusajs/js-sdk'
import {StackdClientOptions, Plugin} from '../..'
import {createFetch, toQueryString} from '../../utils/http'
import LocalWishlist from './local-wishlist'
import {
	AddWishlistItemRequest,
	CreateWishlistRequest,
	DeleteResponse,
	ListQuery,
	UpdateWishlistRequest,
	WishlistItemResponse,
	WishlistItemsResponse,
	WishlistListResponse,
	WishlistResponse
} from '../../types'

type WishlistEndpoints = {
	list: (query?: ListQuery, headers?: ClientHeaders) => Promise<WishlistListResponse>
	create: (input: CreateWishlistRequest, headers?: ClientHeaders) => Promise<WishlistResponse>
	retrieve: (id: string, headers?: ClientHeaders) => Promise<WishlistResponse>
	update: (id: string, input: UpdateWishlistRequest, headers?: ClientHeaders) => Promise<WishlistResponse>
	delete: (id: string, headers?: ClientHeaders) => Promise<DeleteResponse>
	listItems: (id: string, query?: ListQuery, headers?: ClientHeaders) => Promise<WishlistItemsResponse>
	addItem: (id: string, input: AddWishlistItemRequest, headers?: ClientHeaders) => Promise<WishlistItemResponse>
	removeItem: (id: string, productVariantId: string, headers?: ClientHeaders) => Promise<DeleteResponse>
}

export const wishlistPlugin: Plugin<'wishlist', WishlistEndpoints> = {
	name: 'wishlist' as const,
	endpoints: (sdk: Medusa, options?: StackdClientOptions) => {
		const fetch = createFetch(sdk, options)
		const localId = options?.localWishlistId ?? 'wishlist'
		const local = new LocalWishlist(localId)
		const isLocal = (id: string): boolean => id === localId

		return {
			list: async (query, headers) => fetch(`/store/wishlists${toQueryString(query)}`, {method: 'GET', headers}),
			create: async (input, headers) => fetch('/store/wishlists', {method: 'POST', body: input, headers}),
			retrieve: async (id, headers) => {
				if (isLocal(id)) {
					return local.retrieve()
				}
				return fetch(`/store/wishlists/${id}`, {method: 'GET', headers})
			},
			update: async (id, input, headers) => fetch(`/store/wishlists/${id}`, {method: 'PUT', body: input, headers}),
			delete: async (id, headers) => fetch(`/store/wishlists/${id}`, {method: 'DELETE', headers}),
			listItems: async (id, query, headers) => {
				if (isLocal(id)) {
					return local.listItems(query)
				}
				return fetch(`/store/wishlists/${id}/items${toQueryString(query)}`, {method: 'GET', headers})
			},
			addItem: async (id, input, headers) => {
				if (isLocal(id)) {
					return local.addItem(input.product_variant_id)
				}
				return fetch(`/store/wishlists/${id}/items`, {method: 'POST', body: input, headers})
			},
			removeItem: async (id, productVariantId, headers) => {
				if (isLocal(id)) {
					return local.removeItem(productVariantId)
				}
				return fetch(`/store/wishlists/${id}/items/${productVariantId}`, {method: 'DELETE', headers})
			}
		}
	}
}
