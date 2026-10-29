import React, { useState } from 'react'
import { IMAGE_VARIANTS } from '../../data/imageVariants'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

/** Responsive WebP sources for a site photo, or undefined when none were generated. */
export const webpSrcSet = (src?: string) => {
  const file = src?.match(/^\/product-images\/([^/?#]+)$/)?.[1]
  const entry = file ? IMAGE_VARIANTS[file] : undefined
  if (!entry) return undefined
  const base = file!.replace(/\.[^.]+$/, '')
  return entry.sizes.map((size) => `/img/${base}-${size}.webp ${Math.min(size, entry.width)}w`).join(', ')
}

/** URL of the smallest WebP that covers `cssWidth` on this screen, or the original file. */
export const bestImageUrl = (src: string, cssWidth: number) => {
  const file = src.match(/^\/product-images\/([^/?#]+)$/)?.[1]
  const entry = file ? IMAGE_VARIANTS[file] : undefined
  if (!entry) return src
  const needed = cssWidth * (window.devicePixelRatio || 1)
  const size = entry.sizes.find((candidate) => Math.min(candidate, entry.width) >= needed) ?? entry.sizes[entry.sizes.length - 1]
  return `/img/${file!.replace(/\.[^.]+$/, '')}-${size}.webp`
}

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  // Images load lazily by default; above-the-fold callers pass loading="eager".
  // `sizes` tells the browser how wide the image is drawn so it can pick the smallest WebP that fits.
  const { src, alt, style, className, loading = 'lazy', decoding = 'async', sizes = '100vw', ...rest } = props

  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
        </div>
      </div>
    )
  }

  const img = <img src={src} alt={alt} className={className} style={style} loading={loading} decoding={decoding} {...rest} onError={handleError} />
  const srcSet = webpSrcSet(src)
  if (!srcSet) return img

  return (
    <picture className="contents">
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      {img}
    </picture>
  )
}
