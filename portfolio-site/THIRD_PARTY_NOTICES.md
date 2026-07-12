# Third-party notices

## Noto Sans CJK

- Official source: <https://github.com/notofonts/noto-cjk>
- License file: `Sans/LICENSE` in the official repository
- License: SIL Open Font License 1.1
- Web integration: `next/font/google` requests the approved `Noto Sans SC` weights 400, 500 and 700 during the build and self-hosts the generated font assets. Browsers do not request Google at runtime.

The approved visual direction prefers Source Han Sans SC and accepts Noto Sans CJK SC as its fallback. The workspace does not contain a reviewed Source Han Sans SC web subset, while the full 2.005R variable-font archive is not appropriate for this site. This first version therefore uses the approved Noto fallback and retains system fallbacks in CSS. MiSans is not bundled, and HarmonyOS Sans SC is not used because its web-distribution terms have not been verified for this project.
