export class ImageKit {
  private source: string | Blob;
  private sourceType: "url" | "blob";
  private deliveryType: string | null = null;
  private imageFormat: string | null = null;
  private imageQuality: string | null = null;
  private resizeOptions: ResizeOptions | null = null;
  private sharpeningLevel: number | null = null;
  private resizeAlgorithm: ResizeAlgorithm = "lanczos";
  private rotationAngle: number = 0;
  private cropShape: CropShape | null = null;

  constructor(source: string | Blob) {
    this.source = source;
    this.sourceType = typeof source === "string" ? "url" : "blob";
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
      (resizeOptions._width &&
        !resizeOptions._height &&
        !resizeOptions._aspectRatio) ||
      (!resizeOptions._width &&
        resizeOptions._height &&
        !resizeOptions._aspectRatio)
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
   * Rotate the image by specified degrees
   */
  rotate(degrees: number) {
    this.rotationAngle = ((degrees % 360) + 360) % 360;
    return this;
  }

  /**
   * Set crop shape (for circular, rectangular crops)
   */
  cropAs(shape: CropShape) {
    this.cropShape = shape;
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
  private createCanvas(width: number, height: number) {
    const isOffscreen = typeof OffscreenCanvas !== "undefined";
    const isDOM = typeof document !== "undefined";

    if (!isOffscreen && !isDOM) {
      throw new Error("Canvas is not available in this environment");
    }

    const canvas = isOffscreen
      ? new OffscreenCanvas(width, height)
      : document.createElement("canvas");

    if (!isOffscreen) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    return { canvas, ctx };
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

    const { canvas: destCanvas, ctx: destCtx } = this.createCanvas(
      targetWidth,
      targetHeight
    );

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
      return (
        (lanczosRadius * Math.sin(xpi) * Math.sin(xpi / lanczosRadius)) /
        (xpi * xpi)
      );
    };

    const scaleX = source.width / targetWidth;
    const scaleY = source.height / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const srcX = x * scaleX;
        const srcY = y * scaleY;

        const startX = Math.max(0, Math.floor(srcX - lanczosRadius));
        const endX = Math.min(
          source.width - 1,
          Math.ceil(srcX + lanczosRadius)
        );
        const startY = Math.max(0, Math.floor(srcY - lanczosRadius));
        const endY = Math.min(
          source.height - 1,
          Math.ceil(srcY + lanczosRadius)
        );

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

    const scaleFactor = Math.min(
      targetWidth / sourceWidth,
      targetHeight / sourceHeight
    );

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
      let currentCtx:
        | CanvasRenderingContext2D
        | OffscreenCanvasRenderingContext2D;
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

        const { canvas: stepCanvas, ctx: stepCtx } = this.createCanvas(
          stepWidth,
          stepHeight
        );

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

  /**
   * Apply crop shape to the canvas (circle, square, rectangle)
   */
  private applyCropShape(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ): {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  } {
    if (!this.cropShape) return { canvas, ctx };

    const width = canvas.width;
    const height = canvas.height;
    const gravity = this.resizeOptions?._gravity;

    let cropWidth = width;
    let cropHeight = height;

    switch (this.cropShape.type) {
      case "circle":
      case "square":
        cropWidth = cropHeight = Math.min(width, height);
        break;
      case "rectangle":
      case "roundedRect":
        cropWidth = this.cropShape.width || width;
        cropHeight = this.cropShape.height || height;
        break;
    }

    let offsetX = 0,
      offsetY = 0;

    if (typeof gravity === "string") {
      switch (gravity) {
        case "top":
          offsetX = (width - cropWidth) / 2;
          offsetY = 0;
          break;
        case "bottom":
          offsetX = (width - cropWidth) / 2;
          offsetY = height - cropHeight;
          break;
        case "left":
          offsetX = 0;
          offsetY = (height - cropHeight) / 2;
          break;
        case "right":
          offsetX = width - cropWidth;
          offsetY = (height - cropHeight) / 2;
          break;
        case "top-left":
          offsetX = 0;
          offsetY = 0;
          break;
        case "top-right":
          offsetX = width - cropWidth;
          offsetY = 0;
          break;
        case "bottom-left":
          offsetX = 0;
          offsetY = height - cropHeight;
          break;
        case "bottom-right":
          offsetX = width - cropWidth;
          offsetY = height - cropHeight;
          break;
        case "center":
        default:
          offsetX = (width - cropWidth) / 2;
          offsetY = (height - cropHeight) / 2;
          break;
      }
    } else if (
      gravity &&
      typeof gravity === "object" &&
      gravity.x !== undefined &&
      gravity.y !== undefined
    ) {
      offsetX = gravity.x;
      offsetY = gravity.y;
    }

    const { canvas: croppedCanvas, ctx: croppedCtx } = this.createCanvas(
      cropWidth,
      cropHeight
    );

    croppedCtx.save();
    croppedCtx.beginPath();
    if (this.cropShape.type === "circle") {
      const radius = Math.min(cropWidth, cropHeight) / 2;
      croppedCtx.arc(cropWidth / 2, cropHeight / 2, radius, 0, Math.PI * 2);
    } else if (this.cropShape.type === "roundedRect") {
      const radius = this.cropShape.radius || 10;
      this.roundRect(croppedCtx, 0, 0, cropWidth, cropHeight, radius);
    } else {
      croppedCtx.rect(0, 0, cropWidth, cropHeight);
    }
    croppedCtx.closePath();
    croppedCtx.clip();

    // Draw image from offset
    croppedCtx.drawImage(
      canvas,
      offsetX,
      offsetY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );
    croppedCtx.restore();

    return { canvas: croppedCanvas, ctx: croppedCtx };
  }

  /**
   * Helper method to draw rounded rectangles
   */
  private roundRect(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  /**
   * Apply rotation to the canvas
   */
  private applyRotation(
    canvas: HTMLCanvasElement | OffscreenCanvas,
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ): {
    canvas: HTMLCanvasElement | OffscreenCanvas;
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  } {
    if (this.rotationAngle === 0) {
      return { canvas, ctx };
    }

    const width = canvas.width;
    const height = canvas.height;

    const radians = (this.rotationAngle * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const newWidth = Math.round(width * cos + height * sin);
    const newHeight = Math.round(width * sin + height * cos);

    const { canvas: rotatedCanvas, ctx: rotatedCtx } = this.createCanvas(
      newWidth,
      newHeight
    );

    rotatedCtx.save();
    rotatedCtx.translate(newWidth / 2, newHeight / 2);
    rotatedCtx.rotate(radians);
    rotatedCtx.drawImage(canvas, -width / 2, -height / 2);
    rotatedCtx.restore();

    return { canvas: rotatedCanvas, ctx: rotatedCtx };
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
        targetWidth = this.calculateWidth(
          targetHeight,
          this.resizeOptions._aspectRatio
        );
      }
    }

    if (this.resizeOptions?.crop) {
      switch (this.resizeOptions.crop) {
        case "thumb":
        case "thumbnail":
          const thumbRatio = targetWidth / targetHeight;
          const imageRatio = imgData.width / imgData.height;

          if (imageRatio > thumbRatio) {
            targetWidth = Math.round(targetHeight * imageRatio);
          } else {
            targetHeight = Math.round(targetWidth / imageRatio);
          }
          break;

        case "fill":
          break;

        case "crop":
          break;
      }
    }

    let { canvas, ctx } = this.multiStepResize(
      imgData,
      targetWidth,
      targetHeight
    );

    if (this.rotationAngle !== 0) {
      const rotated = this.applyRotation(canvas, ctx);
      canvas = rotated.canvas;
      ctx = rotated.ctx;
    }

    if (this.cropShape) {
      const result = this.applyCropShape(canvas, ctx);
      canvas = result.canvas;
      ctx = result.ctx;
    }

    if (this.sharpeningLevel && this.sharpeningLevel > 0) {
      this.applySharpening(
        ctx,
        canvas.width,
        canvas.height,
        this.sharpeningLevel
      );
    }

    return { canvas, ctx };
  }

  /**
   * Load image appropriately based on environment and source type (URL or Blob)
   */
  private async load(): Promise<ImageBitmap | HTMLImageElement> {
    if (this.sourceType === "blob") {
      const blob = this.source as Blob;

      if (typeof createImageBitmap !== "undefined") {
        try {
          return await createImageBitmap(blob);
        } catch (error) {
          throw new Error(`Failed to create ImageBitmap from blob: ${error}`);
        }
      } else if (typeof URL !== "undefined" && typeof Image !== "undefined") {
        const url = URL.createObjectURL(blob);
        try {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () =>
              reject(new Error("Failed to load image from blob"));
            img.src = url;
          });
          return img;
        } finally {
          URL.revokeObjectURL(url);
        }
      } else {
        throw new Error(
          "Neither createImageBitmap nor URL.createObjectURL is available"
        );
      }
    }

    const url = this.source as string;

    if (
      typeof createImageBitmap !== "undefined" &&
      this.deliveryType === "fetch"
    ) {
      try {
        const response = await fetch(url, { mode: "cors" });
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
        img.src = url;

        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      });
    } else {
      throw new Error(
        "Neither createImageBitmap nor Image constructor is available"
      );
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
      return Promise.race([
        this.canvasToBlob(canvas, format, quality),
        abortPromise,
      ]);
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
  async toArrayBuffer(options?: {
    signal?: AbortSignal;
  }): Promise<ArrayBuffer> {
    const blob = await this.toBlob(options);
    return await blob.arrayBuffer();
  }
}

export interface ResizeOptions {
  _width?: number | null;
  _height?: number | null;
  _aspectRatio?: string | null;
  crop?: string;
  _gravity?: string | { x: number; y: number } | null;
}

export type ResizeAlgorithm = "standard" | "lanczos" | "multistep";

export type CropShape =
  | { type: "circle" }
  | { type: "square" }
  | { type: "rectangle"; width?: number; height?: number }
  | { type: "roundedRect"; width?: number; height?: number; radius?: number };

/**
 * Factory function to create an ImageKit instance
 * @param source - Source image URL or Blob
 * @returns New ImageKit instance
 */
export function image(source: string | Blob) {
  return new ImageKit(source);
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
  imageSource: string | Blob,
  options: {
    format?: string;
    quality?: number;
    resize?: ResizeOptions;
    sharpen?: number;
    algorithm?: ResizeAlgorithm;
    rotate?: number;
    cropShape?: CropShape;
    signal?: AbortSignal;
  }
): Promise<ArrayBuffer> {
  let processor = image(imageSource);

  if (typeof imageSource === "string") {
    processor = processor.setDeliveryType("fetch");
  }

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

  if (options.rotate !== undefined) {
    processor = processor.rotate(options.rotate);
  }

  if (options.cropShape) {
    processor = processor.cropAs(options.cropShape);
  }

  return processor.toArrayBuffer(
    options.signal ? { signal: options.signal } : undefined
  );
}
