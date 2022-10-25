# Mash Client SDK

The [Mash](https://getmash.com) Client SDK is a Javascript library that is used to interact with the Mash Consumer Wallet. The SDK loads the wallet and exposes functionality to complete payments or donations on a site.

For more information about integrating Mash: https://guides.getmash.com/getting-started-integrating-mash

Complete set of guides can be found here: https://guides.getmash.com/

## Installation

Install the package with:

```shell
yarn add @mashing/client-sdk
# or 
npm install @mashing/client-sdk --save
```

## Usage

The SDK requires your earner ID to be able to initialize the wallet on your site. If you do not have an account yet, head to https://wallet.getmash.com/earn and set things up. 

```javascript
import Mash from "@mashing/client-sdk"

const mash = new Mash()

// Loads Mash Wallet on site
mash.init({ id: "<earner_id>" }).then(() => {
  // Wallet is now loaded
})

// You can also check Mash is loaded using .isReady()
if (mash.isReady()) {
  // Do something
}
```

## Methods

- [`init`](#init)
- [`access`](#access)
- [`donate`](#donate)
- [`userHasValidBudget`](#userhasvalidbudget)
- [`isReady`](#isready)
___

### `init(settings: MashSettings): Promise<void>`

Initializes the Mash Wallet. When this method is called, the SDK will load the necessary resources for the Mash Wallet. It will connect the site to the wallet and have it ready for any users that visit your site. 

The function accepts a settings object to help configure the Wallet on your site.

```typescript
type WalletPosition = {
  shiftUp?: number;
  shiftLeft?: number;
};

type MashSettings = {
  id: string;
  position?: WalletPosition;
};
```

Once the wallet has been initalized, the `init` function will resolve.

```typescript
import Mash from "@mashing/client-sdk"

const mash = new Mash()

mash.init({ id: "59f316a2-5079-11ed-bdc3-0242ac120002" }).then(() => {
  // Mash is now intialized and ready to be used
})
```

### `access(resourceID: string): Promise<boolean>`

Accepts a resourceID and determine if the user that is logged into the Mash Wallet has access to given resource. The Mash platform will determine if the user has access or requires payment. If the user requires payment, this function will trigger the necessary steps in the Mash Wallet to complete the payment. 

When the Mash Wallet is finished processing the access request, this function will return a boolean indicating if the given user has access to the resource.

```html
<button id="btn"> Access Resource </button>
<div id="content" class="hidden">Secret Sauce</div>
```

```javascript
const content = document.getElementById("content");

const btn = document.getElementById("btn");
btn.onclick = () => {
  mash.access("42ab4348-5079-11ed-bdc3-0242ac120002")
    .then(hasAccess => {
      if (hasAccess) {
        content.setAttribute("class", "show");
      } else {
        alert("You must pay to access the content");
      }
    })
}
```

### `donate(): Promise<void>`

Triggers the donation flow for the current user. When this function is triggered from the site, the Mash Wallet will open up and allow the user to give a donation. 

```html
<button id="donate"> Donate Now </button>
```

```javascript
const donate = document.getElementById("donate");
donate.onclick = () => {
  mash.donate()
    .then(() => {
      alert("Thanks for the donation");
    })
    .catch(() => {
      alert("Donation was cancelled")
    })
}
```

### `userHasValidBudget(resourceID: string): Promise<boolean>`

This function will check if the user has setup a budget on your site. If the user already has setup a budget, it will check the resource cost against the budget and determine if the budget is still valid or if the next purchase will invalidate it. With an active budget, user don't need to confirm every payment. A budget pre-authorizes payment to certain amount. 

Checking if a budget is helpful if you would like to auto-unlock content if the user has already pre-approved purchase to improve the user experience.

```javascript
mash.userHasValidBudget("42ab4348-5079-11ed-bdc3-0242ac120002")
  .then((hasBudget) => {
    if (hasBudget) {
      // logic to auto unlock content
    } else {
      // Lock content
    }
  })
```

### `isReady(): boolean`

This is a helper function to check if the Mash Wallet has been initialized.

```javascript
const isReady = mash.isReady()
```
