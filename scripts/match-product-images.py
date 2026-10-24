#!/usr/bin/env python3
import json
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps


def signature(path: Path, size=(48, 48)) -> np.ndarray:
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS)
        pixels = np.asarray(image, dtype=np.float32) / 255.0
        # Blend colour and edge information so similar neutral interiors remain distinguishable.
        gray = pixels.mean(axis=2)
        edges_x = np.diff(gray, axis=1, append=gray[:, -1:])
        edges_y = np.diff(gray, axis=0, append=gray[-1:, :])
        return np.concatenate((pixels.reshape(-1), edges_x.reshape(-1), edges_y.reshape(-1)))


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("Usage: match-product-images.py <thumbnail-dir> <original-dir> <output-dir>")

    thumbnail_dir, original_dir, output_dir = map(Path, sys.argv[1:])
    thumbnails = sorted(thumbnail_dir.glob("bi-*.jpg"))
    originals = sorted(path for path in original_dir.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"})
    if len(thumbnails) != len(originals):
        raise SystemExit(f"Expected equal sets, found {len(thumbnails)} thumbnails and {len(originals)} originals")

    thumb_signatures = np.stack([signature(path) for path in thumbnails])
    original_signatures = np.stack([signature(path) for path in originals])
    scores = ((thumb_signatures[:, None, :] - original_signatures[None, :, :]) ** 2).mean(axis=2)

    # Assign globally from the strongest available visual match to preserve one-to-one mapping.
    assignments = {}
    used_thumbnails = set()
    used_originals = set()
    for flat_index in np.argsort(scores, axis=None):
        thumb_index, original_index = np.unravel_index(flat_index, scores.shape)
        if thumb_index in used_thumbnails or original_index in used_originals:
            continue
        assignments[thumb_index] = original_index
        used_thumbnails.add(thumb_index)
        used_originals.add(original_index)
        if len(assignments) == len(thumbnails):
            break

    output_dir.mkdir(parents=True, exist_ok=True)
    report = []
    for thumb_index, thumbnail in enumerate(thumbnails):
        original_index = assignments[thumb_index]
        original = originals[original_index]
        ranked = np.argsort(scores[thumb_index])
        best = float(scores[thumb_index, original_index])
        next_available = next((float(scores[thumb_index, idx]) for idx in ranked if idx != original_index), best)
        destination = output_dir / thumbnail.name
        shutil.copy2(original, destination)
        report.append({
            "product": thumbnail.stem.upper(),
            "thumbnail": thumbnail.name,
            "original": original.name,
            "score": round(best, 8),
            "nextScore": round(next_available, 8),
            "confidenceRatio": round(next_available / max(best, 1e-12), 3),
        })

    report.sort(key=lambda item: item["score"])
    Path("catalogue-import/image-matches.json").write_text(json.dumps(report, indent=2) + "\n")
    print(f"Matched {len(report)} originals. Worst score: {max(item['score'] for item in report):.8f}")


if __name__ == "__main__":
    main()
