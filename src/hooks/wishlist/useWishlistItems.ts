'use client'

import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import useStackdSdk from '../useStackdSdk'
import type {UseWishlistItems} from '@/types'

const useWishlistItems = (wishlistId: string): UseWishlistItems => {
	const {sdk, options} = useStackdSdk()
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(options.defaultPageSize)
	const offset = (currentPage - 1) * pageSize

	const {data, isLoading, error} = useQuery({
		queryKey: ['wishlists', wishlistId, 'items', {offset, limit: pageSize}],
		queryFn: () => sdk.stackd.wishlist.listItems(wishlistId, {limit: pageSize, offset})
	})

	return {
		items: data?.data ?? [],
		total: data?.page.count ?? 0,
		currentPage,
		pageSize,
		setCurrentPage,
		setPageSize,
		loading: isLoading,
		error: error?.message ?? null
	}
}

export default useWishlistItems
