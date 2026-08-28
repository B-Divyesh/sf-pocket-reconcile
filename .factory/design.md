# Pocket Reconcile — visual thesis

## Direction: a pocket botanical field guide

Reconciliation is a small act of observation: count what is present, compare it with what was recorded, annotate the difference, and close the entry. Pocket Reconcile therefore feels like a well-used field notebook rather than a bank dashboard. Fine rules, specimen labels, inked numerals, clipped corners, and a single pressed-leaf illustration make the workflow calm and exact. Decoration is used only at the welcome/empty moment; the active ledger stays quiet.

The interface has one light treatment and one dark treatment, selected by the device with a manual override. On phones, reference prose and secondary controls collapse while account state, expected/observed balances, and the primary action remain prominent.

## Palette

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `paper` | `#F3EEDD` | `#171C18` | warm notebook ground |
| `sheet` | `#FFFDF4` | `#222923` | raised working surface |
| `ink` | `#1E2A22` | `#F0F1E4` | primary copy; ≥ 12:1 |
| `muted` | `#59635B` | `#B6C0B5` | annotations; ≥ 5.2:1 |
| `fern` | `#365B43` | `#86B591` | primary action and focus |
| `fern-ink` | `#FFFFFF` | `#101712` | action contrast |
| `ochre` | `#9A5A18` | `#E0AA63` | discrepancy/warning |
| `berry` | `#8A3443` | `#F08E9C` | destructive/error |
| `moss` | `#4F6C3D` | `#A1C47D` | reconciled/success |
| `rule` | `#C8C0A8` | `#465048` | outlines and ledger rules |

Color never carries state alone: every status has a label and symbol. There are no gradients.

## Type and numerals

- **Field notes:** Georgia with Cambria fallback for titles and short editorial lines. Its humanist, bookish texture belongs to a specimen guide.
- **Measurements:** the system sans stack for forms, buttons, and annotations; fast, legible, and offline by default.
- 16px minimum body, 1.5 leading, and a compact 1.2 scale. Balances use tabular figures and never depend on floating-point arithmetic.
- No font files are shipped: the two native stacks avoid a privacy request and keep first load lean.

## Spacing, shape, and depth

The spacing unit is 4px; the working rhythm is 8/12/16/24/32/48. Content maxes at 1080px and long copy at 68ch. Touch targets are at least 44px with 8px separation. Corners are restrained (4–14px): clipped specimen tags and crisp ledger rows instead of generic pill cards. A 1px rule groups related measurements before surfaces are boxed. Shadows are sparse, warm, and used only for the active sheet/dialog.

## Interaction grammar

- Navigation is a field-guide index. The current section is underlined and labeled.
- Adding a transaction or account opens a sheet from the control that invoked it; focus moves to its heading and returns on close.
- Reconcile is a three-measurement sequence: expected balance → counted balance → discrepancy. Exact matches “press” a dated reconciliation mark into the account history.
- Immediate, restrained live-region messages confirm save, import, export, undo, online/offline, and license state.
- Destructive operations name their target and require confirmation; a deleted transaction offers Undo.

## Motion policy

UI transitions last 180–240ms and animate only opacity and transform: sheets lift 8px, new ledger entries settle from 4px, and the reconciled seal scales once from 0.96. Nothing loops. With `prefers-reduced-motion: reduce`, transitions and scroll behavior become instant while hierarchy, status text, and depth remain intact.

## Original asset plan and provenance

- `src/assets/pressed-ledger.webp`: a generated still-life illustration used only in the first-run/empty account introduction, supplied at explicit dimensions and kept below 300KB. It clarifies the product metaphor: observation and records brought into agreement.
- PWA icons and interface symbols are original hand-authored SVG/geometric assets; no icon library or third-party asset is used.

### Hero prompt sheet

**Use case:** stylized-concept. **Subject:** an open pocket field notebook with two neat ledger columns and a pressed fern frond aligned between them, a tiny brass counting token, no readable writing. **World:** a botanist's portable desk on warm recycled paper. **Materials:** graphite, faded ink, pressed plant fibers, linen thread, subtle paper grain. **Light/lens:** soft north-window light, top-down editorial still life, shallow tactile relief without photographic clutter. **Palette words:** parchment, deep forest ink, sage, oxidized brass, muted berry. **Composition:** landscape, central specimen, quiet negative space, clean edges suitable for a narrow mobile crop. **Negative list:** no people, hands, currency symbols, bank cards, phones, logos, brands, readable text, watermark, gradients, neon, glossy 3D, anatomical errors, extra objects.

Generation command: `/opt/fleet/lib/gen-image.sh "<prompt sheet above, no text, no watermark, no logos>" assets/src/pressed-ledger.png 1536x1024 high`. Generated with the factory image deployment on 2026-08-28; original to this product under the project MIT license. The chosen candidate was manually reviewed for unwanted marks, malformed foliage, branding, and palette fit, then converted to WebP. The footer discloses generated imagery.

The 1200×630 social preview at `public/assets/social-card.jpg` is a centered crop of that reviewed original. It introduces no new source material and keeps the same provenance and license.
