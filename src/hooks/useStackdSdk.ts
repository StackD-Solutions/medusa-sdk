'use client'

import {useContext} from 'react'
import {StackdSdkContext, type StackdSdkContextValue} from '../providers/StackdSdkProvider'

const useStackdSdk = (): StackdSdkContextValue => {
	const context = useContext(StackdSdkContext)
	if (!context) {
		throw new Error('useStackdSdk must be used within a StackdSdkProvider')
	}
	return context
}

export default useStackdSdk
