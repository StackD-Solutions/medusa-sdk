'use client'

import {useMutation, useQueryClient} from '@tanstack/react-query'
import useStackdSdk from '../useStackdSdk'
import type {UseCreateWishlist} from '@/types'

const useCreateWishlist = (): UseCreateWishlist => {
	const {sdk} = useStackdSdk()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationFn: async (args: {name: string; salesChannelId: string}) =>
			sdk.stackd.wishlist.create({name: args.name, sales_channel_id: args.salesChannelId}),
		onSuccess: () => {
			void queryClient.invalidateQueries({queryKey: ['wishlists']})
		}
	})

	return {
		createWishlist: async args => {
			const response = await mutation.mutateAsync(args)
			return response.data
		},
		loading: mutation.isPending,
		error: mutation.error?.message ?? null
	}
}

export default useCreateWishlist
