import Medusa from '@medusajs/js-sdk'
export * from './plugins'
export * from './types'
export {default as LocalWishlist} from './plugins/wishlist/local-wishlist'

export type StackdClientOptions = {
	getAuthHeader?: () => Promise<Record<string, string>> | Record<string, string>
	localWishlistId?: string
}

export type StackdMedusaConfig = ConstructorParameters<typeof Medusa>[0]

export type Plugin<Name extends string, Endpoints> = {
	name: Name
	endpoints: (client: Medusa, options?: StackdClientOptions, medusaConfig?: StackdMedusaConfig) => Endpoints
}

export type PluginsToStackd<T extends readonly Plugin<any, any>[]> = {
	[K in T[number] as K['name']]: ReturnType<K['endpoints']>
}

export class StackdMedusaSdk<TPlugins extends readonly Plugin<any, any>[]> extends Medusa {
	public stackd: PluginsToStackd<TPlugins>
	public authenticated: boolean = false
	protected options?: StackdClientOptions
	protected medusaConfig: StackdMedusaConfig

	constructor(medusaOptions: StackdMedusaConfig, plugins: TPlugins, options?: StackdClientOptions) {
		super(medusaOptions)
		this.options = options
		this.medusaConfig = medusaOptions

		const endpoints: Record<string, any> = {}
		plugins.forEach(plugin => {
			endpoints[plugin.name] = plugin.endpoints(this, this.options, this.medusaConfig)
		})
		this.stackd = endpoints as PluginsToStackd<TPlugins>
	}
}
