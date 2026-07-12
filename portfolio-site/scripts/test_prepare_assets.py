import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path, PurePosixPath
from unittest.mock import MagicMock, Mock, patch


WORKSPACE_ROOT = Path(__file__).resolve().parents[2]
SITE_ROOT = Path(__file__).resolve().parents[1]
RECIPE_PATH = SITE_ROOT / "scripts" / "asset-recipes.json"
SCRIPT_PATH = SITE_ROOT / "scripts" / "prepare_assets.py"
MANIFEST_PATH = SITE_ROOT / "scripts" / "asset-manifest.json"
EXPECTED_SOURCE_ROOT = (
    "outputs/manual-20260520-ey-portfolio/presentations/ey-portfolio/assets"
)
EXPECTED_OUTPUT_ROOT = "portfolio-site/public/projects"
ALLOWED_SOURCE_DIRS = {
    "01_vacuum",
    "02_grinder",
    "03_hotel_research",
    "04_hotel_blueprint",
    "05_materials",
    "06_glove",
}
FORBIDDEN_PARTS = (
    "chrome_profile",
    "chrome-profile",
    "browser_profile",
    "browser-profile",
)


class AssetPipelineTests(unittest.TestCase):
    def expected_output_dimensions(self, recipe, source_size):
        source_width, source_height = source_size
        if recipe["crop"] is None:
            processed_width, processed_height = source_width, source_height
        else:
            left, top, right, bottom = recipe["crop"]
            processed_width, processed_height = right - left, bottom - top

        scale = 1.0
        resize = recipe["resize"]
        if resize["maxWidth"] is not None:
            scale = min(scale, resize["maxWidth"] / processed_width)
        if resize["maxHeight"] is not None:
            scale = min(scale, resize["maxHeight"] / processed_height)
        if scale >= 1.0:
            return processed_width, processed_height
        return (
            max(1, round(processed_width * scale)),
            max(1, round(processed_height * scale)),
        )

    def assert_output_dimensions_match(self, recipe, entry, actual_dimensions):
        expected = self.expected_output_dimensions(recipe, entry["sourceSize"])
        self.assertEqual(expected, tuple(entry["outputSize"]), recipe["output"])
        self.assertEqual(expected, tuple(actual_dimensions), recipe["output"])

    def load_recipe_document(self):
        self.assertTrue(RECIPE_PATH.is_file(), "asset-recipes.json is missing")
        return json.loads(RECIPE_PATH.read_text(encoding="utf-8"))

    def load_manifest_document(self):
        self.assertTrue(MANIFEST_PATH.is_file(), "asset-manifest.json is missing")
        return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    def load_prepare_module(self):
        self.assertTrue(SCRIPT_PATH.is_file(), "prepare_assets.py is missing")
        spec = importlib.util.spec_from_file_location("prepare_assets", SCRIPT_PATH)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def validated_source_root(self, document):
        module = self.load_prepare_module()
        unresolved_root = WORKSPACE_ROOT / document["sourceRoot"]
        resolved_root = unresolved_root.resolve()
        self.assertTrue(
            hasattr(module, "validate_resolved_source_root"),
            "resolved source root validation helper is missing",
        )
        module.validate_resolved_source_root(resolved_root)
        return module, unresolved_root, resolved_root

    def test_recipe_uses_the_single_workspace_relative_source_root(self):
        document = self.load_recipe_document()
        self.assertEqual(EXPECTED_SOURCE_ROOT, document["sourceRoot"])
        self.assertEqual(EXPECTED_OUTPUT_ROOT, document["outputRoot"])
        self.assertFalse(Path(document["sourceRoot"]).is_absolute())
        self.assertFalse(Path(document["outputRoot"]).is_absolute())

    def test_recipe_has_exactly_eighteen_safe_whitelisted_sources(self):
        document = self.load_recipe_document()
        recipes = document["recipes"]
        self.assertEqual(18, len(recipes))
        for recipe in recipes:
            source = recipe["source"]
            parts = PurePosixPath(source).parts
            self.assertEqual(2, len(parts), source)
            self.assertIn(parts[0], ALLOWED_SOURCE_DIRS, source)
            self.assertNotIn("..", parts, source)
            folded_source = source.casefold()
            self.assertFalse(any(part in folded_source for part in FORBIDDEN_PARTS))
            self.assertNotEqual("01_vacuum/slide07_img01.png", folded_source)

    def test_output_names_are_unique_webp_paths(self):
        document = self.load_recipe_document()
        outputs = [recipe["output"] for recipe in document["recipes"]]
        self.assertEqual(len(outputs), len({output.casefold() for output in outputs}))
        for output in outputs:
            path = PurePosixPath(output)
            self.assertEqual(".webp", path.suffix)
            self.assertEqual(2, len(path.parts), output)
            self.assertNotIn("..", path.parts, output)

    def test_recipe_output_source_and_purpose_mapping_is_exact(self):
        document = self.load_recipe_document()
        actual = {
            (recipe["output"], recipe["source"], recipe["purpose"])
            for recipe in document["recipes"]
        }
        expected = {
            ("hotel/hero.webp", "04_hotel_blueprint/page16.png", "hero"),
            ("hotel/system-map.webp", "04_hotel_blueprint/page21.png", "lightbox"),
            ("hotel/service-blueprint.webp", "04_hotel_blueprint/page22.png", "lightbox"),
            ("hotel/usage-process.webp", "04_hotel_blueprint/page20.png", "evidence"),
            ("vacuum/cover.webp", "01_vacuum/slide08_img01.jpeg", "hero"),
            ("vacuum/product-model.webp", "01_vacuum/slide05_img02.png", "evidence"),
            ("vacuum/mechanism.webp", "01_vacuum/slide06_img01.png", "inline"),
            ("vacuum/route-study.webp", "01_vacuum/slide06_img02.png", "inline"),
            ("glove/sketches.webp", "06_glove/page01.png", "evidence"),
            ("glove/final-illustration.webp", "06_glove/page01.png", "hero"),
            ("glove/interface.webp", "06_glove/page01.png", "evidence"),
            ("biomaterials/application.webp", "05_materials/page55.png", "hero"),
            ("biomaterials/mangosteen-samples.webp", "05_materials/page33.png", "evidence"),
            ("biomaterials/pineapple-sample-03.webp", "05_materials/page42.png", "evidence"),
            ("grinder/cover.webp", "02_grinder/slide53_img01.png", "hero"),
            ("grinder/context.webp", "02_grinder/slide54_img01.png", "evidence"),
            ("grinder/exploded.webp", "02_grinder/slide56_img01.png", "lightbox"),
            ("grinder/final.webp", "02_grinder/slide63_img01.png", "evidence"),
        }
        self.assertEqual(expected, actual)

    def test_every_recipe_declares_purpose_and_css_limits(self):
        document = self.load_recipe_document()
        for recipe in document["recipes"]:
            self.assertIn(recipe["purpose"], {"hero", "evidence", "inline", "lightbox"})
            self.assertGreater(recipe["maxCssWidth"], 0)
            self.assertGreater(recipe["maxCssHeight"], 0)

    def test_prescribed_crops_and_sensitive_glove_exclusions_are_locked(self):
        document = self.load_recipe_document()
        by_output = {recipe["output"]: recipe for recipe in document["recipes"]}
        expected_crops = {
            "hotel/hero.webp": [1120, 520, 2480, 1395],
            "glove/sketches.webp": [1350, 40, 3040, 1100],
            "glove/final-illustration.webp": [1450, 2500, 2850, 3500],
            "glove/interface.webp": [1500, 4550, 3076, 5400],
            "biomaterials/application.webp": [0, 0, 1488, 600],
            "biomaterials/mangosteen-samples.webp": [35, 220, 675, 710],
            "biomaterials/pineapple-sample-03.webp": [900, 140, 1400, 710],
        }
        for output, crop in expected_crops.items():
            self.assertEqual(crop, by_output[output]["crop"], output)

        pineapple = by_output["biomaterials/pineapple-sample-03.webp"]
        self.assertEqual(330, pineapple["maxCssWidth"])
        self.assertEqual(320, pineapple["maxCssHeight"])

        for output in (
            "glove/sketches.webp",
            "glove/final-illustration.webp",
            "glove/interface.webp",
        ):
            left, top, right, bottom = by_output[output]["crop"]
            self.assertGreaterEqual(left, 1350, output)
            self.assertGreater(top if output != "glove/sketches.webp" else top + 1, 0, output)
            self.assertLessEqual(right, 3076, output)
            self.assertLessEqual(bottom, 5400, output)

    def test_hero_and_evidence_css_limits_have_one_point_five_density(self):
        from PIL import Image

        document = self.load_recipe_document()
        module, source_root, resolved_source_root = self.validated_source_root(document)
        for recipe in document["recipes"]:
            if recipe["purpose"] not in {"hero", "evidence"}:
                continue
            validated_source_path = module.resolve_validated_source_path(
                source_root / Path(PurePosixPath(recipe["source"])),
                resolved_source_root,
            )
            with Image.open(validated_source_path) as image:
                natural_width, natural_height = image.size
            if recipe.get("crop") is not None:
                left, top, right, bottom = recipe["crop"]
                natural_width = right - left
                natural_height = bottom - top
            self.assertGreaterEqual(
                natural_width,
                recipe["maxCssWidth"] * 1.5,
                recipe["output"],
            )
            self.assertGreaterEqual(
                natural_height,
                recipe["maxCssHeight"] * 1.5,
                recipe["output"],
            )

    def test_mechanism_is_inline_and_never_enlarged(self):
        document = self.load_recipe_document()
        recipe = next(
            item for item in document["recipes"] if item["output"] == "vacuum/mechanism.webp"
        )
        self.assertEqual("inline", recipe["purpose"])
        self.assertEqual(572, recipe["maxCssWidth"])
        self.assertEqual(322, recipe["maxCssHeight"])
        self.assertIsNone(recipe["crop"])

    def test_implementation_rejects_unsafe_or_duplicate_recipes(self):
        module = self.load_prepare_module()
        self.assertEqual(WORKSPACE_ROOT, module.WORKSPACE_ROOT)
        self.assertEqual(
            WORKSPACE_ROOT / EXPECTED_SOURCE_ROOT,
            module.SOURCE_ROOT,
        )
        valid = {
            "source": "01_vacuum/slide08_img01.jpeg",
            "output": "vacuum/cover.webp",
            "purpose": "hero",
            "crop": None,
            "resize": {"maxWidth": None, "maxHeight": None},
            "maxCssWidth": 680,
            "maxCssHeight": 700,
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            with self.assertRaises(ValueError):
                module.validate_recipes([valid, dict(valid)], temp_root, temp_root)
            unsafe = dict(valid, source="01_vacuum/nested/secret.png")
            with self.assertRaises(ValueError):
                module.validate_recipes([unsafe], temp_root, temp_root)
            forbidden = dict(valid, source="chrome-profile/file.png")
            with self.assertRaises(ValueError):
                module.validate_recipes([forbidden], temp_root, temp_root)

    def test_source_root_constant_is_not_resolved_at_import_time(self):
        script = SCRIPT_PATH.read_text(encoding="utf-8")
        self.assertIn(
            "SOURCE_ROOT = WORKSPACE_ROOT / SOURCE_ROOT_RELATIVE",
            script,
        )
        self.assertNotIn(
            "SOURCE_ROOT = (WORKSPACE_ROOT / SOURCE_ROOT_RELATIVE).resolve()",
            script,
        )

    def test_validate_recipes_validates_resolved_root_before_recipe_iteration(self):
        module = self.load_prepare_module()
        self.assertTrue(
            hasattr(module, "validate_resolved_source_root"),
            "resolved source root validation helper is missing",
        )
        events = []
        source_root = Mock()
        resolved_root = Path("C:/safe/assets")
        source_root.resolve.side_effect = lambda: events.append("resolve_root") or resolved_root

        def reject_root(root):
            events.append("validate_root")
            raise ValueError("blocked root")

        with patch.object(module, "validate_resolved_source_root", side_effect=reject_root):
            with self.assertRaisesRegex(ValueError, "blocked root"):
                module.validate_recipes([object()], source_root, Mock())
        self.assertEqual(["resolve_root", "validate_root"], events)

    def test_resolved_source_path_reuses_root_validation(self):
        module = self.load_prepare_module()
        self.assertTrue(
            hasattr(module, "validate_resolved_source_root"),
            "resolved source root validation helper is missing",
        )
        resolved_root = Path("C:/safe/assets")
        resolved_source = resolved_root / "01_vacuum" / "allowed.png"
        with patch.object(module, "validate_resolved_source_root") as validate_root:
            module.validate_resolved_source_path(resolved_source, resolved_root)
        validate_root.assert_called_once_with(resolved_root)

    def test_implementation_rejects_case_variant_duplicate_outputs(self):
        module = self.load_prepare_module()
        valid = {
            "source": "01_vacuum/slide08_img01.jpeg",
            "output": "vacuum/cover.webp",
            "purpose": "hero",
            "crop": None,
            "resize": {"maxWidth": None, "maxHeight": None},
            "maxCssWidth": 1,
            "maxCssHeight": 1,
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            source_dir = temp_root / "01_vacuum"
            source_dir.mkdir()
            (source_dir / "slide08_img01.jpeg").write_bytes(b"test")
            case_variant = dict(valid, output="Vacuum/COVER.webp")
            with self.assertRaisesRegex(ValueError, "duplicate output"):
                module.validate_recipes([valid, case_variant], temp_root, temp_root)

    def test_implementation_rejects_case_variant_forbidden_source(self):
        module = self.load_prepare_module()
        forbidden = {
            "source": "01_vacuum/SLIDE07_IMG01.PNG",
            "output": "vacuum/cover.webp",
            "purpose": "hero",
            "crop": None,
            "resize": {"maxWidth": None, "maxHeight": None},
            "maxCssWidth": 1,
            "maxCssHeight": 1,
        }
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            source_dir = temp_root / "01_vacuum"
            source_dir.mkdir()
            (source_dir / "slide07_img01.png").write_bytes(b"test")
            with self.assertRaisesRegex(ValueError, "explicitly forbidden"):
                module.validate_recipes([forbidden], temp_root, temp_root)

    def test_resolved_source_path_is_rechecked_without_accessing_the_filesystem(self):
        module = self.load_prepare_module()
        self.assertTrue(
            hasattr(module, "validate_resolved_source_path"),
            "resolved source validation helper is missing",
        )
        with tempfile.TemporaryDirectory() as temp_dir:
            resolved_root = Path(temp_dir).resolve() / "assets"
            forbidden_root = Path(temp_dir) / "BrOwSeR-PrOfIlE-simulated" / "assets"
            with self.assertRaisesRegex(ValueError, "forbidden resolved source root"):
                module.validate_resolved_source_path(
                    forbidden_root / "01_vacuum" / "allowed.png",
                    forbidden_root,
                )
            module.validate_resolved_source_path(
                resolved_root / "01_vacuum" / "allowed.png",
                resolved_root,
            )
            with self.assertRaisesRegex(ValueError, "forbidden resolved source"):
                module.validate_resolved_source_path(
                    resolved_root / "chrome-profile-simulated" / "asset.png",
                    resolved_root,
                )
            with self.assertRaisesRegex(ValueError, "resolved source.*allowlist"):
                module.validate_resolved_source_path(
                    resolved_root / "junction-target" / "asset.png",
                    resolved_root,
                )
            with self.assertRaisesRegex(ValueError, "explicitly forbidden"):
                module.validate_resolved_source_path(
                    resolved_root / "01_vacuum" / "SLIDE07_IMG01.PNG",
                    resolved_root,
                )

    def test_source_resolution_is_validated_before_is_file(self):
        module = self.load_prepare_module()
        self.assertTrue(
            hasattr(module, "resolve_validated_source_path"),
            "ordered source resolution helper is missing",
        )
        events = []
        unresolved_source = Mock()
        resolved_source = Mock()
        unresolved_source.resolve.side_effect = lambda: events.append("resolve") or resolved_source
        resolved_source.is_file.side_effect = lambda: events.append("is_file") or True
        resolved_root = Path("C:/safe/assets")

        with patch.object(
            module,
            "validate_resolved_source_path",
            side_effect=lambda source, root: events.append("validate"),
        ):
            result = module.resolve_validated_source_path(unresolved_source, resolved_root)

        self.assertIs(resolved_source, result)
        self.assertEqual(["resolve", "validate", "is_file"], events)

    def test_preflight_opens_only_the_prevalidated_resolved_source(self):
        module = self.load_prepare_module()
        resolved_root = Path("C:/safe/assets")
        resolved_source = Path("C:/safe/assets/01_vacuum/resolved.png")
        recipe = {
            "source": "01_vacuum/unresolved.png",
            "output": "vacuum/test.webp",
            "purpose": "inline",
            "crop": None,
            "resize": {"maxWidth": None, "maxHeight": None},
            "maxCssWidth": 1,
            "maxCssHeight": 1,
            "_resolvedSourcePath": resolved_source,
        }
        fake_image = MagicMock()
        fake_image.size = (100, 100)
        fake_image.mode = "RGB"
        fake_image.info = {}
        image_context = MagicMock()
        image_context.__enter__.return_value = fake_image

        with patch.object(module.Image, "open", return_value=image_context) as image_open:
            prepared = module._preflight([recipe], resolved_root)

        image_open.assert_called_once_with(resolved_source)
        self.assertEqual(resolved_source, prepared[0]["sourcePath"])

    def test_resize_change_without_regeneration_fails_dimension_guard(self):
        from PIL import Image

        recipe_document = self.load_recipe_document()
        manifest_document = self.load_manifest_document()
        recipe = dict(
            next(
                item
                for item in recipe_document["recipes"]
                if item["output"] == "hotel/system-map.webp"
            )
        )
        recipe["resize"] = {"maxWidth": 1600, "maxHeight": None}
        entry = next(
            item
            for item in manifest_document["assets"]
            if item["output"] == recipe["output"]
        )
        output_path = SITE_ROOT / "public" / "projects" / Path(
            PurePosixPath(recipe["output"])
        )
        with Image.open(output_path) as image:
            actual_dimensions = image.size
        with self.assertRaises(AssertionError):
            self.assert_output_dimensions_match(recipe, entry, actual_dimensions)

    def test_manifest_and_generated_outputs_are_consistent_and_metadata_free(self):
        from PIL import Image

        recipe_document = self.load_recipe_document()
        manifest_document = self.load_manifest_document()
        module, source_root, resolved_source_root = self.validated_source_root(
            recipe_document
        )
        manifest = manifest_document["assets"]
        recipes = recipe_document["recipes"]
        self.assertEqual(18, len(manifest))
        self.assertEqual(
            {recipe["output"] for recipe in recipes},
            {entry["output"] for entry in manifest},
        )

        by_output = {entry["output"]: entry for entry in manifest}
        for recipe in recipes:
            entry = by_output[recipe["output"]]
            expected_source = f'{recipe_document["sourceRoot"]}/{recipe["source"]}'
            self.assertEqual(expected_source, entry["source"])
            self.assertFalse(Path(entry["source"]).is_absolute())
            self.assertFalse(Path(entry["output"]).is_absolute())
            self.assertEqual(recipe["purpose"], entry["purpose"])
            self.assertEqual(recipe["crop"], entry["crop"])
            self.assertEqual(recipe["maxCssWidth"], entry["maxCssWidth"])
            self.assertEqual(recipe["maxCssHeight"], entry["maxCssHeight"])
            self.assertRegex(entry["sha256"], r"^[0-9a-f]{64}$")
            self.assertRegex(entry["sourceSha256"], r"^[0-9a-f]{64}$")

            output_path = SITE_ROOT / "public" / "projects" / Path(
                PurePosixPath(recipe["output"])
            )
            self.assertTrue(output_path.is_file(), recipe["output"])
            self.assertEqual(output_path.stat().st_size, entry["bytes"])
            self.assertEqual(
                hashlib.sha256(output_path.read_bytes()).hexdigest(),
                entry["sha256"],
            )
            validated_source_path = module.resolve_validated_source_path(
                source_root / Path(PurePosixPath(recipe["source"])),
                resolved_source_root,
            )
            self.assertEqual(
                hashlib.sha256(validated_source_path.read_bytes()).hexdigest(),
                entry["sourceSha256"],
            )

            with Image.open(output_path) as image:
                self.assertEqual("WEBP", image.format)
                self.assert_output_dimensions_match(recipe, entry, image.size)
                if recipe["output"] == "vacuum/product-model.webp":
                    self.assertEqual("RGBA", image.mode)
                if recipe["output"] == "hotel/hero.webp":
                    self.assertEqual("RGB", image.mode)
                self.assertFalse(image.getexif(), recipe["output"])
                for metadata_key in ("exif", "xmp", "icc_profile"):
                    self.assertNotIn(metadata_key, image.info, recipe["output"])

            source_width, source_height = entry["sourceSize"]
            if recipe["crop"] is None:
                processed_width, processed_height = source_width, source_height
            else:
                left, top, right, bottom = recipe["crop"]
                processed_width, processed_height = right - left, bottom - top
            output_width, output_height = entry["outputSize"]
            self.assertLessEqual(output_width, processed_width, recipe["output"])
            self.assertLessEqual(output_height, processed_height, recipe["output"])
            if recipe["purpose"] in {"hero", "evidence"}:
                self.assertGreaterEqual(
                    output_width,
                    recipe["maxCssWidth"] * 1.5,
                    recipe["output"],
                )
                self.assertGreaterEqual(
                    output_height,
                    recipe["maxCssHeight"] * 1.5,
                    recipe["output"],
                )


if __name__ == "__main__":
    unittest.main()
