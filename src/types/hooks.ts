import type {UpdateWishlistRequest, Wishlist, WishlistItem} from './wishlist'

export type CreateWishlistArgs = {
	name: string
	salesChannelId: string
}

export type UpdateWishlistArgs = {
	wishlistId: string
} & UpdateWishlistRequest

export type DeleteWishlistArgs = {
	wishlistId: string
}

export type AddWishlistItemArgs = {
	wishlistId: string
	productVariantId: string
}

export type RemoveWishlistItemArgs = {
	wishlistId: string
	productVariantId: string
}

export type UseCreateWishlist = {
	createWishlist: (args: CreateWishlistArgs) => Promise<Wishlist>
	loading: boolean
	error: string | null
}

export type UseCreateWishlistItem = {
	createWishlistItem: (args: AddWishlistItemArgs) => Promise<void>
	loading: boolean
	error: string | null
}

export type UseDeleteWishlist = {
	deleteWishlist: (args: DeleteWishlistArgs) => Promise<void>
	loading: boolean
	error: string | null
}

export type UseDeleteWishlistItem = {
	deleteWishlistItem: (args: RemoveWishlistItemArgs) => Promise<void>
	loading: boolean
	error: string | null
}

export type UseUpdateWishlist = {
	updateWishlist: (args: UpdateWishlistArgs) => Promise<Wishlist>
	loading: boolean
	error: string | null
}

export type UseWishlist = {
	wishlist: Wishlist | null
	loading: boolean
	error: string | null
}

export type UseWishlists = {
	wishlists: Array<Wishlist>
	total: number
	currentPage: number
	pageSize: number
	setCurrentPage: (page: number) => void
	setPageSize: (size: number) => void
	loading: boolean
	error: string | null
}

export type UseWishlistItems = {
	items: Array<WishlistItem>
	total: number
	currentPage: number
	pageSize: number
	setCurrentPage: (page: number) => void
	setPageSize: (size: number) => void
	loading: boolean
	error: string | null
}

