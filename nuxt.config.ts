// https://nuxt.com/docs/api/configuration/nuxt-config

declare const process: {
  env: Record<string, string | undefined>
}

export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', 'shadcn-nuxt', 'nuxt-studio'],
  studio: {
    // route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'titan-65',
      repo: 'nuxt2-vantol',
      branch: 'master'
    }
  },
  app: {
    head: {
      title: 'VantolBennett',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Fullstack Developer- Vantol Bennett. Over 10 years of experience in Web and Mobile development. Vue.js, Nuxtjs, React, Javascript, Node.js and Django (Python) Framework.' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "alternate", type: "application/rss+xml", title: "VantolBennett RSS Feed", href: "/rss.xml" }
      ],
    }
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'
          },
          langs: ['json', 'js', 'ts', 'html', 'css', 'vue', 'shell', 'mdc', 'md', 'yaml', 'python', 'bash']
        },
        toc: {
          depth: 3,
          searchDepth: 3
        }
      }
    },
    renderer: {
      anchorLinks: {
        h2: true,
        h3: true,
        h4: true
      }
    }
  },
  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui'
  },
  css: ['~/assets/css/tailwind.css'],
  runtimeConfig: {
    spotifyClientId: '',
    spotifyClientSecret: '',
    spotifyRefreshToken: '',
    public: {
      supabaseUrl: '',
      supabaseKey: '',
      adminEmails: process.env.NUXT_PUBLIC_ADMIN_EMAILS || '',
      firebase: {
        apiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        appId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID || '',
        storageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
        databaseURL: process.env.NUXT_PUBLIC_FIREBASE_DATABASE_URL || ''
      }
    }
  },
  devtools: { enabled: true },
  compatibilityDate: '2024-04-03',
})
