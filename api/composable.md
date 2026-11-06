# Composable <Badge type="tip" text="v1.2.0+" />

`useQuilly` runs the editor logic of [`QuillyEditor`](/api/component) on a container you render yourself. The component uses it internally, so both behave the same.

```ts
function useQuilly(
  container: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options?: UseQuillyOptions
): UseQuillyReturn
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useQuilly } from 'vue-quilly'
import 'quill/dist/quill.snow.css'

const container = ref<HTMLElement>()
const content = ref('<p>Hello Quilly!</p>')

const { quill } = useQuilly(container, {
  model: content,
  options: { theme: 'snow' },
  quillClass: () => import('quill'),
  onTextChange: ({ source }) => console.log('Changed by', source)
})
</script>

<template>
  <div ref="container"></div>
  <button @click="quill?.focus()">Focus</button>
</template>
```

Call it in `setup()`. With `quillClass`, the editor is created when the component mounts. In an [effect scope](https://vuejs.org/api/reactivity-advanced.html#effectscope) outside a component there is no mount, so call `initialize()` yourself.

## Options

| Option | Type | Description |
| --- | --- | --- |
| `model` | `Ref<string \| null \| undefined>` | Editor content as HTML, synced both ways. Defaults to an internal ref. |
| `options` | `MaybeRefOrGetter<QuillOptions>` | Quill options, read once when the editor is created. |
| `isSemanticHtmlModel` | `MaybeRefOrGetter<boolean>` | Fill `model` with `getSemanticHTML()`. Read on every change. |
| `quillClass` <Badge type="tip" text="v1.3.0+" /> | `MaybeRef<QuillClassSource>` | The Quill class or a loader, read once on mount. Pass a value or a ref, not a getter: a loader is a function too. |
| `onTextChange`, `onSelectionChange`, `onEditorChange`, `onFocus`, `onBlur`, `onReady` | functions | The component's [events](/api/component#events), with the same payloads. |

There is no `update:modelValue` callback. To react to content changes, `watch` the `model` ref.

## Return value

| Property | Type | Description |
| --- | --- | --- |
| `quill` | `ShallowRef<Quill \| null>` | The Quill instance. `null` until the editor is created and after the scope stops. |
| `model` | `Ref<string \| null \| undefined>` | The `model` ref you passed, or the internal one. |
| `initialize` | `(QuillClass) => Quill` | Creates the editor and returns the Quill instance. The container must be in the DOM. |

## Types

```ts
import type { UseQuillyOptions, UseQuillyReturn } from 'vue-quilly'
```
