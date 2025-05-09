<script lang="ts">
  import {
    image,
    circle,
    rectangle,
    square,
    roundedRect,
  } from "@image-kit/core";
  import { onMount } from "svelte";
  import ImageCropper, { type Shape } from "./components/ImageCropper.svelte";
  import ImageResizer from "./components/ImageResizer.svelte";
  import ImageQuality from "./components/ImageQuality.svelte";
  import ImageRotator from "./components/ImageRotator.svelte";
  import Preview from "./components/Preview.svelte";
  import Tabs from "./components/Tabs.svelte";
  import CodePreview from "./components/CodePreview.svelte";

  let selectedImage: File | null = null;
  let imageUrl: string | null = null;
  let processedImageUrl: string | null = null;
  let loading = false;
  let error: string | null = null;

  let resizeOptions: any = {
    _width: 500,
    _height: 500,
    _aspectRatio: "original",
    crop: "thumbnail",
    _gravity: "center",
  };
  let quality = 90;
  let format = "image/jpeg";
  let sharpeningLevel = 1;
  let rotationAngle = 0;
  let algorithm: any = "standard";
  let cropShape: any = { type: "rectangle" };

  let tabs = [
    { id: "resize", label: "Resize" },
    { id: "crop", label: "Crop" },
    { id: "quality", label: "Quality" },
    { id: "rotate", label: "Rotate" },
    { id: "code", label: "Code" },
  ];
  let activeTab = "resize";

  const cropShapefnMap: any = {
    circle: circle,
    rectangle: rectangle,
    square: square,
    roundedRect: roundedRect,
  };

  const sampleImages = [
    { url: "https://picsum.photos/id/237/1000/800", name: "Black dog" },
    { url: "https://picsum.photos/id/48/1200/900", name: "Ocean waves" },
    { url: "https://picsum.photos/id/164/1200/800", name: "Mountain" },
  ];

  onMount(() => {
    // Load a default sample image
    loadSampleImage(sampleImages[0].url);
  });

  async function loadSampleImage(url: string) {
    try {
      loading = true;
      error = null;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      selectedImage = new File([blob], `sample-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      imageUrl = URL.createObjectURL(blob);

      processImage();
    } catch (err) {
      error =
        err instanceof Error ? err.message : "Failed to load sample image";
    } finally {
      loading = false;
    }
  }

  function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    selectedImage = input.files[0];
    imageUrl = URL.createObjectURL(selectedImage);
    processImage();
  }

  async function processImage() {
    if (!selectedImage) return;

    try {
      loading = true;
      error = null;

      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }

      const processor = image(selectedImage)
        .format(format)
        .quality(quality / 100)
        .resize(resizeOptions)
        .sharpen(sharpeningLevel)
        .algorithm(algorithm)
        .rotate(rotationAngle)
        .cropAs(cropShapefnMap[cropShape.type]());

      const blob = await processor.toBlob();
      processedImageUrl = URL.createObjectURL(blob);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to process image";
    } finally {
      loading = false;
    }
  }

  function updateResize(opts: { _width: number | null; _height: number | null; _aspectRatio: string; crop: string; _gravity: string | { x: number; y: number } }) {
      resizeOptions = {
          ...opts,
          _width: opts._width ?? resizeOptions._width,
          _height: opts._height ?? resizeOptions._height,
      };
      processImage();
  }

  function updateCrop(updated: Shape) {
    cropShape = updated;
    processImage();
  }

  function updateQuality(params: {
    quality: number;
    format: string;
    sharpeningLevel: number;
    algorithm: string;
  }) {
    quality = params.quality;
    format = params.format;
    sharpeningLevel = params.sharpeningLevel;
    algorithm = params.algorithm;
    processImage();
  }

  function updateRotation(event: CustomEvent<number>) {
    rotationAngle = event.detail;
    processImage();
  }

  function getCodeSnippet() {
    return `
import { image } from '@image-kit/core';

const processor = image(imageSource)
  .format('${format}')
  .quality(${quality / 100})
  .resize({
    _width: ${resizeOptions._width},
    _height: ${resizeOptions._height},
    _aspectRatio: "${resizeOptions._aspectRatio}",
    crop: "${resizeOptions.crop}",
    _gravity: "${typeof resizeOptions._gravity === "string" ? resizeOptions._gravity : JSON.stringify(resizeOptions._gravity)}"
  })
  .sharpen(${sharpeningLevel})
  .algorithm("${algorithm}")
  .rotate(${rotationAngle})
  .cropAs(${cropShape.type}());

  const blob = await processor.toBlob();

  const dataUrl = await processor.toURL();
`;
  }
</script>

<main>
  <div class="app-container">
    <h1>ImageKit Playground</h1>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    <div class="upload-section">
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" on:change={handleFileUpload} />

      <div class="sample-images">
        <h3>Or try these samples:</h3>
        <div class="samples">
          {#each sampleImages as sample}
            <button
              class="sample-button"
              on:click={() => loadSampleImage(sample.url)}
            >
              {sample.name}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div class="content-area">
      <div class="preview-section">
        <Preview
          originalUrl={imageUrl}
          processedUrl={processedImageUrl}
          {loading}
        />
      </div>

      <div class="controls-section">
        <Tabs {tabs} bind:activeTab />

        <div class="tab-content">
          {#if activeTab === "resize"}
            <ImageResizer options={resizeOptions} onUpdate={updateResize} />
          {:else if activeTab === "crop"}
            <ImageCropper shape={cropShape} onUpdate={updateCrop} />
          {:else if activeTab === "quality"}
            <ImageQuality
              {quality}
              {format}
              {sharpeningLevel}
              {algorithm}
              onUpdate={updateQuality}
            />
          {:else if activeTab === "rotate"}
            <ImageRotator angle={rotationAngle} on:update={updateRotation} />
          {:else if activeTab === "code"}
            <CodePreview code={getCodeSnippet()} />
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #333;
  }

  .error-message {
    background-color: #ffebee;
    color: #c62828;
    padding: 10px 15px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .upload-section {
    background-color: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
  }

  .sample-images {
    margin-top: 15px;
  }

  .samples {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }

  .sample-button {
    padding: 8px 16px;
    border: none;
    background-color: #e0e0e0;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .sample-button:hover {
    background-color: #d0d0d0;
  }

  .content-area {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  .preview-section {
    background-color: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
  }

  .controls-section {
    background-color: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
  }

  .tab-content {
    margin-top: 20px;
  }

  @media (max-width: 900px) {
    .content-area {
      grid-template-columns: 1fr;
    }
  }
</style>
