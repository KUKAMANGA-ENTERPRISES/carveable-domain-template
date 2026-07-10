# Assets Layer (DAM)

The domain's **brand media** — the images, video, and image-tier textures its pages and skins render. This is the domain's Digital Asset Management (DAM) home: binary media plus the declarative **asset pack** that binds media to the surfaces that consume it.

Media is *material* the owning entity holds (see `domain.yaml` `owner_entity`) — a carved-out domain takes its assets with it.

## Substructure

- **`asset-pack.json`** — the domain's brand asset pack: a declarative `key → asset URL` manifest (`scope: "brand"`) conforming to the **Theme & Skin Asset Manifest Contract v1**. It is *inert data* — no logic, no rendering — binding keys (e.g. `hero`, `storefront`) to files under `media/`. Token/asset resolvers read it; nothing in it executes.
- **`media/`** — the actual binary assets (jpg / png / webp / mp4). Organize by kind as the domain grows (`media/hero/`, `media/storefront/`, `media/textures/`).

## What does NOT go here

- **Components / code** → `presentation/components/` (owned) or `presentation/vendor/` (consumed). An asset pack may *point at* a texture; it never says how a component renders it — that is code (a renderer, not an asset).
- **Design tokens / CSS** → `presentation/styles/`. Tokens are definitions, not media.

## Why it's a first-class layer

A DAM is the *media* half of a brand's front-end estate; a design system (components + tokens) is the *definitions* half. They are different homes: the design system **references** DAM assets, it does not contain them. Without this layer, brand media has nowhere carveable to live and leaks into `presentation/` ad hoc.

## A useful smell

If `asset-pack.json` contains a conditional, a shape, or anything computed at render time, it has stopped being an asset binding and become a renderer — that logic belongs in a skin/component under `presentation/`, not here.
