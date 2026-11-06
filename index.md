---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "vue-quilly"
  text: ""
  tagline: Tiny Vue 3 component for building Quill 2 editors
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Try Demo
      link: https://vue-quilly.vercel.app/

features:
  - title: 🪶 Tiny
    details: About 1.3 KB gzipped. Quill loads after mount, in its own chunk.
  - title: ⚡ SSR ready
    details: Works in Nuxt and other SSR apps without ClientOnly.
    link: /guide/getting-started#nuxt-and-ssr
    linkText: Nuxt setup
  - title: 🔄 HTML and Delta
    details: v-model with Quill's HTML or semantic HTML, and the Quill API for Delta.
  - title: ⚙️ Plain Quill
    details: Quill's own options, modules and plugins. Load the full build, or only the parts you use from quill/core.
  - title: 🧩 Component or composable
    details: Use the QuillyEditor component, or useQuilly on markup you render yourself.
  - title: 🔷 TypeScript
    details: Typed props, events and composable.
---

## Quick Start

::: code-group

```bash [npm]
npm install vue-quilly quill@2
```

```bash [pnpm]
pnpm add vue-quilly quill@2
```

```bash [yarn]
yarn add vue-quilly quill@2
```

:::

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import 'quill/dist/quill.snow.css'

const content = ref('<p>Hello Quilly!</p>')
const loadQuill = () => import('quill')
</script>

<template>
  <QuillyEditor v-model="content" :options="{ theme: 'snow' }" :quill-class="loadQuill" />
</template>
```

Continue with [Getting Started](/guide/getting-started).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=alekswebnet/vue-quilly&type=date&legend=top-left)](https://www.star-history.com/#alekswebnet/vue-quilly&type=date&legend=top-left)
