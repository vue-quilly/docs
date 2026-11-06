# Component

`QuillyEditor` renders a `<div>` and creates a Quill editor in it.

```ts
import { QuillyEditor } from 'vue-quilly'
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `modelValue` | `string \| null` | Editor content as HTML, for `v-model`. Synced both ways. |
| `options` | `QuillOptions` | [Quill options](https://quilljs.com/docs/configuration), read once when the editor is created. |
| `isSemanticHtmlModel` | `boolean` | Fill `v-model` with Quill's `getSemanticHTML()` instead of the editor HTML. Default `false`. See [Semantic HTML](/guide/basic-usage#semantic-html). |
| `quillClass` <Badge type="tip" text="v1.3.0+" /> | `QuillClassSource` | The Quill class, or a loader such as `() => import('quill')`. Read once after mount. The editor then creates itself. |

## Events

| Event | Payload | Emitted when |
| --- | --- | --- |
| `update:modelValue` | `string` | The content changed. Used by `v-model`. |
| `text-change` | `{ delta, oldContent, source }` | Quill's `text-change`. Also once on creation, when `modelValue` has content. |
| `selection-change` | `{ range, oldRange, source }` | Quill's `selection-change`. `range` is `null` when the editor loses focus. |
| `editor-change` | `'text-change' \| 'selection-change'` | Quill's `editor-change`, with the event name only. |
| `focus` | `quill: Quill` | The selection changed inside the editor: it gained focus or the cursor moved. |
| `blur` | `quill: Quill` | The editor lost focus. |
| `ready` | `quill: Quill` | The editor was created. |

`source` is `'user'`, `'api'` or `'silent'`.

## initialize(QuillClass)

Creates the editor with the given Quill class and returns the Quill instance. Call it once, after mount, through a template ref:

```ts
const editor = ref<InstanceType<typeof QuillyEditor>>()

onMounted(() => {
  const quill = editor.value?.initialize(Quill)
})
```

With `quill-class` set, you don't need it. If you call it anyway, it returns the existing editor instead of creating a second one.

## Types

```ts
import type { QuillClass, QuillLoader, QuillClassSource } from 'vue-quilly'
import type { Delta, EmitterSource, QuillOptions, Range } from 'quill'
```

| Type | Definition |
| --- | --- |
| `QuillClass` | `typeof Quill`, from `quill` or `quill/core` |
| `QuillLoader` | `() => Promise<QuillClass \| { default: QuillClass }>` |
| `QuillClassSource` | `QuillClass \| QuillLoader`, the type of `quillClass` |
