'use client'

import {useMutation, useQueryClient} from '@tanstack/react-query'
import useStackdSdk from '../useStackdSdk'
import type {AddWishlistItemArgs, UseCreateWishlistItem} from '@/types'

const useCreateWishlistItem = (): UseCreateWishlistItem => {
	const {sdk} = useStackdSdk()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: async (args: AddWishlistItemArgs) => {
			await sdk.stackd.wishlist.addItem(args.wishlistId, {product_variant_id: args.productVariantId})
		},
		onSuccess: (_data, args) => {
			void queryClient.invalidateQueries({queryKey: ['wishlists', args.wishlistId, 'items']})
		}
	})

	return {
		createWishlistItem: async args => {
			await mutation.mutateAsync(args)
		},
		loading: mutation.isPending,
		error: mutation.error?.message ?? null
	}
}

export default useCreateWishlistItem
