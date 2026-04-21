import Medusa from '@medusajs/js-sdk'
export * from './plugins'
export * from './types'
export * from './hooks/wishlist'
export {default as LocalWishlist} from './plugins/wishlist/local-wishlist'
export {default as StackdSdkProvider} from './providers/StackdSdkProvider'
export {default as useStackdSdk} from './hooks/useStackdSdk'

export type StackdClientOptions = {
	getAuthHeader?: () => Promise<Record<string, string>> | Record<string, string>
	localWishlistId?: string
	defaultPageSize?: number
}

export type ResolvedStackdClientOptions = Required<Pick<StackdClientOptions, 'defaultPageSize'>> & StackdClientOptions

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
	public readonly options: ResolvedStackdClientOptions
	protected medusaConfig: StackdMedusaConfig

	constructor(medusaOptions: StackdMedusaConfig, plugins: TPlugins, options?: StackdClientOptions) {
		super(medusaOptions)
		this.options = {defaultPageSize: 10, ...options}
		this.medusaConfig = medusaOptions

		const endpoints: Record<string, any> = {}
		plugins.forEach(plugin => {
			endpoints[plugin.name] = plugin.endpoints(this, this.options, this.medusaConfig)
		})
		this.stackd = endpoints as PluginsToStackd<TPlugins>
	}
}
