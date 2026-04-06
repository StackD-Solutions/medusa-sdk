import Medusa, {ClientHeaders} from '@medusajs/js-sdk'
import type {ChangePasswordRequest, ChangePasswordResponse} from '@stackd-solutions/medusa-password-manager'
import {StackdClientOptions, Plugin} from '../..'
import {createFetch} from '../../utils/http'

export type {ChangePasswordRequest, ChangePasswordResponse}

type PasswordManagerEndpoints = {
	changePassword: (input: ChangePasswordRequest, headers?: ClientHeaders) => Promise<ChangePasswordResponse>
}

export const passwordManagerPlugin: Plugin<'passwordManager', PasswordManagerEndpoints> = {
	name: 'passwordManager' as const,
	endpoints: (sdk: Medusa, options?: StackdClientOptions) => {
		const fetch = createFetch(sdk, options)

		return {
			changePassword: async (input, headers) => fetch('/store/customers/me/password/change', {method: 'POST', body: input, headers})
		}
	}
}
