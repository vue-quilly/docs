import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue Quilly Docs",
  description: "Documentation for vue-quilly",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['script', { async: 'async', src: 'https://media.bitterbrains.com/main.js?from=VUEQUILLY&type=bottom' }],
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/vue_quilly_logo.webp',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/component' },
      { text: 'Examples', link: '/examples/' },
      { text: 'Support', link: 'https://opencollective.com/vuequilly' }
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Usage', link: '/guide/basic-usage' },
          { text: 'Comparison with VueQuill', link: '/guide/vs-vuequill' }
        ]
      },
      {
        text: 'API',
        items: [
          { text: 'Component', link: '/api/component' },
          { text: 'Composable', link: '/api/composable' }
        ]
      },
      { text: 'Examples', link: '/examples/' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/alekswebnet/vue-quilly' }
    ]
  }
})
