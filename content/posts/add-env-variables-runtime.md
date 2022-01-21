---
title: Adding environment variables to the runtime in Nuxt3 [Beta]
description: Exposing environment variables to the runtime in Nuxt3
keywords: [developer, jamaican, vue.js, supabase, Nuxt3, vite]
language: Javascript - Vue.js
tag: Nuxt3
rating: 0
readTime: 10
img: 'https://res.cloudinary.com/ddszyeplg/image/upload/v1642350413/vantol/black-text_emxagi.png'
author:
  name: Vantol Bennett
  website: www.teammps.com
  img: 'https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg'
---


# Runtime Config in Nuxt 3

Nuxt3 is still in beta and is not ready for production use (ish), but that hasn't stopped many developers to take advantage of the unique features, power and significant performance boost that Nuxt3 offers. Although the documentation is still a work in progress, it is a great place to start. So developers can get a feel for the power of Nuxt3 and how it can be used to build their own web application. Building applications with Nuxt3 allows for a much more flexible and powerful approach to building applications, one such approach is how exposing config and environment variables are exposed to the rest of app. Let's take a look at how this is done.

## Exposing Environment Variables to the Runtime

All the heavy lifting is done by Nuxt in the nuxt.config.js file. This file is where you can set up the environment variables that you want to expose to the rest of the application. This is done by adding the `privateRuntimeConfig` or publicRuntimeConfig` property to the nuxt.config.js file. As the name suggests, both of these properties are used based on accessiblity on the client side or server side.

Example:

```

export default defineNuxtConfig({
  ...
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: 'https://api.example.com',
  },
  privateRuntimeConfig: {
    apiUrl: process.env.API_URL,
    apiKey: process.env.API_KEY,
    ...
  },
  ...
})
```

The publicRuntimeConfig property will be added to Nuxt pages through the apiUrl allowing for universal access for apiUrl to both client and server.


## Environmental Variables - Using Supabase

Ok so, whether you are a new developer or a experienced one environment variables are common way to access configuration. We add a .env file to the root directory, Nuxt will added these variables to process.env and is accessible in nuxt.config.js. Let see what how to add Supabase url and key.

`npm install @supabase/supabase-js`

***

Example: 

```
.env

SUPABASE_URL=/* URL KEY HERE*/
SUPABASE_ANON_KEY=/* KEY ADDED HERE */

```

```

export default defineNuxtConfig({
  ...
  publicRuntimeConfig: {
    // Will be available on both server and client
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
  },
  ...
})
```

This is important part of this post, accessing the supabase variables in the publicRunTime config can only be done on the client side using the useRunTimeConfig in the setup or lifecycle hooks. This is a crucial step to remember!

```
<template>
  <div>
    <!-- Configuration taken care of in the scripts -->
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
</script>
```

useRuntimeConfig only works in setup or lifecycle hooks.... this was a pain for me as I could not discover the error because of this, and more importantly since env variables are accessed in the publicRuntimeConfig so only on the client side. Therefore in setting up we could connect supabase with our runtime.

```
import { createClient } from '@supabase/supabase-js'

.....

....

const config = useRuntimeConfig()

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY)

/* Followed by the supabase implementation you would like to work on*/
```

And thats how you get access to your env variables. In my next post we will explore how to you use composables and plugins to achieve this whole setup but with cleaner out look.
