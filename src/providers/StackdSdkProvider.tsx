'use client'

import {createContext, useState, type ReactNode} from 'react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import type {StackdMedusaSdk, ResolvedStackdClientOptions, Plugin} from '..'

export type StackdSdkContextValue = {
	sdk: StackdMedusaSdk<ReadonlyArray<Plugin<string, any>>>
	options: ResolvedStackdClientOptions
}

export const StackdSdkContext = createContext<StackdSdkContextValue | null>(null)

type StackdSdkProviderProps = {
	sdk: StackdMedusaSdk<ReadonlyArray<Plugin<string, any>>>
	children: ReactNode
}

const StackdSdkProvider = ({sdk, children}: StackdSdkProviderProps): ReactNode => {
	const [queryClient] = useState(() => new QueryClient())

	return (
		<QueryClientProvider client={queryClient}>
			<StackdSdkContext.Provider value={{sdk, options: sdk.options}}>{children}</StackdSdkContext.Provider>
		</QueryClientProvider>
	)
}

export default StackdSdkProvider
