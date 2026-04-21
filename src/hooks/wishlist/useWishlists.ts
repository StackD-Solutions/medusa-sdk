'use client'

import {useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import useStackdSdk from '../useStackdSdk'
import type {UseWishlists} from '@/types'

const useWishlists = (): UseWishlists => {
	const {sdk, options} = useStackdSdk()
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(options.defaultPageSize)
	const offset = (currentPage - 1) * pageSize

	const {data, isLoading, error} = useQuery({
		queryKey: ['wishlists', {offset, limit: pageSize}],
		queryFn: () => sdk.stackd.wishlist.list({limit: pageSize, offset}),
	})

	return {
		wishlists: data?.data ?? [],
		total: data?.page.count ?? 0,
		currentPage,
		pageSize,
		setCurrentPage,
		setPageSize,
		loading: isLoading,
		error: error?.message ?? null
	}
}

export default useWishlists
