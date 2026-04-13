import Medusa, {ClientHeaders} from '@medusajs/js-sdk'
import {StackdClientOptions, Plugin} from '../..'
import {createFetch} from '../../utils/http'
import {
	EmailVerificationStatusResponse,
	SendVerificationEmailRequest,
	SendVerificationEmailResponse,
	VerifyEmailTokenRequest,
	VerifyEmailTokenResponse
} from '../../types'

type EmailVerificationEndpoints = {
	sendVerificationEmail: (input: SendVerificationEmailRequest, headers?: ClientHeaders) => Promise<SendVerificationEmailResponse>
	verifyToken: (input: VerifyEmailTokenRequest, headers?: ClientHeaders) => Promise<VerifyEmailTokenResponse>
	getVerificationStatus: (headers?: ClientHeaders) => Promise<EmailVerificationStatusResponse>
}

export const emailVerificationPlugin: Plugin<'emailVerification', EmailVerificationEndpoints> = {
	name: 'emailVerification' as const,
	endpoints: (sdk: Medusa, options?: StackdClientOptions) => {
		const fetch = createFetch(sdk, options)

		return {
			sendVerificationEmail: async (input, headers) => fetch('/store/email/verify/send', {method: 'POST', body: input, headers}),
			verifyToken: async (input, headers) => fetch('/store/email/verify', {method: 'POST', body: input, headers}),
			getVerificationStatus: async headers => fetch('/store/email/verify/status', {method: 'GET', headers})
		}
	}
}
