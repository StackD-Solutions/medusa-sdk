'use client'

import {useMutation, useQueryClient} from '@tanstack/react-query'
import useStackdSdk from '../useStackdSdk'
import type {DeleteWishlistArgs, UseDeleteWishlist} from '@/types'

const useDeleteWishlist = (): UseDeleteWishlist => {
	const {sdk} = useStackdSdk()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: async (args: DeleteWishlistArgs) => {
			await sdk.stackd.wishlist.delete(args.wishlistId)
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({queryKey: ['wishlists']})
		}
	})

	return {
		deleteWishlist: async args => {
			await mutation.mutateAsync(args)
		},
		loading: mutation.isPending,
		error: mutation.error?.message ?? null
	}
}

export default useDeleteWishlist
