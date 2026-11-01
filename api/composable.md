# Composable API <Badge type="tip" text="v1.2.0+" />

The `useQuilly` composable runs the same editor logic as the [`QuillyEditor`](/api/component) component on a container element you render yourself. The component uses it internally, so both behave the same way.

```typescript
function useQuilly(
  container: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: UseQuillyOptions
): UseQuillyReturn
```

Call it in `setup()` or inside an [effect scope](https://vuejs.org/api/reactivity-advanced.html#effectscope): its watchers and cleanup are bound to that scope.

## Basic Usage

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuilly } from 'vue-quilly'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

const container = ref<HTMLElement>()
const content = ref('<p>Hello Quilly!</p>')

const { initialize } = useQuilly(container, {
  model: content,
  options: { theme: 'snow' }
})

onMounted(() => {
  initialize(Quill)
})
</script>

<template>
  <div ref="container"></div>
</template>
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | `MaybeRefOrGetter<HTMLElement \| null \| undefined>` | The element to create the editor in: a template ref, a getter or a plain element. It must be in the DOM when `initialize()` runs. |
| `options` | `UseQuillyOptions` | Optional settings, described below. They mirror the component props, with a `model` ref in place of `v-model` and callbacks in place of events. |

## Options

### model

- **Type:** `Ref<string | null | undefined>`
- **Default:** an internal ref
- **Required:** No

The HTML content of the editor. The content is synced bidirectionally, like the component's `v-model`:
- Changes in the editor update the ref
- Assigning a new value to the ref updates the editor content

When you don't pass a ref, the composable creates one and returns it as `model`.

### options

- **Type:** `MaybeRefOrGetter<QuillOptions | undefined>`
- **Default:** `undefined`
- **Required:** No

Quill initialization options, the same as the component's [`options`](/api/component#options) prop. They are read once, when `initialize()` creates the editor.

### isSemanticHtmlModel

- **Type:** `MaybeRefOrGetter<boolean | undefined>`
- **Default:** `false`
- **Required:** No

When `true`, the model gets clean semantic HTML, the same as the component's [`isSemanticHtmlModel`](/api/component#issemantichtmlmodel) prop. It is read on every change, so you can pass a ref or a getter to switch it at runtime.

### Callbacks

The component events are available as `on*` callbacks with the same arguments:

| Callback | Component event | Arguments |
|----------|-----------------|-----------|
| `onTextChange` | `text-change` | `{ delta, oldContent, source }` |
| `onSelectionChange` | `selection-change` | `{ range, oldRange, source }` |
| `onEditorChange` | `editor-change` | `eventName: 'text-change' \| 'selection-change'` |
| `onFocus` | `focus` | `quill: Quill` |
| `onBlur` | `blur` | `quill: Quill` |
| `onReady` | `ready` | `quill: Quill` |

There is no callback for `update:modelValue`: the composable writes to the `model` ref, so `watch` it to react to content changes. See [Events](/api/events) for when each event fires.

## Return Value

### initialize(QuillClass)

Creates the Quill editor in the container, loads the model content and returns the Quill instance. Call it after the container is mounted, for example in `onMounted`.

**Parameters:**
- `QuillClass`: `typeof Quill` - The Quill constructor class

**Returns:** `Quill` - The initialized Quill instance

### quill

- **Type:** `ShallowRef<Quill | null>`

The Quill instance created by `initialize()`, `null` before that. It is set back to `null` when the component unmounts or the effect scope stops.

### model

- **Type:** `Ref<string | null | undefined>`

The HTML model: the ref you passed as `model`, or the internal one.

## Usage Example

Complete example with a toolbar, callbacks and the Quill instance:

```vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useQuilly } from 'vue-quilly'
import Quill from 'quill'
import type { QuillOptions } from 'quill/core'
import 'quill/dist/quill.snow.css'

const container = ref<HTMLElement>()
const content = ref('<p>Hello World!</p>')

const options: QuillOptions = {
  theme: 'snow',
  placeholder: 'Write something amazing...',
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image']
    ]
  }
}

const { quill, initialize } = useQuilly(container, {
  model: content,
  options,
  onReady: (quillInstance) => console.log('Editor is ready!', quillInstance),
  onTextChange: ({ delta, source }) => console.log('Text changed:', delta, source),
  onSelectionChange: ({ range }) => console.log('Selection changed:', range),
  onFocus: () => console.log('Editor focused'),
  onBlur: () => console.log('Editor blurred')
})

onMounted(() => {
  initialize(Quill)
})

// The model ref replaces the update:modelValue event
watch(content, (html) => {
  console.log('Content changed:', html)
})
</script>

<template>
  <div ref="container"></div>
  <button @click="quill?.focus()">Focus</button>
  <button @click="content = ''">Clear</button>
</template>
```

## Component or Composable?

Both run the same logic, so pick the one that fits your code:

- **`QuillyEditor`** renders the container for you and works with `v-model`, event listeners and a template ref.
- **`useQuilly`** works on markup you render yourself, so you can build your own editor component around it. It also gives you the Quill instance as a reactive `quill` ref.

## Nuxt and SSR

`useQuilly` doesn't import Quill, so it is safe to call during server rendering. Create the editor on the client, the same way as with the component (see [Nuxt 3/4](/guide/installation#nuxt-3-4)):

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuilly } from 'vue-quilly'
import 'quill/dist/quill.snow.css'

const container = ref<HTMLElement>()
const content = ref('<p>Hello Nuxt!</p>')

const { initialize } = useQuilly(container, {
  model: content,
  options: { theme: 'snow' }
})

onMounted(async () => {
  if (import.meta.client) {
    const QuillClass = (await import('quill')).default
    initialize(QuillClass)
  }
})
</script>

<template>
  <div ref="container"></div>
</template>
```

As with the component, wrap the component that uses the editor in `<ClientOnly>` in your app or page.

## TypeScript Support

The options and the return value are typed:

```typescript
import type { UseQuillyOptions, UseQuillyReturn } from 'vue-quilly'
```

## See Also

- [Component API](/api/component) - Props and methods of `QuillyEditor`
- [Events](/api/events) - Event details and payloads
- [TypeScript Types](/api/types) - Type definitions
