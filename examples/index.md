# Examples

Try these editors and more in the [live demo](https://vue-quilly.vercel.app/) ([source](https://github.com/alekswebnet/vue-quilly/tree/main/demo)).

## Full toolbar

Every Snow toolbar control, formulas included. The `formula` format renders with [KaTeX](https://katex.org/), which Quill reads from `window`.

::: code-group

```vue [Editor.vue]
<script setup lang="ts">
import { ref } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import 'quill/dist/quill.snow.css'

const content = ref('<h1>Hello Quilly!</h1><p>Select text to format it.</p>')

const options = {
  theme: 'snow',
  placeholder: 'Write something...',
  modules: {
    toolbar: [
      [{ font: [] }, { size: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'super' }, { script: 'sub' }],
      [{ header: 1 }, { header: 2 }, 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }, { align: [] }],
      ['link', 'image', 'video', 'formula'],
      ['clean']
    ]
  }
}

const loadQuill = () => import('./quill-setup')
</script>

<template>
  <QuillyEditor v-model="content" :options="options" :quill-class="loadQuill" />
</template>
```

```ts [quill-setup.ts]
import Quill from 'quill'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Quill's formula format renders with window.katex
Object.assign(window, { katex })

export default Quill
```

:::

For the Bubble theme, which shows the toolbar when you select text, set `theme: 'bubble'` and import `quill/dist/quill.bubble.css`.

## Custom editor with quill/core

Bold, italic and two heading levels, with buttons of your own instead of Quill's toolbar. Quill loads 43.3 KB gzipped instead of the full build's 56.8 KB.

::: code-group

```vue [Editor.vue]
<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { QuillyEditor } from 'vue-quilly'
import type Quill from 'quill/core'
import 'quill/dist/quill.core.css'

const content = ref('<h1>Custom editor</h1><p>Bold, italic and two heading levels.</p>')
const quill = shallowRef<Quill>()
const loadQuill = () => import('./quill-setup')

// Apply a format to the selection, or remove it if it's already applied
const toggle = (format: string, value: unknown = true) => {
  const editor = quill.value
  if (!editor) return
  editor.format(format, editor.getFormat()[format] === value ? false : value)
}
</script>

<template>
  <div class="toolbar">
    <button @click="toggle('bold')">Bold</button>
    <button @click="toggle('italic')">Italic</button>
    <button @click="toggle('header', 1)">H1</button>
    <button @click="toggle('header', 2)">H2</button>
  </div>
  <QuillyEditor
    v-model="content"
    :options="{ placeholder: 'Start writing...' }"
    :quill-class="loadQuill"
    @ready="quill = $event"
  />
</template>
```

```ts [quill-setup.ts]
import Quill from 'quill/core'
import Bold from 'quill/formats/bold'
import Italic from 'quill/formats/italic'
import Header from 'quill/formats/header'

Quill.register({
  'formats/bold': Bold,
  'formats/italic': Italic,
  'formats/header': Header
})

export default Quill
```

:::

## More

- [Plugins and custom formats](/guide/basic-usage#plugins-and-formats), with image resizing
- [Semantic HTML](/guide/basic-usage#semantic-html) output
- [Nuxt 4 project](https://github.com/alekswebnet/vue-quilly/tree/main/nuxt)
- [Without a bundler](/guide/getting-started#without-a-bundler), or on [CodePen](https://codepen.io/redrobot753/pen/VwJwPLP)
