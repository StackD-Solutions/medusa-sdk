'use client'

import {useQuery} from '@tanstack/react-query'
import useStackdSdk from '../useStackdSdk'
import type {UseWishlist} from '@/types'

const useWishlist = (wishlistId: string): UseWishlist => {
	const {sdk} = useStackdSdk()

	const {data, isLoading, error} = useQuery({
		queryKey: ['wishlists', wishlistId],
		queryFn: () => sdk.stackd.wishlist.retrieve(wishlistId)
	})

	return {
		wishlist: data?.data ?? null,
		loading: isLoading,
		error: error?.message ?? null
	}
}

export default useWishlist
