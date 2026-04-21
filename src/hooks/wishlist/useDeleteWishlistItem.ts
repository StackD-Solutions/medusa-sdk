'use client'

import {useMutation, useQueryClient} from '@tanstack/react-query'
import useStackdSdk from '../useStackdSdk'
import type {RemoveWishlistItemArgs, UseDeleteWishlistItem} from '@/types'

const useDeleteWishlistItem = (): UseDeleteWishlistItem => {
	const {sdk} = useStackdSdk()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: async (args: RemoveWishlistItemArgs) => {
			await sdk.stackd.wishlist.removeItem(args.wishlistId, args.productVariantId)
		},
		onSuccess: (_data, args) => {
			void queryClient.invalidateQueries({queryKey: ['wishlists', args.wishlistId, 'items']})
		}
	})

	return {
		deleteWishlistItem: async args => {
			await mutation.mutateAsync(args)
		},
		loading: mutation.isPending,
		error: mutation.error?.message ?? null
	}
}

export default useDeleteWishlistItem
