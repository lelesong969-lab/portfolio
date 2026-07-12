from __future__ import annotations

import hashlib
import json
from pathlib import Path, PurePosixPath
from typing import Any

from PIL import Image


WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
SITE_ROOT = Path(__file__).resolve().parents[1]
RECIPE_PATH = SITE_ROOT / "scripts" / "asset-recipes.json"
MANIFEST_PATH = SITE_ROOT / "scripts" / "asset-manifest.json"
SOURCE_ROOT_RELATIVE = (
    "outputs/manual-20260520-ey-portfolio/presentations/ey-portfolio/assets"
)
OUTPUT_ROOT_RELATIVE = "portfolio-site/public/projects"
SOURCE_ROOT = WORKSPACE_ROOT / SOURCE_ROOT_RELATIVE
OUTPUT_ROOT = (WORKSPACE_ROOT / OUTPUT_ROOT_RELATIVE).resolve()
ALLOWED_SOURCE_DIRS = {
    "01_vacuum",
    "02_grinder",
    "03_hotel_research",
    "04_hotel_blueprint",
    "05_materials",
    "06_glove",
}
ALLOWED_PURPOSES = {"hero", "evidence", "inline", "lightbox"}
FORBIDDEN_PARTS = (
    "chrome_profile",
    "chrome-profile",
    "browser_profile",
    "browser-profile",
)


def _is_within(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
    except ValueError:
        return False
    return True


def validate_resolved_source_root(resolved_source_root: Path) -> None:
    folded_root = resolved_source_root.as_posix().casefold()
    if any(token in folded_root for token in FORBIDDEN_PARTS):
        raise ValueError(f"forbidden resolved source root: {resolved_source_root}")


def validate_resolved_source_path(resolved_source: Path, resolved_source_root: Path) -> None:
    validate_resolved_source_root(resolved_source_root)
    try:
        relative_source = resolved_source.relative_to(resolved_source_root)
    except ValueError as error:
        raise ValueError(f"resolved source is outside source root: {resolved_source}") from error

    folded_relative = "/".join(relative_source.parts).casefold()
    if any(token in folded_relative for token in FORBIDDEN_PARTS):
        raise ValueError(f"forbidden resolved source: {relative_source.as_posix()}")
    allowed_dirs = {directory.casefold() for directory in ALLOWED_SOURCE_DIRS}
    if len(relative_source.parts) != 2 or relative_source.parts[0].casefold() not in allowed_dirs:
        raise ValueError(
            f"resolved source is outside the first-level allowlist: {relative_source.as_posix()}"
        )
    if folded_relative == "01_vacuum/slide07_img01.png":
        raise ValueError(f"resolved source is explicitly forbidden: {relative_source.as_posix()}")


def resolve_validated_source_path(source_path: Path, resolved_source_root: Path) -> Path:
    resolved_source = source_path.resolve()
    validate_resolved_source_path(resolved_source, resolved_source_root)
    if not resolved_source.is_file():
        raise ValueError(f"source file is missing: {source_path}")
    return resolved_source


def _posix_parts(value: str, label: str) -> tuple[str, ...]:
    if not isinstance(value, str) or not value:
        raise ValueError(f"{label} must be a non-empty POSIX path")
    path = PurePosixPath(value)
    if path.is_absolute() or ".." in path.parts or "\\" in value:
        raise ValueError(f"unsafe {label}: {value}")
    folded_value = value.casefold()
    if any(token in folded_value for token in FORBIDDEN_PARTS):
        raise ValueError(f"forbidden {label}: {value}")
    return path.parts


def _positive_integer(value: Any, label: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
        raise ValueError(f"{label} must be a positive integer")
    return value


def _validate_crop(value: Any, output: str) -> list[int] | None:
    if value is None:
        return None
    if not isinstance(value, list) or len(value) != 4:
        raise ValueError(f"crop must contain four integers: {output}")
    if any(not isinstance(item, int) or isinstance(item, bool) for item in value):
        raise ValueError(f"crop must contain four integers: {output}")
    left, top, right, bottom = value
    if left < 0 or top < 0 or right <= left or bottom <= top:
        raise ValueError(f"invalid crop: {output}")
    return value


def _validate_resize(value: Any, output: str) -> dict[str, int | None]:
    if not isinstance(value, dict) or set(value) != {"maxWidth", "maxHeight"}:
        raise ValueError(f"resize must define maxWidth and maxHeight: {output}")
    for key in ("maxWidth", "maxHeight"):
        if value[key] is not None:
            _positive_integer(value[key], f"resize.{key} for {output}")
    return value


def validate_recipes(
    recipes: Any,
    source_root: Path,
    output_root: Path,
) -> list[dict[str, Any]]:
    source_root = source_root.resolve()
    validate_resolved_source_root(source_root)
    if not isinstance(recipes, list) or not recipes:
        raise ValueError("recipes must be a non-empty list")

    output_root = output_root.resolve()
    outputs: set[str] = set()
    normalized: list[dict[str, Any]] = []

    for recipe in recipes:
        if not isinstance(recipe, dict):
            raise ValueError("each recipe must be an object")
        source_parts = _posix_parts(recipe.get("source"), "source")
        output_parts = _posix_parts(recipe.get("output"), "output")
        source = recipe["source"]
        output = recipe["output"]

        if len(source_parts) != 2 or source_parts[0] not in ALLOWED_SOURCE_DIRS:
            raise ValueError(f"source is outside the first-level allowlist: {source}")
        if source.casefold() == "01_vacuum/slide07_img01.png":
            raise ValueError(f"source is explicitly forbidden: {source}")
        if len(output_parts) != 2 or PurePosixPath(output).suffix != ".webp":
            raise ValueError(f"output must be a two-level .webp path: {output}")
        output_key = output.casefold()
        if output_key in outputs:
            raise ValueError(f"duplicate output: {output}")
        outputs.add(output_key)

        purpose = recipe.get("purpose")
        if purpose not in ALLOWED_PURPOSES:
            raise ValueError(f"invalid purpose for {output}: {purpose}")
        _positive_integer(recipe.get("maxCssWidth"), f"maxCssWidth for {output}")
        _positive_integer(recipe.get("maxCssHeight"), f"maxCssHeight for {output}")
        _validate_crop(recipe.get("crop"), output)
        _validate_resize(recipe.get("resize"), output)

        output_path = (output_root / Path(*output_parts)).resolve()
        if not _is_within(output_path, output_root):
            raise ValueError(f"output resolves outside output root: {output}")
        normalized.append(dict(recipe))

    for recipe in normalized:
        source_parts = PurePosixPath(recipe["source"]).parts
        source_path = source_root / Path(*source_parts)
        recipe["_resolvedSourcePath"] = resolve_validated_source_path(
            source_path,
            source_root,
        )

    return normalized


def _planned_output_size(
    width: int,
    height: int,
    resize: dict[str, int | None],
) -> tuple[int, int]:
    scale = 1.0
    if resize["maxWidth"] is not None:
        scale = min(scale, resize["maxWidth"] / width)
    if resize["maxHeight"] is not None:
        scale = min(scale, resize["maxHeight"] / height)
    if scale >= 1.0:
        return width, height
    return max(1, round(width * scale)), max(1, round(height * scale))


def _preflight(
    recipes: list[dict[str, Any]],
    _source_root: Path,
) -> list[dict[str, Any]]:
    prepared: list[dict[str, Any]] = []
    for recipe in recipes:
        source_path = recipe["_resolvedSourcePath"]
        with Image.open(source_path) as source_image:
            source_width, source_height = source_image.size
            source_has_alpha = source_image.mode in {"RGBA", "LA"} or (
                source_image.mode == "P" and "transparency" in source_image.info
            )

        crop = recipe["crop"]
        if crop is None:
            processed_width, processed_height = source_width, source_height
        else:
            left, top, right, bottom = crop
            if right > source_width or bottom > source_height:
                raise ValueError(f"crop is outside source bounds: {recipe['output']}")
            processed_width, processed_height = right - left, bottom - top

        output_width, output_height = _planned_output_size(
            processed_width,
            processed_height,
            recipe["resize"],
        )
        if output_width > processed_width or output_height > processed_height:
            raise ValueError(f"upscaling is forbidden: {recipe['output']}")
        if recipe["maxCssWidth"] > output_width or recipe["maxCssHeight"] > output_height:
            raise ValueError(f"CSS display size would upscale output: {recipe['output']}")
        if recipe["purpose"] in {"hero", "evidence"}:
            if output_width < recipe["maxCssWidth"] * 1.5:
                raise ValueError(f"hero/evidence width density is below 1.5x: {recipe['output']}")
            if output_height < recipe["maxCssHeight"] * 1.5:
                raise ValueError(f"hero/evidence height density is below 1.5x: {recipe['output']}")
        if recipe.get("retainAlpha") and not source_has_alpha:
            raise ValueError(f"retainAlpha source has no alpha channel: {recipe['output']}")

        prepared.append(
            {
                "recipe": recipe,
                "sourcePath": source_path,
                "sourceSize": [source_width, source_height],
                "outputSize": [output_width, output_height],
                "hasAlpha": source_has_alpha,
            }
        )
    return prepared


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _clean_pixels(
    source_image: Image.Image,
    crop: list[int] | None,
    has_alpha: bool,
) -> Image.Image:
    working = source_image.crop(tuple(crop)) if crop is not None else source_image.copy()
    mode = "RGBA" if has_alpha else "RGB"
    converted = working.convert(mode)
    clean = Image.new(mode, converted.size)
    clean.paste(converted)
    return clean


def _write_asset(item: dict[str, Any], output_root: Path) -> dict[str, Any]:
    recipe = item["recipe"]
    source_path = item["sourcePath"]
    output_path = output_root / Path(*PurePosixPath(recipe["output"]).parts)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as source_image:
        clean = _clean_pixels(source_image, recipe["crop"], item["hasAlpha"])
    output_size = tuple(item["outputSize"])
    if clean.size != output_size:
        clean = clean.resize(output_size, Image.Resampling.LANCZOS)
    clean.save(output_path, format="WEBP", quality=82, method=6)

    return {
        "output": recipe["output"],
        "source": f"{SOURCE_ROOT_RELATIVE}/{recipe['source']}",
        "sourceSha256": _sha256(source_path),
        "sha256": _sha256(output_path),
        "sourceSize": item["sourceSize"],
        "crop": recipe["crop"],
        "outputSize": item["outputSize"],
        "bytes": output_path.stat().st_size,
        "purpose": recipe["purpose"],
        "maxCssWidth": recipe["maxCssWidth"],
        "maxCssHeight": recipe["maxCssHeight"],
    }


def _load_recipe_document() -> dict[str, Any]:
    document = json.loads(RECIPE_PATH.read_text(encoding="utf-8"))
    if document.get("sourceRoot") != SOURCE_ROOT_RELATIVE:
        raise ValueError("asset-recipes.json must use the canonical sourceRoot")
    if document.get("outputRoot") != OUTPUT_ROOT_RELATIVE:
        raise ValueError("asset-recipes.json must use the canonical outputRoot")
    return document


def main() -> None:
    document = _load_recipe_document()
    recipes = validate_recipes(document.get("recipes"), SOURCE_ROOT, OUTPUT_ROOT)
    prepared = _preflight(recipes, SOURCE_ROOT)
    assets = [_write_asset(item, OUTPUT_ROOT) for item in prepared]
    manifest = {
        "version": 1,
        "sourceRoot": SOURCE_ROOT_RELATIVE,
        "outputRoot": OUTPUT_ROOT_RELATIVE,
        "assets": assets,
    }
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Prepared {len(assets)} WebP assets and wrote {MANIFEST_PATH.name}.")


if __name__ == "__main__":
    main()
