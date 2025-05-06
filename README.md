

# @image-kit/core 🖼️

A lightweight and performant image processing wrapper for the browser. Built using native browser APIs like `Canvas`, `HTMLImageElement`, and `WebCodecs`, this library provides a powerful yet minimal interface to perform real-time image transformations such as resizing, format conversion, quality tuning, and more.

## ✨ Features

* 🪶 Minimal footprint
* 💨 Fast performance via native browser APIs
* 🧩 Chainable API for better readability
* 🎨 Resize, format, sharpen, compress, and transform with ease
* 🧪 Converts final result to Blob, Base64, or ImageBitmap

---

## 📦 Installation

```bash
npm install @image-kit/core
# or
yarn add @image-kit/core
# or
pnpm add @image-kit/core
```

---

## 🚀 Usage

```ts
import { image, thumbnail } from "@image-kit/core";

const src = "https://example.com/image.jpg";
const height = 200;
const aspectRatio = 16 / 9;

const transformedImage = image(`${src}?${Date.now()}`)
  .format("auto")
  .quality(1)
  .resize(thumbnail().height(height).aspectRatio(aspectRatio))
  .sharpen(1)
  .algorithm("multistep");

const blob = await transformedImage.toBlob();
```

---

## 🔧 API Reference

### `image(src: string)`

Initializes image processing with the provided image source.

### `.format(format: 'auto' | 'jpeg' | 'webp' | 'png')`

Automatically choose optimal format or specify it manually.

### `.quality(value: number)`

Set the image quality (0-1).

### `.resize(config: ResizeConfig)`

Resize the image using configuration (supports `width`, `height`, and `aspectRatio`).

### `.sharpen(value: number)`

Sharpens the image. `1` is typically a safe default.

### `.algorithm(name: 'default' | 'multistep')`

Chooses resizing algorithm.

### `.toBlob()`

Returns a `Blob` of the transformed image.

### `.toBase64()`

Returns a base64 data URL.

### `.toImageBitmap()`

Returns an `ImageBitmap`.

---

## 🧱 Resize Utilities

### `thumbnail()`

Returns a predefined `ResizeConfig` that simplifies resizing logic for thumbnails.

Example:

```ts
resize(thumbnail().height(300).aspectRatio(16 / 9))
```

---

## 🧪 Browser Support

| Feature     | Supported Browsers                 |
| ----------- | ---------------------------------- |
| Canvas      | ✅ Chrome, Firefox, Safari, Edge    |
| WebCodecs   | ✅ Chrome, Edge (Partial in Safari) |
| ImageBitmap | ✅ Most modern browsers             |

---

## 🧠 Philosophy

> Less dependency, more browser power. Use what the platform gives you. This library is for those who want fast, predictable image processing without third-party bloat.

---

## 🤝 Contributing

Pull requests and issues are welcome! Please open a discussion if you'd like to propose a significant feature or change.

```bash
git clone https://github.com/sundarshahi/image-kit-core.git
cd image-kit-core
npm install
```

---

## 📜 License

MIT © [Sundar Shahi Thakuri](https://sundarshahithakuri.com.np)
