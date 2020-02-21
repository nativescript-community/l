# nativescript-l
[![npm](https://img.shields.io/npm/v/nativescript-l.svg)](https://www.npmjs.com/package/nativescript-l)
[![npm](https://img.shields.io/npm/dm/nativescript-l.svg)](https://www.npmjs.com/package/nativescript-l)

This is a plugin for NativeScript that implements internationalization (i18n) using the native capabilities
of each platform. It is a direct fork of [nativescript-localize](https://github.com/EddyVerbruggen/nativescript-localize)

## Differences
This plugin was created to have a different behavior from [nativescript-localize](https://github.com/EddyVerbruggen/nativescript-localize):
* the default `localize` method was renamed to `l`
* the default `l` method tries to load from a local JSON object
* you can load such a JSON object with `loadLocalJSON` passing either the JSON or the path to it
* if no local JSON, `l` load natively
* keys are not encoded anymore, meaning keys are the same in native/js worlds.
* the locale JSON must now be a trully nested object (no `.` in keys names)
* special characters support has been dropped in keys names.


## Credits
A lot of thanks goes out to  [Eddy Verbruggen](https://github.com/EddyVerbruggen) and [Ludovic Fabrèges (@lfabreges)](https://github.com/lfabreges) for developing and maintaining [nativescript-localize](https://github.com/EddyVerbruggen/nativescript-localize).

## Table of contents
* [Installation](#installation)
* [Usage](#usage)
  * [Angular](#angular)
  * [Javascript](#javascript)
  * [Vue](#vue)
* [File format](#file-format)
* [Frequently asked questions](#frequently-asked-questions)
  * [How to set the default language?](#how-to-set-the-default-language)
  * [How to localize the application name?](#how-to-localize-the-application-name)
  * [How to localize iOS properties?](#how-to-localize-ios-properties)
  * [How to change the language dynamically at runtime?](#how-to-change-the-language-dynamically-at-runtime)
* [Troubleshooting](#troubleshooting)
  * [The angular localization pipe does not work when in a modal context](#the-angular-localization-pipe-does-not-work-when-in-a-modal-context)

## Installation
```shell
tns plugin add nativescript-l
```

## Usage
Create a folder `i18n` in the `app` folder with the following structure:
```
app
  | i18n
      | en.json           <-- english language
      | fr.default.json   <-- french language (default)
      | es.js
```

You need to [set the default langage](#how-to-set-the-default-language) and make sure it contains
the [application name](#how-to-localize-the-application-name) to avoid any error.

### Angular
#### app.module.ts
```ts
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptLocalizeModule } from "nativescript-l/angular";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    NativeScriptModule,
    NativeScriptLocalizeModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
```

#### Template
```xml
<Label text="{{ 'Hello world !' | L }}"/>
<Label text="{{ 'I am %s' | L:'user name' }}"/>
```

#### Script
```ts
import { localize } from "nativescript-l";

console.log(localize("Hello world !"));
```

### Javascript / XML

#### app.js
```js
const application = require("application");
const localize = require("nativescript-l");
application.setResources({ L: localize.l });
```

#### Template
```xml
<Label text="{{ L('Hello world !') }}"/>
<Label text="{{ L('I am %s', 'user name') }}"/>
```

#### Script
```js
const localize = require("nativescript-l");

console.log(localize("Hello world !"));
```

#### Quirks
⚠️ If you notice translations work on your main XML page, but don't work on a page you
navigate to, then add this little hack to the 'page loaded' function of that new page:

```js
  const page = args.object;
  page.bindingContext = new Observable();
````

### Vue
#### app.js
```js
import { l } from "nativescript-l";

Vue.filter("L", l);
```

#### Template
```html
<Label :text="'Hello world !'|L"></Label>
<Label :text="'I am %s'|L('user name')"></Label>
```

## File format
Each file is imported using `require`, use the file format of your choice:

#### JSON
```json
{
  "app.name": "My app",
  "ios.info.plist": {
    "NSLocationWhenInUseUsageDescription": "This will be added to InfoPlist.strings"
  },
  "user": {
    "name": "user.name",
    "email": "user.email"
  },
  "array": [
    "split the translation into ",
    "multiples lines"
  ],
  "sprintf": "format me %s",
  "sprintf with numbered placeholders": "format me %2$s one more time %1$s"
}
```

#### Javascript
```js
const i18n = {
  "app.name": "My app"
};

module.exports = i18n;
```

## Frequently asked questions
### How to set the default language?
Add the `.default` extension to the default language file to set it as the fallback language:
```
fr.default.json
```

### How to localize the application name?
The `app.name` key is used to localize the application name:
```json
{
  "app.name": "My app"
}
```

### How to localize iOS properties?
Keys starting with `ios.info.plist.` are used to localize iOS properties:
```json
{
  "ios.info.plist.NSLocationWhenInUseUsageDescription": "This will be added to InfoPlist.strings"
}
```

### How to change the language dynamically at runtime?

Seeing this module now uses JSON objects. Overriding consist of 3 steps:
* overriding native language, done with `overrideLocaleNative`
* overriding json language, done with `loadLocalJSON`
* updating all labels, buttons.... your job!


```typescript
import { overrideLocaleNative } from "nativescript-l/localize";
const localeOverriddenSuccessfully = overrideLocaleNative("en-GB"); // or "nl-NL", etc (or even just the part before the hyphen)
```


> **Important:** In case you are using [Android app bundle](https://docs.nativescript.org/tooling/publishing/android-app-bundle) to release your android app, add this to
> App_Resources/Android/app.gradle to make sure all lanugages are bundled in the split apks

```groovy
android {

  // there maybe other code here //

  bundle {
    language {
      enableSplit = false
    }
  }
}
```

> **Tip:** you can get the default language on user's phone by using this

```ts
import { device } from '@nativescript/core/platform';

console.log("user's language is", device.language.split('-')[0]);
```

> **Tip:** overrideLocaleNative method stores the language in a special key in app-settings,
> you can access it like this,

```ts
import { getString } from '@nativescript/core/application-settings'; 

console.log(getString('__app__language__')); // only available after the first time you use overrideLocaleNative(langName);
```

## Troubleshooting
### The angular localization pipe does not work when in a modal context
As a workaround, you can trigger a change detection from within your component constructor:
```ts
constructor(
  private readonly params: ModalDialogParams,
  private readonly changeDetectorRef: ChangeDetectorRef,
) {
  setTimeout(() => this.changeDetectorRef.detectChanges(), 0);
}
```
