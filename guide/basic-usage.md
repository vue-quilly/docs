# Usage

The examples use the component and a loader from [Getting Started](/guide/getting-started#create-an-editor). They work the same with the [`useQuilly` composable](/api/composable), where props become options and events become `on*` callbacks.

## Content

`v-model` holds the editor content as HTML, synced both ways: typing updates it, and assigning a new value replaces the content. An empty string clears the editor.

This HTML is user input. Sanitize it before you render it with `v-html`, for example with [DOMPurify](https://github.com/cure53/DOMPurify).

For [Delta](https://quilljs.com/docs/delta), Quill's JSON format, use the [Quill instance](#quill-instance): `getContents()`, `setContents()` and `updateContents()`.

## Semantic HTML

Quill keeps lists in its own markup: every list is an `<ol>`, the list type is in `data-list` and each item has a UI span. With `is-semantic-html-model`, `v-model` gets Quill's `getSemanticHTML()` instead, which renders correctly without Quill's CSS:

```vue
<QuillyEditor v-model="content" is-semantic-html-model :quill-class="loadQuill" />
```

::: code-group

```html [Editor HTML]
<ol>
  <li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>One</li>
  <li data-list="bullet" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>Nested</li>
</ol>
```

```html [Semantic HTML]
<ul>
  <li>One
    <ul>
      <li>Nested</li>
    </ul>
  </li>
</ul>
```

:::

Lists and code blocks change. Headings, inline formats and alignment classes such as `ql-align-center` stay the same.

::: warning
Quill 2.0.3 writes every space in semantic HTML as `&nbsp;`, so the text won't wrap where you render it. Replace them before you store or render the HTML: `content.value.replaceAll('&nbsp;', ' ')`.
:::

## Options

`options` goes to Quill unchanged: `theme`, `placeholder`, `readOnly`, `modules` and the rest of [Quill's configuration](https://quilljs.com/docs/configuration). Quill reads it once, when the editor is created, so later changes have no effect. Change a live editor through its API instead, for example `quill.enable(false)` to make it read-only.

```ts
const options = {
  theme: 'snow',
  placeholder: 'Write something...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ header: [1, 2, false] }],
      ['link', 'image']
    ]
  }
}
```

Quill's [toolbar docs](https://quilljs.com/docs/modules/toolbar) list every control, custom handlers and toolbars in your own markup.

## Events

The editor emits Quill's `text-change`, `selection-change` and `editor-change`, plus `focus`, `blur` and `ready`. See [Events](/api/component#events) for payloads. Each change has a `source`: check `source === 'user'` to react only to the user's edits.

## Quill instance

`ready` passes the Quill instance. Keep it in a `shallowRef` and call the [Quill API](https://quilljs.com/docs/api) on it:

```vue
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import type Quill from 'quill'
import 'quill/dist/quill.snow.css'

const content = ref('')
const quill = shallowRef<Quill>()
const loadQuill = () => import('quill')

const insertGreeting = () => {
  quill.value?.setContents([
    { insert: 'Hello ' },
    { insert: 'Quilly', attributes: { bold: true } },
    { insert: '\n' }
  ])
}
</script>

<template>
  <QuillyEditor v-model="content" :quill-class="loadQuill" @ready="quill = $event" />
  <button @click="insertGreeting">Insert greeting</button>
</template>
```

With [`initialize()`](/guide/getting-started#initialize-manually), the instance is its return value.

## Plugins and formats

Plugins and custom formats register on the Quill class. Do it in a module of your own, and load that module instead of `quill`:

::: code-group

```ts [quill-setup.ts]
import Quill from 'quill'
import QuillResize from 'quill-resize-module'
import 'quill-resize-module/dist/resize.css'
import Highlight from './highlight'

Quill.register('modules/resize', QuillResize)
Quill.register(Highlight)

export default Quill
```

```ts [highlight.ts]
import Inline from 'quill/blots/inline'

export default class Highlight extends Inline {
  static blotName = 'highlight'
  static tagName = 'mark'
}
```

```vue [Editor.vue]
<script setup lang="ts">
import { ref } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import 'quill/dist/quill.snow.css'

const content = ref('<p>Hello Quilly!</p>')

const options = {
  theme: 'snow',
  modules: {
    toolbar: [['bold', 'italic'], ['image']],
    resize: {}
  }
}

const loadQuill = () => import('./quill-setup')
</script>

<template>
  <QuillyEditor v-model="content" :options="options" :quill-class="loadQuill" />
</template>
```

:::

- A module runs once, however many editors load it, so each plugin registers once.
- Most plugins import Quill themselves. Importing them only in this module keeps them out of the page bundle and off the server.
- Import a plugin's CSS in this module too, so it loads with the plugin.
- Apply the custom format through the API: `quill.format('highlight', true)`.

Formulas need [KaTeX](https://katex.org/) on `window`. See the [full toolbar example](/examples/#full-toolbar).

## Smaller bundle with quill/core

`quill/core` is the editor without formats, toolbar or themes. Register only what you use, in the module your loader imports:

```ts
// quill-setup.ts
import Quill from 'quill/core'
import Toolbar from 'quill/modules/toolbar'
import Snow from 'quill/themes/snow'
import Bold from 'quill/formats/bold'
import Italic from 'quill/formats/italic'
import Underline from 'quill/formats/underline'
import List from 'quill/formats/list'
import Link from 'quill/formats/link'

Quill.register({
  'modules/toolbar': Toolbar,
  'themes/snow': Snow,
  'formats/bold': Bold,
  'formats/italic': Italic,
  'formats/underline': Underline,
  'formats/list': List,
  'formats/link': Link
})

export default Quill
```

- The editor drops content in formats you haven't registered.
- Importing `quill` anywhere else in your app brings the full build back. Type imports don't.
- The [bundle size comparison](/guide/vs-vuequill#bundle-size) shows what each setup loads.
