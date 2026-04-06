<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.stackd-solutions.io"><img src="https://raw.githubusercontent.com/StackD-Solutions/medusa-sdk/main/docs/logo.svg" alt="StackD Solutions" width="250"></a>
  <br>Medusa SDK
  <br>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@stackd-solutions/medusa-sdk"><img src="https://img.shields.io/npm/v/@stackd-solutions/medusa-sdk" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/@stackd-solutions/medusa-sdk"><img src="https://img.shields.io/npm/dm/@stackd-solutions/medusa-sdk" alt="npm downloads"></a>
  <img src="https://img.shields.io/npm/l/@stackd-solutions/medusa-sdk" alt="Apache License">
  <img src="https://img.shields.io/npm/types/@stackd-solutions/medusa-sdk" alt="Types Included">
</p>

An extended [Medusa v2](https://medusajs.com/) SDK client with typed endpoints for StackD Solutions plugins. It extends `@medusajs/js-sdk` with a plugin system that adds fully typed methods for each plugin's API.

## Installation

```bash
yarn add @stackd-solutions/medusa-sdk @medusajs/js-sdk
```

## Usage

```typescript
import {StackdMedusaSdk, emailVerificationPlugin, passwordManagerPlugin, wishlistPlugin} from '@stackd-solutions/medusa-sdk'

const sdk = new StackdMedusaSdk(
	{
		baseUrl: 'http://localhost:9000',
		auth: {type: 'session', jwtTokenStorageKey: 'medusa_auth_token'}
	},
	[emailVerificationPlugin, passwordManagerPlugin, wishlistPlugin] as const,
	{
		getAuthHeader: async () => ({
			Authorization: `Bearer ${localStorage.getItem('medusa_auth_token')}`
		})
	}
)

// All plugin endpoints are available under sdk.stackd
const status = await sdk.stackd.emailVerification.getVerificationStatus()
```

## Available Plugins

| Plugin             | Namespace                      | Description                                         |
| ------------------ | ------------------------------ | --------------------------------------------------- |
| Email Verification | `sdk.stackd.emailVerification` | Send, verify, and check customer email verification |
| Password Manager   | `sdk.stackd.passwordManager`   | Change customer passwords                           |
| Wishlist           | `sdk.stackd.wishlist`          | Create, manage, and share product wishlists         |

### Email Verification

Companion SDK for the [`@stackd-solutions/medusa-email-verification`](https://www.npmjs.com/package/@stackd-solutions/medusa-email-verification) plugin. Provides typed methods for the email verification store API.

```typescript
import {emailVerificationPlugin} from '@stackd-solutions/medusa-sdk'
```

**Endpoints:**

| Method                  | HTTP                             | Description                                               |
| ----------------------- | -------------------------------- | --------------------------------------------------------- |
| `sendVerificationEmail` | `POST /store/email/verify/send`  | Send a verification email to the authenticated customer   |
| `verifyToken`           | `POST /store/email/verify`       | Verify an email token                                     |
| `getVerificationStatus` | `GET /store/email/verify/status` | Get the verification status of the authenticated customer |

**Example:**

```typescript
// Send verification email
await sdk.stackd.emailVerification.sendVerificationEmail({
	callback_url: 'https://mystore.com/email/verify'
})

// Verify token from email link
const result = await sdk.stackd.emailVerification.verifyToken({
	token: 'abc123'
})

// Check verification status
const {verified} = await sdk.stackd.emailVerification.getVerificationStatus()
```

### Password Manager

Companion SDK for the [`@stackd-solutions/medusa-password-manager`](https://www.npmjs.com/package/@stackd-solutions/medusa-password-manager) plugin. Provides a typed method for the password change store API.

```typescript
import {passwordManagerPlugin} from '@stackd-solutions/medusa-sdk'
```

**Endpoints:**

| Method           | HTTP                                        | Description                                    |
| ---------------- | ------------------------------------------- | ---------------------------------------------- |
| `changePassword` | `POST /store/customers/me/password/change`  | Change the authenticated customer's password   |

**Example:**

```typescript
await sdk.stackd.passwordManager.changePassword({
	current_password: 'old-password',
	new_password: 'new-password'
})
```

### Wishlist

Companion SDK for the [`@stackd-solutions/medusa-wishlist`](https://www.npmjs.com/package/@stackd-solutions/medusa-wishlist) plugin. Provides typed methods for the wishlist store API.

```typescript
import {wishlistPlugin} from '@stackd-solutions/medusa-sdk'
```

**Endpoints:**

| Method               | HTTP                                         | Description                             |
| -------------------- | -------------------------------------------- | --------------------------------------- |
| `list`               | `GET /store/wishlists`                       | List wishlists for the current customer |
| `create`             | `POST /store/wishlists`                      | Create a new wishlist                   |
| `retrieve`           | `GET /store/wishlists/:id`                   | Retrieve a wishlist by ID               |
| `update`             | `PUT /store/wishlists/:id`                   | Update wishlist metadata                |
| `delete`             | `DELETE /store/wishlists/:id`                | Delete a wishlist                       |
| `listItems`          | `GET /store/wishlists/:id/items`             | List items in a wishlist                |
| `addItem`            | `POST /store/wishlists/:id/items`            | Add a product variant to a wishlist     |
| `removeItem`         | `DELETE /store/wishlists/:id/items/:item_id` | Remove an item from a wishlist          |
| `generateShareToken` | `POST /store/wishlists/:id/share`            | Generate a share token for a wishlist   |
| `transfer`           | `POST /store/wishlists/:id/transfer`         | Transfer a guest wishlist to a customer |
| `import`             | `POST /store/wishlists/import`               | Import a shared wishlist via token      |
| `getTotalItemsCount` | `GET /store/wishlists/total-items-count`     | Get total items count across wishlists  |

**Example:**

```typescript
// Create a wishlist
const wishlist = await sdk.stackd.wishlist.create({
	name: 'My Favorites',
	sales_channel_id: 'sc_123'
})

// Add an item
await sdk.stackd.wishlist.addItem(wishlist.id, {
	product_variant_id: 'variant_123'
})

// List wishlists
const {data} = await sdk.stackd.wishlist.list({limit: 10, offset: 0})

// Share a wishlist
const {share_token} = await sdk.stackd.wishlist.generateShareToken(wishlist.id)
```

## Plugin System

The SDK uses a generic plugin system. Each plugin registers a set of typed endpoints under a named key:

```typescript
import {Plugin, StackdMedusaSdk} from '@stackd-solutions/medusa-sdk'

const myPlugin: Plugin<'myPlugin', MyEndpoints> = {
	name: 'myPlugin' as const,
	endpoints: (sdk, options, medusaConfig) => ({
		// your typed endpoint methods
	})
}

const sdk = new StackdMedusaSdk(medusaOptions, [myPlugin] as const)
sdk.stackd.myPlugin // fully typed
```

## Types

The SDK exports the following types:

```typescript
import type {StackdClientOptions, StackdMedusaConfig, Plugin, PluginsToStackd} from '@stackd-solutions/medusa-sdk'
```

| Type                  | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `StackdClientOptions` | Options passed to plugins (e.g. `getAuthHeader`)             |
| `StackdMedusaConfig`  | Constructor parameters for the underlying `@medusajs/js-sdk` |
| `Plugin`              | Plugin definition with a name and endpoint factory           |
| `PluginsToStackd`     | Utility type that maps a plugin tuple to its endpoint types  |

## Build

```bash
yarn build
```

## Development

```bash
yarn dev
```

## License

Apache 2.0
