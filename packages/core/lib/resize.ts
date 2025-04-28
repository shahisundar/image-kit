export interface ResizeOptions {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  aspectRatio?: string;
}
/*** Helper function to create thumbnail resize options* @returns Resize configuration object*/ export function thumbnail() {
  return {
    crop: "thumb",
    _gravity: "auto",
    _width: null as number | null,
    _height: null as number | null,
    _aspectRatio: null as string | null,
    /**     * Set the width     * @param value - Width in pixels     * @returns The resize configuration object     */ width(
      value: number
    ) {
      this._width = value;
      return this;
    },
    /**     * Set the height     * @param value - Height in pixels     * @returns The resize configuration object     */ height(
      value: number
    ) {
      this._height = value;
      return this;
    },
    /**     * Set the aspect ratio     * @param ratio - Aspect ratio (e.g., "16:9", "4:3", "1:1")     * @returns The resize configuration object     */ aspectRatio(
      ratio: string
    ) {
      this._aspectRatio = ratio;
      return this;
    },
    /**     * Set the gravity     * @param value - Gravity option (auto, center, face, etc.)     * @returns The resize configuration object     */ gravity(
      value: string
    ) {
      this._gravity = value;
      return this;
    },
  };
}
/*** Helper function to create fill resize options* @returns Resize configuration object*/ export function fill() {
  return {
    crop: "fill",
    _gravity: "auto",
    _width: null as number | null,
    _height: null as number | null,
    /**     * Set the width     * @param value - Width in pixels     * @returns The resize configuration object     */ width(
      value: number
    ) {
      this._width = value;
      return this;
    },
    /**     * Set the height     * @param value - Height in pixels     * @returns The resize configuration object     */ height(
      value: number
    ) {
      this._height = value;
      return this;
    },
    /**     * Set the gravity     * @param value - Gravity option (auto, center, face, etc.)     * @returns The resize configuration object     */ gravity(
      value: string
    ) {
      this._gravity = value;
      return this;
    },
  };
}
/*** Helper function to create crop resize options* @returns Resize configuration object*/ export function crop() {
  return {
    crop: "crop",
    _gravity: "auto",
    _width: null as number | null,
    _height: null as number | null,
    /**     * Set the width     * @param value - Width in pixels     * @returns The resize configuration object     */ width(
      value: number
    ) {
      this._width = value;
      return this;
    },
    /**     * Set the height     * @param value - Height in pixels     * @returns The resize configuration object     */ height(
      value: number
    ) {
      this._height = value;
      return this;
    },
    /**     * Set the gravity     * @param value - Gravity option (auto, center, face, etc.)     * @returns The resize configuration object     */ gravity(
      value: string
    ) {
      this._gravity = value;
      return this;
    },
  };
}
