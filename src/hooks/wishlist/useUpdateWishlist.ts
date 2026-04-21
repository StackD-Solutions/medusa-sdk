'use client'

import {useMutation, useQueryClient} from '@tanstack/react-query'
import useStackdSdk from '../useStackdSdk'
import type {UpdateWishlistArgs, UseUpdateWishlist} from '@/types'

const useUpdateWishlist = (): UseUpdateWishlist => {
	const {sdk} = useStackdSdk()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: async (args: UpdateWishlistArgs) => {
			const {wishlistId, ...data} = args
			return sdk.stackd.wishlist.update(wishlistId, data)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({queryKey: ['wishlists']})
		}
	})

	return {
		updateWishlist: async args => {
			const response = await mutation.mutateAsync(args)
			return response.data
		},
		loading: mutation.isPending,
		error: mutation.error?.message ?? null
	}
}

export default useUpdateWishlist
