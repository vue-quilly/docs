# Getting Started

vue-quilly gives [Quill 2](https://quilljs.com/) a Vue 3 component with `v-model`, events and types. The rest is plain Quill: you configure it with Quill's [options](https://quilljs.com/docs/configuration) and extend it with Quill modules and plugins.

## Installation

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

Requires Vue 3.3+ and Quill 2.

## Create an editor <Badge type="tip" text="v1.3.0+" />

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import 'quill/dist/quill.snow.css'

const content = ref('<p>Hello Quilly!</p>')

const options = {
  theme: 'snow',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image']
    ]
  }
}

const loadQuill = () => import('quill')
</script>

<template>
  <QuillyEditor v-model="content" :options="options" :quill-class="loadQuill" />
</template>
```

`quill-class` takes a loader: a function that imports Quill. After mount, the editor loads Quill in its own chunk, creates itself and emits `ready` with the [Quill instance](/guide/basic-usage#quill-instance). If you already import Quill, pass the class instead: `:quill-class="Quill"`.

Import the CSS of your theme, `quill.snow.css` or `quill.bubble.css`. Both include Quill's core styles. Without a theme, import `quill/dist/quill.core.css`.

## Nuxt and SSR

With a loader, nothing else is needed. The server renders an empty `<div>`, and Quill loads in the browser after hydration. You don't need `<ClientOnly>`.

Quill itself can't run on the server: importing `quill` or `quill/core` throws `document is not defined`. Keep Quill, and anything that touches `window`, in a module that your loader imports. This one also sets up KaTeX for the formula button:

::: code-group

```vue [app/components/Editor.vue]
<script setup lang="ts">
import { ref } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import 'quill/dist/quill.snow.css'

const content = ref('<p>Hello Nuxt!</p>')

const options = {
  theme: 'snow',
  modules: { toolbar: [['bold', 'italic'], ['formula']] }
}

const loadQuill = () => import('~/lib/quill-setup')
</script>

<template>
  <QuillyEditor v-model="content" :options="options" :quill-class="loadQuill" />
</template>
```

```ts [app/lib/quill-setup.ts]
import Quill from 'quill'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Quill's formula format renders with window.katex
Object.assign(window, { katex })

export default Quill
```

:::

- At the top level of components, import only types: `import type Quill from 'quill'`.
- Plugins go in the same module, as shown in [Plugins and formats](/guide/basic-usage#plugins-and-formats).

The [Nuxt example](https://github.com/vue-quilly/vue-quilly/tree/main/nuxt) is a complete Nuxt 4 app with this setup.

## Initialize manually

To create the editor yourself, or with vue-quilly before 1.3.0, leave out `quill-class` and call `initialize()` after mount. It returns the Quill instance:

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const editor = ref<InstanceType<typeof QuillyEditor>>()
const content = ref('<p>Hello Quilly!</p>')
let quill: Quill | undefined

onMounted(() => {
  quill = editor.value?.initialize(Quill)
})
</script>

<template>
  <QuillyEditor ref="editor" v-model="content" :options="{ theme: 'snow' }" />
</template>
```

With SSR, import Quill inside `onMounted` instead, and use `import type Quill from 'quill'` at the top:

```ts
onMounted(async () => {
  const { default: Quill } = await import('quill')
  quill = editor.value?.initialize(Quill)
})
```

## Without a bundler <Badge type="tip" text="v1.3.0+" />

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.snow.css" />
<script src="https://cdn.jsdelivr.net/npm/quill@2/dist/quill.js"></script>
<script type="importmap">
  {
    "imports": {
      "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.prod.js",
      "vue-quilly": "https://cdn.jsdelivr.net/npm/vue-quilly@1/dist/vue-quilly.js"
    }
  }
</script>

<div id="app">
  <quilly-editor v-model="content" :options="options" :quill-class="Quill"></quilly-editor>
</div>

<script type="module">
  import { createApp, ref } from 'vue'
  import { QuillyEditor } from 'vue-quilly'

  createApp({
    components: { QuillyEditor },
    setup: () => ({
      content: ref('<p>Hello Quilly!</p>'),
      options: { theme: 'snow' },
      Quill: window.Quill
    })
  }).mount('#app')
</script>
```
