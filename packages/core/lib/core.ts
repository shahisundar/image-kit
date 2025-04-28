export class ImageKit {
  private src: string;
  private deliveryType: string | null = null;
  private imageFormat: string | null = null;
  private imageQuality: string | null = null;
  private resizeOptions: ResizeOptions | null = null;
  private sharpeningLevel: number | null = null;
  private resizeAlgorithm: ResizeAlgorithm = "lanczos";

  constructor(src: string) {
    this.src = src;
  }

  setDeliveryType(type: string) {
    this.deliveryType = type;
    return this;
  }

  format(format: string) {
    this.imageFormat = format;
    return this;
  }

  quality(quality: string | number) {
    this.imageQuality = quality.toString();
    return this;
  }

  resize(resizeOptions: ResizeOptions) {
    if (
      (resizeOptions._width && !resizeOptions._height && !resizeOptions._aspectRatio) ||
      (!resizeOptions._width && resizeOptions._height && !resizeOptions._aspectRatio)
    ) {
      resizeOptions._aspectRatio = "original";
    }
    this.resizeOptions = resizeOptions;
    return this;
  }

  /**
   * Set sharpening level (0 = none, 1 = normal, 2 = high)
   */
  sharpen(level: number = 1) {
    this.sharpeningLevel = Math.max(0, Math.min(2, level));
    return this;
  }

  /**
   * Set the resize algorithm to use
   */
  algorithm(algorithm: ResizeAlgorithm) {
    this.resizeAlgorithm = algorithm;
    return this;
  }

  /**
   * Calculates width based on aspect ratio & height
   */
  private calculateWidth(height: number, aspectRatio: string): number {
    const [aspectW, aspectH] = aspectRatio.split(":").map(Number);
    return Math.round(height * (aspectW / aspectH));
  }

  /**
   * Creates either a Canvas or OffscreenCanvas based on environment
   */
  private createCanvas(
    width: number,
    height: number
  ): {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  } {
    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

      if (!ctx) {
        throw new Error("Failed to get OffscreenCanvas context");
      }

      return { canvas, ctx };
    } else if (typeof document !== "undefined") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Canvas not supported");
      }

      canvas.width = width;
      canvas.height = height;
      return { canvas, ctx };
    } else {
      throw new Error("Neither OffscreenCanvas nor DOM Canvas is available in this environment");
    }
  }

  /**
   * Apply a sharpening filter to the canvas
   */
  private applySharpening(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
    level: number
  ) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const dataBackup = new Uint8ClampedArray(data);

    const intensity = level === 1 ? 0.5 : 1.0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) {
          const current = dataBackup[idx + c];

          const neighbors =
            (dataBackup[idx - width * 4 + c] +
              dataBackup[idx + width * 4 + c] +
              dataBackup[idx - 4 + c] +
              dataBackup[idx + 4 + c]) /
            4;

          const diff = (current - neighbors) * intensity;

          data[idx + c] = Math.max(0, Math.min(255, current + diff));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply the Lanczos algorithm for high-quality resizing
   */
  private resizeLanczos(
    source: ImageBitmap | HTMLImageElement,
    targetWidth: number,
    targetHeight: number
  ): HTMLCanvasElement | OffscreenCanvas {
    const { ctx: tempCtx } = this.createCanvas(source.width, source.height);
    tempCtx.drawImage(source, 0, 0);

    const { canvas: destCanvas, ctx: destCtx } = this.createCanvas(targetWidth, targetHeight);

    let sourceData: ImageData;
    if ("getImageData" in tempCtx) {
      sourceData = tempCtx.getImageData(0, 0, source.width, source.height);
    } else {
      throw new Error("Cannot get image data from context");
    }

    let destData: ImageData;
    if ("createImageData" in destCtx) {
      destData = destCtx.createImageData(targetWidth, targetHeight);
    } else {
      throw new Error("Cannot create image data in context");
    }

    const lanczosRadius = 3;
    const lanczos = (x: number): number => {
      if (x === 0) return 1;
      if (x >= lanczosRadius) return 0;
      const xpi = x * Math.PI;
      return (lanczosRadius * Math.sin(xpi) * Math.sin(xpi / lanczosRadius)) / (xpi * xpi);
    };

    const scaleX = source.width / targetWidth;
    const scaleY = source.height / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = x * scaleX;
        const srcY = y * scaleY;

        const startX = Math.max(0, Math.floor(srcX - lanczosRadius));
        const endX = Math.min(source.width - 1, Math.ceil(srcX + lanczosRadius));
        const startY = Math.max(0, Math.floor(srcY - lanczosRadius));
        const endY = Math.min(source.height - 1, Math.ceil(srcY + lanczosRadius));

        let r = 0,
          g = 0,
          b = 0,
          a = 0,
          weightSum = 0;

        for (let sy = startY; sy <= endY; sy++) {
          for (let sx = startX; sx <= endX; sx++) {
            const dx = srcX - sx;
            const dy = srcY - sy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const weight = lanczos(distance / lanczosRadius);

            if (weight > 0) {
              const srcIdx = (sy * source.width + sx) * 4;
              const sr = sourceData.data[srcIdx];
              const sg = sourceData.data[srcIdx + 1];
              const sb = sourceData.data[srcIdx + 2];
              const sa = sourceData.data[srcIdx + 3];

              r += sr * weight;
              g += sg * weight;
              b += sb * weight;
              a += sa * weight;
              weightSum += weight;
            }
          }
        }

        if (weightSum > 0) {
          r /= weightSum;
          g /= weightSum;
          b /= weightSum;
          a /= weightSum;
        }

        const destIdx = (y * targetWidth + x) * 4;
        destData.data[destIdx] = Math.round(r);
        destData.data[destIdx + 1] = Math.round(g);
        destData.data[destIdx + 2] = Math.round(b);
        destData.data[destIdx + 3] = Math.round(a);
      }
    }

    destCtx.putImageData(destData, 0, 0);
    return destCanvas;
  }

  /**
   * Multi-step resizing for higher quality when scaling down significantly
   */
  private multiStepResize(
    imgData: ImageBitmap | HTMLImageElement,
    targetWidth: number,
    targetHeight: number
  ): {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  } {
    const sourceWidth = imgData.width;
    const sourceHeight = imgData.height;

    const scaleFactor = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);

    if (scaleFactor >= 0.5 || this.resizeAlgorithm === "lanczos") {
      if (this.resizeAlgorithm === "lanczos") {
        const canvas = this.resizeLanczos(imgData, targetWidth, targetHeight);
        const ctx = canvas.getContext("2d") as
          | CanvasRenderingContext2D
          | OffscreenCanvasRenderingContext2D;
        return { canvas, ctx };
      } else {
        const { canvas, ctx } = this.createCanvas(targetWidth, targetHeight);
        ctx.drawImage(imgData, 0, 0, targetWidth, targetHeight);
        return { canvas, ctx };
      }
    } else {
      const numSteps = Math.ceil(Math.log2(1 / scaleFactor));

      let currentCanvas: HTMLCanvasElement | OffscreenCanvas;
      let currentCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
      let currentWidth = sourceWidth;
      let currentHeight = sourceHeight;

      const { canvas, ctx } = this.createCanvas(currentWidth, currentHeight);
      ctx.drawImage(imgData, 0, 0);
      currentCanvas = canvas;
      currentCtx = ctx;

      for (let step = 0; step < numSteps; step++) {
        const isLastStep = step === numSteps - 1;
        const stepWidth = isLastStep
          ? targetWidth
          : Math.max(targetWidth, Math.round(currentWidth * 0.7));
        const stepHeight = isLastStep
          ? targetHeight
          : Math.max(targetHeight, Math.round(currentHeight * 0.7));

        const { canvas: stepCanvas, ctx: stepCtx } = this.createCanvas(stepWidth, stepHeight);

        if ("imageSmoothingEnabled" in stepCtx) {
          stepCtx.imageSmoothingEnabled = true;
          stepCtx.imageSmoothingQuality = "high";
        }

        stepCtx.drawImage(currentCanvas, 0, 0, stepWidth, stepHeight);

        currentCanvas = stepCanvas;
        currentCtx = stepCtx;
        currentWidth = stepWidth;
        currentHeight = stepHeight;
      }

      return { canvas: currentCanvas, ctx: currentCtx };
    }
  }

  private transform(imgData: ImageBitmap | HTMLImageElement): {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  } {
    let targetHeight = this.resizeOptions?._height || imgData.height;
    let targetWidth = this.resizeOptions?._width || imgData.width;

    if (this.resizeOptions?._aspectRatio) {
      const originalRatio = imgData.width / imgData.height;

      if (this.resizeOptions._aspectRatio === "original") {
        if (this.resizeOptions._height && !this.resizeOptions._width) {
          targetWidth = Math.round(targetHeight * originalRatio);
        } else if (this.resizeOptions._width && !this.resizeOptions._height) {
          targetHeight = Math.round(targetWidth / originalRatio);
        }
      } else {
        targetWidth = this.calculateWidth(targetHeight, this.resizeOptions._aspectRatio);
      }
    }

    const { canvas, ctx } = this.multiStepResize(imgData, targetWidth, targetHeight);

    if (this.sharpeningLevel && this.sharpeningLevel > 0) {
      this.applySharpening(ctx, targetWidth, targetHeight, this.sharpeningLevel);
    }

    return { canvas, ctx };
  }

  /**
   * Load image appropriately based on environment (worker vs main thread)
   */
  private async load(): Promise<ImageBitmap | HTMLImageElement> {
    if (typeof createImageBitmap !== "undefined" && this.deliveryType === "fetch") {
      try {
        const response = await fetch(this.src, { mode: "cors" });
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        return await createImageBitmap(blob);
      } catch (error) {
        throw new Error(`Failed to load image in worker: ${error}`);
      }
    } else if (typeof Image !== "undefined") {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = this.src;

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${this.src}`));
      });
    } else {
      throw new Error("Neither createImageBitmap nor Image constructor is available");
    }
  }

  /**
   * Apply transformations and return the transformed image as a Data URL
   */
  async toURL(): Promise<string> {
    const imgData = await this.load();
    const { canvas } = this.transform(imgData);

    const format = this.imageFormat || "image/jpeg";
    const quality = parseFloat(this.imageQuality || "0.9");

    // Handle OffscreenCanvas vs regular Canvas
    if ("toDataURL" in canvas) {
      return canvas.toDataURL(format, quality);
    } else {
      throw new Error("toDataURL is not available in this environment");
    }
  }

  /**
   * Apply transformations and return the transformed image as a Blob
   * Works in both main thread and worker contexts
   */
  async toBlob(options?: { signal?: AbortSignal }): Promise<Blob> {
    const imgData = await this.load();
    const { canvas } = this.transform(imgData);

    const format = this.imageFormat || "image/jpeg";
    const quality = parseFloat(this.imageQuality || "0.9");

    // If signal is provided, create abort controller handler
    if (options?.signal) {
      const abortPromise = new Promise<Blob>((_, reject) => {
        options.signal?.addEventListener("abort", () => {
          reject(new Error("Operation aborted"));
        });
      });

      // Race between the abort signal and the actual blob conversion
      return Promise.race([this.canvasToBlob(canvas, format, quality), abortPromise]);
    }

    return this.canvasToBlob(canvas, format, quality);
  }

  /**
   * Helper method to convert canvas to blob, handling both types of canvas
   */
  private canvasToBlob(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    format: string,
    quality: number
  ): Promise<Blob> {
    // For OffscreenCanvas
    if ("convertToBlob" in canvas) {
      return canvas.convertToBlob({ type: format, quality });
    }
    // For regular Canvas
    else if ("toBlob" in canvas) {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to convert canvas to Blob"));
            }
          },
          format,
          quality
        );
      });
    } else {
      throw new Error("Neither convertToBlob nor toBlob is available");
    }
  }

  /**
   * Convert to ArrayBuffer - useful for worker to main thread transfer
   */
  async toArrayBuffer(options?: { signal?: AbortSignal }): Promise<ArrayBuffer> {
    const blob = await this.toBlob(options);
    return await blob.arrayBuffer();
  }
}

export interface ResizeOptions {
  _width?: number | null;
  _height?: number | null;
  _aspectRatio?: string | null;
}

export type ResizeAlgorithm = "standard" | "lanczos" | "multistep";

/**
 * Factory function to create an ImageKit instance
 * @param src - Source image URL
 * @returns New ImageKit instance
 */
export function image(src: string) {
  return new ImageKit(src);
}

/**
 * Worker message handler example
 *
 * Usage in worker:
 *
 * self.onmessage = async (e) => {
 *   if (e.data.type === 'processImage') {
 *     const result = await processImageInWorker(e.data.imageUrl, e.data.options);
 *     self.postMessage({ type: 'result', result }, [result.buffer]);
 *   }
 * };
 */
export async function processImageInWorker(
  imageUrl: string,
  options: {
    format?: string;
    quality?: number;
    resize?: ResizeOptions;
    sharpen?: number;
    algorithm?: ResizeAlgorithm;
  }
): Promise<ArrayBuffer> {
  let processor = image(imageUrl).setDeliveryType("fetch");

  if (options.format) {
    processor = processor.format(options.format);
  }

  if (options.quality !== undefined) {
    processor = processor.quality(options.quality);
  }

  if (options.resize) {
    processor = processor.resize(options.resize);
  }

  if (options.sharpen !== undefined) {
    processor = processor.sharpen(options.sharpen);
  }

  if (options.algorithm) {
    processor = processor.algorithm(options.algorithm);
  }

  return processor.toArrayBuffer();
}
