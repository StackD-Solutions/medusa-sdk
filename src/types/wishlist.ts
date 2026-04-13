export type {
	Wishlist,
	WishlistItem,
	WishlistVisibility,
	WishlistListResponse,
	WishlistResponse,
	WishlistItemsResponse,
	WishlistItemResponse,
	DeleteResponse,
	PaginationMetadata,
	CreateWishlistRequest,
	UpdateWishlistRequest,
	AddWishlistItemRequest,
	ProductWishlistCountResponse
} from '@stackd-solutions/medusa-wishlist'

export type ListQuery = {
	limit?: number
	offset?: number
	product_variant_id?: string
}
