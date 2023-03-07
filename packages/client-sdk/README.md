# Mash Client SDK

The [Mash](https://getmash.com) Client SDK is a Javascript library that is used to enable your site and experiences to interact with the Mash Consumer Wallet. The SDK loads the wallet that provides users access to their funds, and exposes functionality for you to facilitate payments, donations, boosts, freebies and more between users of your site, web-app, experience and you.

Check out the [Demos And Tutorials](#demos--tutorials) section to get some ideas on what you can build with this SDK.

## Installation

Install the package with:

```shell
yarn add @getmash/client-sdk
# or
npm install @getmash/client-sdk --save
```

## Usage

The SDK requires your earner ID to be able to initialize the wallet on your site – so that you are paid directly into your wallet. If you do not have an account yet, head over to https://app.mash.com/earn to set things up.

The SDK retrieves settings from the Mash Platform to configure the position of the wallet on your site. It also supports loading the theme for web components that was selected in the Mash Platform.

```javascript
import Mash from "@getmash/client-sdk";

const mash = new Mash({ earnerID: "<earner_id>" });

// Loads Mash Wallet on site
mash.init().then(() => {
  // Wallet is now loaded
});

// You can also check Mash is loaded using .isReady()
if (mash.isReady()) {
  // Do something
}
```

The constructor accepts the following config object:

```
type Config = {
  autoHide: boolean;
  earnerID: string;
  widgets: {
    injectTheme: boolean;
    injectWidgets: boolean;
  };
};
```

`autoHide`: Controls the behaviour of the wallet. If it is set to true, the wallet will hide when there are no known Mash widgets on the page. Default: `true`

`earnerID`: Identifer for your earner account

`injectTheme`: If set to true, it will load the theme that was configured in the Mash Platform. Default: `true`

`injectWidgets`: If set to true, the SDK will inject script tags for all Mash Widgets. Default: `true`

## Methods

- [`init`](#init)
- [`access`](#access)
- [`donate`](#donate)
- [`userHasValidBudget`](#userhasvalidbudget)
- [`isReady`](#isready)

---

### `init(): Promise<void>`

Initializes the Mash Wallet. When this method is called, the SDK will load the necessary resources for the Mash Wallet. It will connect the site to the wallet and have it ready for any users that visit your site.

Once the wallet has been initalized, the `init` function will resolve.

```typescript
import Mash from "@getmash/client-sdk";

const mash = new Mash({ earnerID: "59f316a2-5079-11ed-bdc3-0242ac120002" });

mash.init().then(() => {
  // Mash is now intialized and ready to be used
});
```

### `access(resourceID: string): Promise<boolean>`

For use when charging for an experience, or providing access with a "freebie" as defined in your pricing setup for this specific experience, action, event, or click. Accepts a resourceID and determines if the user is logged into the Mash Wallet, and has access to the given resource. The Mash platform will determine if the user has access from a freebie, or requires payment. If the user requires payment, this function will trigger the necessary steps in the Mash Wallet to complete the payment. Users with a budget set for your site or experience, will auto-pay if they have enough funds available.

When the Mash Wallet is finished processing the access request, this function will return a boolean indicating if the given user has access to the resource. Access is granted if the user has a "freebie" available for the action, or has completed payment.

```html
<button id="btn">Access Resource</button>
<div id="content" class="hidden">Secret Sauce</div>
```

```javascript
const content = document.getElementById("content");

const btn = document.getElementById("btn");
btn.onclick = () => {
  mash.access("42ab4348-5079-11ed-bdc3-0242ac120002").then(hasAccess => {
    if (hasAccess) {
      content.setAttribute("class", "show");
    } else {
      alert("You must pay to access the content");
    }
  });
};
```

### `donate(): Promise<void>`

Triggers the donation flow for the current user. When this function is triggered from the site, the Mash Wallet will open up and allow the user to give a donation.

```html
<button id="donate">Donate Now</button>
```

```javascript
const donate = document.getElementById("donate");
donate.onclick = () => {
  mash
    .donate()
    .then(() => {
      alert("Thanks for the donation");
    })
    .catch(() => {
      alert("Donation was cancelled");
    });
};
```

### `userHasValidBudget(resourceID: string): Promise<boolean>`

This function will check if the user has setup a budget on your site. If the user already has setup a budget, it will check the resource cost against the budget and determine if the budget is still valid or if the next purchase will invalidate it. With an active budget, users don't need to confirm every payment. A budget pre-authorizes payment to certain amount, and enables auto-payment without requiring a confirmation from the user.

Checking if there's a budget is helpful if you would like to auto-unlock content if the user has already pre-approved purchase to improve the user experience. This can be done to unlock an entire page immediately when they visit it, or to complete an event for the user without confirmation needed.

```javascript
mash
  .userHasValidBudget("42ab4348-5079-11ed-bdc3-0242ac120002")
  .then(hasBudget => {
    if (hasBudget) {
      // logic to auto unlock content
    } else {
      // Lock content
    }
  });
```

### `isReady(): boolean`

This is a helper function to check if the Mash Wallet has been initialized.

```javascript
const isReady = mash.isReady();
```


## Demos & Tutorials
We built these on Replit. 

Learn more about Mash on Replit: 
https://www.getmash.com/news/building-on-replit-with-mash

Complete set of guides can be found here: https://guides.getmash.com/

### Tutorial

This template walks you through how to monetize a JavaScript web app with Mash, Bitcoin and the Lightning Network by extending a "Pet Rock Simulator" game.

Follow along with the README or tutorial to get started. Discover how to get up and running with Mash, how to use the JavaScript SDK to charge any amount for actions in your app, and how to view your earnings in the Mash web app. You'll also learn how to add a "Boost" tip button to allow users to donate to you with a single click.

After walking through all the steps, you'll have a web app that instantly sends bitcoin to your Mash wallet for every user action, allowing users to pay-as-they-enjoy. The same approach can be used for any web app, game, tool, or website, allowing you to make money for your creations!

* https://replit.com/@getmash/Monetize-a-web-app-with-Mash-and-Bitcoin-Pet-Rock-Simulator?v=1


### Demos
#### **Monetization Overview**

This repl provides a list of examples, demos, widgets and guides to get monetizing with Mash. Try it out, share your feedback and let's enable a future where valuable apps and experiences are rewarded properly.

* https://replit.com/@getmash/Mash-Monetization-Overview?v=1


#### **Stable Diffusion AI Art Generator with Mash**

A Next.js app powered by Mash that accepts a text prompt and generates a piece of art based on it. (For example, "highly detailed painting of an alien landscape, oil on canvas" or "a portrait of an elf drawn with crayons"). It also features a "snow mode", which makes everything holiday themed (falling snow included) and asks you to fill in a prompt about the Grinch.

It makes use of the Stability AI API to generate the images and the Mash platform to request payment for image generation. This repl can be forked to create your own AI art generator, or to earn money for another Next.js app that you've built!

* https://replit.com/@getmash/Stable-Diffusion-AI-Art-Generator-with-Mash?v=1


#### **Donation & Profile / Link-in-Bio Replacement Site**

This Repl provides a canvas to create a link-in-bio page with new donation features built-in. Users can support you with one-click donations called Boosts (no credit cards every time), support you with Bitcoin Lightning Network with an LN-URL QR Code or Lightning Address and also get links to your site and bio pages. Get started and discover the future of payments.

Users that visit your site get access to their funds in their Mash Wallet, can create an account and get funds immediately to support you, or scan the QR code with another supporting wallet.

* https://replit.com/@getmash/Donation-and-Profile-Link-in-Bio-Replacement-Site?v=1


#### **Book & Content Website Template w/ Mash Monetization**

With this Gatsby Template in Replit, you can easily create a book or content based website with built in one-click monetization, donations and you can charge users for premium chapters & content with any amount. Users can auto-pay when they set a budget.

You can edit the content and pricing with a few changes, and markdown, extend chapters, redesign it and more. Users can auto-pay per chapter as they read your content, paying as they enjoy. Or one-click tip boost for your content. Additionally you can add bitcoin & lightning network native donations and more! 

#### **The Dino Game w/ Santa Christmas Extension & Monetization**

The classic Chrome Dinosaur Game repurposed to showcase how to use Mash to monetize a simple little game.

* https://replit.com/@getmash/The-Dino-Game-with-Santa-Christmas-Extension-and-Monetization?v=1
