---
description: How vue-quilly compares with VueQuill (@vueup/vue-quill) — bundle size, HTML output, SSR, API differences and migration.
---

# vue-quilly vs VueQuill

[VueQuill](https://vueup.github.io/vue-quill/) (`@vueup/vue-quill`) is the most widely used Quill component for Vue 3. Both libraries wrap Quill 2 and are MIT licensed, but they make opposite choices:

- **VueQuill** is a ready-made editor: props and toolbar presets for common options, and it loads Quill for you.
- **vue-quilly** is the editor logic only: you load Quill yourself, choose the build, and configure it with Quill's own options.

This page compares vue-quilly 1.3.0 with VueQuill 1.5.5, the current versions as of November 2026.

## At a glance

| | vue-quilly | VueQuill |
| --- | --- | --- |
| Quill | 2.x, you install `quill@2` | 2.x, installed as its dependency |
| Loading Quill | You pass the Quill class or a loader as `quill-class`: full `quill`, or `quill/core` with only the formats you register | Loads the full `quill` build itself after mount |
| `v-model` | HTML string | Delta (default), HTML or plain text, set by `content-type` |
| HTML output | Quill's editor HTML, or semantic HTML with `is-semantic-html-model` | Quill's editor HTML |
| Configuration | Quill's `options` object | Props (`theme`, `toolbar` presets, `placeholder`, `read-only`, `enable`, `modules`) plus `options` |
| Custom toolbar | Quill's `toolbar` option | Quill's `toolbar` option, or markup in the `toolbar` slot |
| Composable | [`useQuilly()`](/api/composable) | — |
| Quill instance | `ready` event, or the return value of `initialize()` | `getQuill()`, plus helper methods (`getHTML`, `setContents`, `getText`, `reinit`, …) |
| Plugins | `Quill.register()` in the module your loader imports | `modules` prop, or `register()` on VueQuill's exported `Quill` ([see below](#plugins)) |
| SSR / Nuxt | Works with a loader, no extra setup | Works without extra setup |

## Bundle size

Measured with production builds (Vite 8.3, Vue 3.5, Quill 2.0.3) of a page with one Snow editor and this toolbar: bold, italic, underline, ordered and bullet lists, link. vue-quilly loads Quill with a `quill-class` loader. Numbers are gzipped JavaScript added to an empty Vue app.

| Setup | With the page | After mount | Total |
| --- | ---: | ---: | ---: |
| vue-quilly + full `quill` | 1.8 KB | 56.8 KB | 58.6 KB |
| vue-quilly + `quill/core` with Snow and the 5 formats used | 1.8 KB | 52.8 KB | 54.6 KB |
| vue-quilly + `quill/core`, no theme, 3 formats ([custom editor](/examples/#custom-editor-with-quill-core)) | 1.8 KB | 43.3 KB | 45.1 KB |
| VueQuill | 14.2 KB | 45.6 KB | 59.8 KB |

- Both load Quill after mount. vue-quilly adds 1.8 KB to the page, VueQuill 14.2 KB.
- With the same full Quill build, the totals are close: VueQuill loads about 1.2 KB more.
- `quill/core` saves the most when you drop the Snow and Bubble themes, which bring the toolbar UI, icons and pickers. With Snow, it saves 4 KB.
- Importing Quill at the top of a component instead puts all of it in the page: 57.3 KB for the full build.

## Same editor in both

::: code-group

```vue [vue-quilly]
<script setup lang="ts">
import { ref } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import 'quill/dist/quill.snow.css'

const content = ref('<p>Hello</p>')

const options = {
  theme: 'snow',
  placeholder: 'Write something...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link']
    ]
  }
}

const loadQuill = () => import('quill')
</script>

<template>
  <QuillyEditor v-model="content" :options="options" :quill-class="loadQuill" />
</template>
```

```vue [VueQuill]
<script setup lang="ts">
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const content = ref('<p>Hello</p>')

const toolbar = [
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link']
]
</script>

<template>
  <QuillEditor
    v-model:content="content"
    content-type="html"
    theme="snow"
    placeholder="Write something..."
    :toolbar="toolbar"
  />
</template>
```

:::

For the `quill/core` row, load the module from [Smaller bundle with quill/core](/guide/basic-usage#smaller-bundle-with-quill-core) instead of `quill`.

## Semantic HTML

If you store the editor's HTML, its shape matters. Quill keeps lists in its own markup: every list is an `<ol>`, the list type sits in `data-list`, nesting is a CSS class, and each item has a UI span. That is what `root.innerHTML` returns, and it's what VueQuill's HTML mode and vue-quilly's default `v-model` give you.

With `:is-semantic-html-model="true"`, vue-quilly fills `v-model` from Quill's `getSemanticHTML()` instead. The same nested list in Quill 2.0.3:

::: code-group

```html [Editor HTML]
<ol>
  <li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>One</li>
  <li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>Two</li>
  <li data-list="bullet" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>Nested</li>
</ol>
```

```html [Semantic HTML]
<ul>
  <li>One</li>
  <li>Two
    <ul>
      <li>Nested</li>
    </ul>
  </li>
</ul>
```

:::

Without Quill's CSS, the first version renders as a flat numbered list. The second keeps its structure anywhere: in emails, RSS, or a page that doesn't load Quill. Quill 2.0.3 writes its spaces as `&nbsp;`, though, so see [Semantic HTML](/guide/basic-usage#semantic-html) before you store it.

## Plugins

**vue-quilly** has no plugin API of its own. Register plugins on the Quill class in a module, and load that module with `quill-class`. The plugin is always on the class the editor uses, and `options` reach Quill unchanged:

```ts
// quill-setup.ts
import Quill from 'quill'
import WordCounter from './word-counter'

Quill.register('modules/wordCounter', WordCounter)

export default Quill
```

```ts
const options = {
  theme: 'snow',
  modules: {
    toolbar: [['bold', 'italic']],
    history: { delay: 2500 },
    wordCounter: { container: '#counter' }
  }
}

const loadQuill = () => import('./quill-setup')
```

**VueQuill** registers plugins through its `modules` prop, or through the `Quill` object it exports, which queues `register()` calls until Quill has loaded:

```vue
<QuillEditor
  :modules="{ name: 'wordCounter', module: WordCounter, options: { container: '#counter' } }"
/>
```

Two things to watch for with VueQuill, both checked with VueQuill 1.5.5 and Quill 2.0.3:

- **The `toolbar` and `modules` props replace `options.modules`.** VueQuill doesn't deep-merge its props into `options`, so module settings in `options` are dropped. With this setup, the toolbar falls back to Snow's default and `history.delay` goes back to 1000:

  ```vue
  <QuillEditor
    theme="snow"
    :options="{ modules: { toolbar: [['bold', 'italic']], history: { delay: 2500 } } }"
    :modules="{ name: 'wordCounter', module: WordCounter }"
  />
  ```

  To keep your settings, register the plugin with VueQuill's `Quill.register()`, put all module settings in `options.modules`, toolbar included, and leave out the `toolbar` and `modules` props.

- **VueQuill can load a different Quill than your app.** Its Quill range, `2.0.2 || >=2.0.4 <3`, excludes 2.0.3, the current release. If your app depends on `quill@2.0.3`, VueQuill installs and loads its own 2.0.2. A format registered on your app's `Quill`, which is what a plugin that imports `quill` does, never reaches the editor. Register through VueQuill's exported `Quill` instead.

## SSR and Nuxt

VueQuill renders a placeholder on the server and loads Quill in the browser after mount. vue-quilly does the same when you pass a loader as `quill-class`. Neither needs `<ClientOnly>` in Nuxt.

Quill itself can't be imported on the server: it accesses `document` when it loads. With vue-quilly, keep Quill and plugin imports in the module your loader imports. See [Nuxt and SSR](/guide/getting-started#nuxt-and-ssr).

## Migrating from VueQuill

| VueQuill | vue-quilly |
| --- | --- |
| Quill loaded for you | `:quill-class="() => import('quill')"` |
| `v-model:content` with `content-type="html"` | `v-model` |
| `content-type="delta"` or `"text"` | `quill.getContents()` or `quill.getText()` on the Quill instance |
| `theme="snow"` and `vue-quill.snow.css` | `options.theme: 'snow'` and `quill/dist/quill.snow.css` |
| `toolbar` array or `#selector` | `options.modules.toolbar` |
| `toolbar="essential"` (preset) | Copy the preset array from the [VueQuill toolbar docs](https://vueup.github.io/vue-quill/guide/toolbar.html) |
| `placeholder`, `read-only` | `options.placeholder`, `options.readOnly` |
| `:enable="false"` | `quill.enable(false)` |
| `:modules="{ name, module, options }"` | `Quill.register('modules/name', module)` in the module your loader imports, options under `options.modules.name` |
| `textChange` payload `{ delta, oldContents, source }` | `text-change` payload `{ delta, oldContent, source }` |
| `editorChange` payload object | `editor-change` payload is the event name only |
| `focus` / `blur` payload: editor element ref | `focus` / `blur` payload: Quill instance |
| `getQuill()` or `@ready` | `@ready`, or the return value of `initialize()` |
| `getHTML()` / `setHTML()` | Read and write the `v-model` value |

## Which one to pick

**Pick VueQuill** for a complete editor with little code: toolbar presets, props for common options, and a Delta or plain-text `v-model`. Its user base is also much larger, so you'll find more answers online.

**Pick vue-quilly** to control Quill yourself: choose the build and register only what you use, keep the page bundle small, combine plugins with your own module settings, put the editor logic on your own markup with [`useQuilly()`](/api/composable), or store semantic HTML.
