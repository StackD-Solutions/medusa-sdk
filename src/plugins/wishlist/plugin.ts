import Medusa, {ClientHeaders} from '@medusajs/js-sdk'
import type {
	Wishlist,
	WishlistItem,
	PaginatedWishlistResponse,
	PaginatedWishlistItemResponse,
	CreateWishlistRequest,
	UpdateWishlistRequest,
	AddItemToWishlistRequest,
	ImportWishlistRequest,
	ShareTokenResponse,
	DeleteResponse,
	TotalItemsCountResponse,
	ListWishlistsQuery,
	RetrieveWishlistQuery,
	TotalItemsCountQuery
} from '@stackd-solutions/medusa-wishlist'
import {StackdClientOptions, Plugin} from '../..'
import {createFetch, toQueryString} from '../../utils/http'

export type {
	Wishlist,
	WishlistItem,
	PaginatedWishlistResponse,
	PaginatedWishlistItemResponse,
	CreateWishlistRequest,
	UpdateWishlistRequest,
	AddItemToWishlistRequest,
	ImportWishlistRequest,
	ShareTokenResponse,
	DeleteResponse,
	TotalItemsCountResponse,
	ListWishlistsQuery,
	RetrieveWishlistQuery,
	TotalItemsCountQuery
}

export type ListItemsQuery = {
	limit?: number
	offset?: number
}

type WishlistEndpoints = {
	list: (query?: ListWishlistsQuery, headers?: ClientHeaders) => Promise<PaginatedWishlistResponse>
	create: (input: CreateWishlistRequest, headers?: ClientHeaders) => Promise<Wishlist>
	retrieve: (id: string, query?: RetrieveWishlistQuery, headers?: ClientHeaders) => Promise<Wishlist>
	update: (id: string, input: UpdateWishlistRequest, headers?: ClientHeaders) => Promise<Wishlist>
	delete: (id: string, headers?: ClientHeaders) => Promise<DeleteResponse>
	listItems: (id: string, query?: ListItemsQuery, headers?: ClientHeaders) => Promise<PaginatedWishlistItemResponse>
	addItem: (id: string, input: AddItemToWishlistRequest, headers?: ClientHeaders) => Promise<WishlistItem>
	removeItem: (id: string, itemId: string, headers?: ClientHeaders) => Promise<DeleteResponse>
	generateShareToken: (id: string, headers?: ClientHeaders) => Promise<ShareTokenResponse>
	transfer: (id: string, headers?: ClientHeaders) => Promise<Wishlist>
	import: (input: ImportWishlistRequest, headers?: ClientHeaders) => Promise<Wishlist>
	getTotalItemsCount: (query?: TotalItemsCountQuery, headers?: ClientHeaders) => Promise<TotalItemsCountResponse>
}

export const wishlistPlugin: Plugin<'wishlist', WishlistEndpoints> = {
	name: 'wishlist' as const,
	endpoints: (sdk: Medusa, options?: StackdClientOptions) => {
		const fetch = createFetch(sdk, options)

		return {
			list: async (query, headers) => fetch(`/store/wishlists${toQueryString(query)}`, {method: 'GET', headers}),
			create: async (input, headers) => fetch('/store/wishlists', {method: 'POST', body: input, headers}),
			retrieve: async (id, query, headers) => fetch(`/store/wishlists/${id}${toQueryString(query)}`, {method: 'GET', headers}),
			update: async (id, input, headers) => fetch(`/store/wishlists/${id}`, {method: 'PUT', body: input, headers}),
			delete: async (id, headers) => fetch(`/store/wishlists/${id}`, {method: 'DELETE', headers}),
			listItems: async (id, query, headers) => fetch(`/store/wishlists/${id}/items${toQueryString(query)}`, {method: 'GET', headers}),
			addItem: async (id, input, headers) => fetch(`/store/wishlists/${id}/items`, {method: 'POST', body: input, headers}),
			removeItem: async (id, itemId, headers) => fetch(`/store/wishlists/${id}/items/${itemId}`, {method: 'DELETE', headers}),
			generateShareToken: async (id, headers) => fetch(`/store/wishlists/${id}/share`, {method: 'POST', headers}),
			transfer: async (id, headers) => fetch(`/store/wishlists/${id}/transfer`, {method: 'POST', headers}),
			import: async (input, headers) => fetch('/store/wishlists/import', {method: 'POST', body: input, headers}),
			getTotalItemsCount: async (query, headers) => fetch(`/store/wishlists/total-items-count${toQueryString(query)}`, {method: 'GET', headers})
		}
	}
}
