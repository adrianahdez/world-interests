# Graph Report - world-interests  (2026-06-24)

## Corpus Check
- 80 files · ~146,367 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 801 nodes · 966 edges · 74 communities (54 shown, 20 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `935ec544`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Map Rendering & Data|Map Rendering & Data]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_Global Configuration|Global Configuration]]
- [[_COMMUNITY_Backend & Architecture|Backend & Architecture]]
- [[_COMMUNITY_Country Panel|Country Panel]]
- [[_COMMUNITY_Leaflet Integration|Leaflet Integration]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Build Tools|Build Tools]]
- [[_COMMUNITY_Sitemap Generation|Sitemap Generation]]
- [[_COMMUNITY_UI Screenshots|UI Screenshots]]
- [[_COMMUNITY_Categories & Player|Categories & Player]]
- [[_COMMUNITY_Point Rendering|Point Rendering]]
- [[_COMMUNITY_Panel Tooltips|Panel Tooltips]]
- [[_COMMUNITY_Data Fetching|Data Fetching]]
- [[_COMMUNITY_Docker Setup|Docker Setup]]
- [[_COMMUNITY_Trending Concept|Trending Concept]]
- [[_COMMUNITY_Documentation|Documentation]]
- [[_COMMUNITY_History API|History API]]
- [[_COMMUNITY_Sidebar State|Sidebar State]]
- [[_COMMUNITY_Panel Context|Panel Context]]
- [[_COMMUNITY_Favicon Asset|Favicon Asset]]
- [[_COMMUNITY_Missing Image|Missing Image]]
- [[_COMMUNITY_Logo Asset|Logo Asset]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Sitemap Script|Sitemap Script]]
- [[_COMMUNITY_SDD Config|SDD Config]]
- [[_COMMUNITY_SDD Sources|SDD Sources]]
- [[_COMMUNITY_Spec Template|Spec Template]]
- [[_COMMUNITY_Settings Flags|Settings Flags]]
- [[_COMMUNITY_Country Utilities|Country Utilities]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 78|Community 78]]

## God Nodes (most connected - your core abstractions)
1. `Spec for Leaflet Feature Research And Recommendations` - 21 edges
2. `LanguageContext` - 19 edges
3. `Map()` - 14 edges
4. `Spec: Map Pin Style Loss on Language Change` - 14 edges
5. `Spec: Realtime Country Modal And Live Clock` - 14 edges
6. `Spec for Country Panel With Trending Stats` - 12 edges
7. `Spec: Rename InfoSidebar To ChannelPanel` - 12 edges
8. `Spec: Settings Visibility Feature Flags` - 12 edges
9. `Workflow` - 11 edges
10. `Spec: <spec_title>` - 11 edges

## Surprising Connections (you probably didn't know these)
- `WIF-17: Rename InfoSidebar To ChannelPanel` --references--> `App()`  [INFERRED]
  .sdd/specs/WIF-17.md → src/App/App.jsx
- `WIF-16: Map Pin Style Loss on Language Change` --references--> `LanguageContext`  [INFERRED]
  .sdd/specs/WIF-16.md → src/Common/LanguageContext.jsx
- `WIF-11: Tooltip With Date Ranges For Channel History` --references--> `CountryPanel()`  [INFERRED]
  .sdd/specs/WIF-11.md → src/CountryPanel/CountryPanel.jsx
- `WIF-12: Channel Images Not Loading In Map Pin` --references--> `CountryPanel()`  [INFERRED]
  .sdd/specs/WIF-12.md → src/CountryPanel/CountryPanel.jsx
- `WIF-13: GA Warning Message Misleading In Dev` --references--> `Head()`  [INFERRED]
  .sdd/specs/WIF-13.md → src/Head/Head.jsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Context Provider System** — common_languagecontext, common_themecontext, common_countrypanelcontext, common_mappointcontext, common_sidebarcontext [INFERRED 0.90]
- **Panel Management & Mutual Exclusion** — app_app_appcomponent, channelpanel_channelpanelcomponent, countrypanel_countrypanelcomponent, common_countrypanelcontext, common_mappointcontext [EXTRACTED 0.95]
- **Localization & Translation System** — common_languagecontext, common_translations, categories_categoriescomponent, countrypanel_countrypanelcomponent, channelpanel_channelpanelcomponent [INFERRED 0.85]
- **Country Data Access Pipeline** — src_Points_Data_getcountrylatlon, src_Points_Data_getalpha2fromalpha3, src_Points_Data_getflagfromalpha2, data_countrycodes [EXTRACTED 1.00]
- **Map Rendering Flow** — src_Map_map, src_CustomMarker_custommarker, src_Countries_countries, src_Map_heatmaplayer, src_Points_Points_processpoint [EXTRACTED 1.00]
- **Country Ranking Data Fetching** — src_hooks_usecountrytoday, src_hooks_usecountryhistory, src_hooks_usecountryranking [EXTRACTED 1.00]
- **Context Provider System (State Management)** — common_languagecontext_languagecontext, common_themecontext_themecontext, common_sidebarcont_sidebarcont, common_countrypanelcontext_countrypanelcontext [INFERRED 0.85]
- **Panel Components (Interactive UI Overlays)** — countrypanel_countrypanel_countrypanel, channelpanel_channelpanel_channelpanel, mapsettings_mapsettings_mapsettings [INFERRED 0.80]
- **Implementation Roadmap (WIF-1 through WIF-17)** — sdd_specs_wif1_docker, sdd_specs_wif10_country_panel, sdd_specs_wif11_tooltip, sdd_specs_wif12_image_loading, sdd_specs_wif13_ga_warning, sdd_specs_wif14_seo_perf, sdd_specs_wif15_most_viewed, sdd_specs_wif16_pin_style, sdd_specs_wif17_rename [EXTRACTED 1.00]
- **Realtime Country Modal Feature Cluster** — sdd_specs_wif_19, component_countrypanel, component_liveclock, hook_usecountrytoday, pattern_tab_interface [INFERRED 0.85]
- **Map Component Refactoring and Enhancement Cluster** — component_map, hook_usemapdata, hook_useimageretry, context_mappointcontext, context_sidebarcontext [INFERRED 0.85]
- **Settings and Configuration Feature Cluster** — sdd_specs_wif_18, component_mapsettings, concept_settings_visibility_flags, config_feature_flags, pattern_feature_flag [INFERRED 0.75]
- **Data Display Pipeline (Category → Markers → Details)** — screenshot_left_sidebar, screenshot_custom_markers, screenshot_right_panel, screenshot_video_thumbnails [INFERRED 0.85]
- **Real-Time Data Context** — screenshot_real_time_indicator, screenshot_live_clock, screenshot_video_thumbnails, screenshot_ranking_display [INFERRED 0.75]

## Communities (74 total, 20 thin omitted)

### Community 0 - "Map Rendering & Data"
Cohesion: 0.13
Nodes (13): LanguageProvider(), ThemeContext, ThemeProvider(), Theme & Language Persistence, Header(), MoonIcon(), SunIcon(), App Entry Point (+5 more)

### Community 1 - "App Shell & Navigation"
Cohesion: 0.43
Nodes (7): calculatePointAttributes(), changePointAppearance(), COLOR_PALETTE, hexToRgba(), nameToColorIndex(), processPoint(), resize()

### Community 2 - "Global Configuration"
Cohesion: 0.06
Nodes (33): dependencies, dotenv-webpack, leaflet, leaflet-gesture-handling, @linkurious/leaflet-heat, prop-types, react, react-dom (+25 more)

### Community 3 - "Backend & Architecture"
Cohesion: 0.07
Nodes (37): Categories Component, Countries Component, CustomMarker Component, Footer Component, InfoSidebar Component, Map Component, MapSettings Component, MapViewSaver Component (+29 more)

### Community 4 - "Country Panel"
Cohesion: 0.06
Nodes (42): App Component, Categories Component, ChannelPanel Component, IconComment(), IconEye(), IconInfo(), IconThumbUp(), LanguageContext (+34 more)

### Community 5 - "Leaflet Integration"
Cohesion: 0.29
Nodes (8): leaflet-heat, react-leaflet, Countries, makeStyleConfig, HeatmapLayer, getAlpha2FromAlpha3, getCountryLatLon, getFlagFromAlpha2

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (7): CompressionWebpackPlugin, CopyWebpackPlugin, { DefinePlugin }, Dotenv, HtmlWebpackPlugin, path, TerserPlugin

### Community 7 - "Build Tools"
Cohesion: 0.25
Nodes (8): 1. Think before coding, 2. Simplicity first, 3. Surgical changes, 4. Goal-driven execution, Copilot instructions, graphify, Pause caveat, Working principles

### Community 8 - "Sitemap Generation"
Cohesion: 0.17
Nodes (14): API_BASE, buildRobots(), buildSitemap(), fetchJson(), fs, http, https, loadEnvFile() (+6 more)

### Community 9 - "UI Screenshots"
Cohesion: 0.25
Nodes (11): Country Polygon Click Selection, Color-Coded Content Category Markers, Dark Mode Theme, Leaflet Interactive Map, Category Sidebar, Live Clock Display, World Interests Main UI, Ranked Content Display (N of Total) (+3 more)

### Community 10 - "Categories & Player"
Cohesion: 0.09
Nodes (21): Acceptance Criteria, Affected Files, Analysis, Clarifications, CRITICAL — Bugs, Decisions, Functional Requirements (Implementation Steps), HIGH — Edge Cases (+13 more)

### Community 11 - "Point Rendering"
Cohesion: 0.07
Nodes (38): App(), Categories(), CATEGORY_RETRY_DELAYS, ChannelPanel(), CountryPanelContext, MapPointContext, SidebarContext, Countries() (+30 more)

### Community 17 - "History API"
Cohesion: 0.09
Nodes (22): A. Live clock label, Acceptance Criteria, Affected Files, Analysis, B. Country modal — structure, C. Country modal — Tab 1 (real-time / today), Clarifications, Context / Background (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.12
Nodes (14): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Architecture, Backend, Build & Dev Commands, Component Organization (+6 more)

### Community 31 - "Community 31"
Cohesion: 0.10
Nodes (20): Acceptance Criteria, Affected Files, Analysis, API URL strategy — front-controller (Option B), Backend Notes, Clarifications, DB migration needed: add `thumbnail_url` to `trending_videos`, Decisions (+12 more)

### Community 34 - "Community 34"
Cohesion: 0.10
Nodes (20): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+12 more)

### Community 35 - "Community 35"
Cohesion: 0.11
Nodes (17): Acceptance Criteria, Affected Files, Analysis, Clarifications, Context / Background, Decisions, Dependencies, Functional Requirements (+9 more)

### Community 36 - "Community 36"
Cohesion: 0.11
Nodes (17): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+9 more)

### Community 37 - "Community 37"
Cohesion: 0.12
Nodes (15): Acceptance Criteria, Affected Files, Analysis, Clarifications, Context / Background, Decisions, Functional Requirements, Implementation Plan (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.12
Nodes (15): Acceptance Criteria, Affected Files, Analysis, Clarifications, Context / Background, Decisions, Functional Requirements, Implementation Plan (+7 more)

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 41 - "Community 41"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 42 - "Community 42"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 43 - "Community 43"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 44 - "Community 44"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 45 - "Community 45"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 46 - "Community 46"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 47 - "Community 47"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 48 - "Community 48"
Cohesion: 0.14
Nodes (13): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Open Questions (+5 more)

### Community 49 - "Community 49"
Cohesion: 0.15
Nodes (12): 1. Parse arguments, 2. Load spec, 3. First run vs re-run, 4. Codebase exploration, 5. Risks, 6. Ask user, 7. Write/refresh spec sections, 7a. First run (+4 more)

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (11): Acceptance Criteria, Affected Files, Analysis, Clarifications, Decisions, Functional Requirements, Implementation Plan, Risks & Concerns (+3 more)

### Community 51 - "Community 51"
Cohesion: 0.17
Nodes (11): Acceptance Criteria, Clarifications, Feature Priority Table, Functional Requirements, Implementation Plan, Implementation Workflow, Open Questions, Possible Edge Cases (+3 more)

### Community 52 - "Community 52"
Cohesion: 0.17
Nodes (11): Acceptance Criteria, Context / Background, Dependencies, Functional Requirements, Non-Goals / Out of Scope, Open Questions, Possible Edge Cases, Spec: <spec_title> (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.18
Nodes (10): 1. Load and validate, 2. Find next step, 3. Build the step, 4. Pause for review, 5. Handle response, 6. Commit and mark done, 7. Loop, 7a. CLAUDE.md update (+2 more)

### Community 54 - "Community 54"
Cohesion: 0.18
Nodes (10): 1. Parse arguments, 2. Detect re-entry, 3. Dirty tree check, 4. Choose source, 5. Pull and adapt (skill), 6. Create branch (new draft only), 7. Write spec file, 8. Commit (refresh only) (+2 more)

### Community 55 - "Community 55"
Cohesion: 0.20
Nodes (9): Categories:, Deployment, Environment, Local development, Prerequisites, See it in action, What is this?, With Docker (+1 more)

### Community 56 - "Community 56"
Cohesion: 0.12
Nodes (16): 1. Parse arguments, 2. Lazy init, load spec, detect mode, 3.1 Derive metadata, 3.2 Dirty tree check, 3.3 Branch prompt, 3.4 Write the spec file, 3. Create mode, 4. Codebase exploration (+8 more)

### Community 57 - "Community 57"
Cohesion: 0.22
Nodes (8): 1. Parse arguments, 2. Locate specs, 3. Derive state per spec, 4. Next command, 5. Output, List mode, Single mode, Workflow

### Community 58 - "Community 58"
Cohesion: 0.22
Nodes (8): `adapt(source, body) -> proposed_body`, Adding an adapter, `detect_conflict(source, ref) -> (has_conflict, diff)`, Guarantees, Operations, `pull(source, ref) -> body`, `push(source, ref, body)`, spec-source

### Community 59 - "Community 59"
Cohesion: 0.25
Nodes (7): Adding an adapter, Contract, Frontmatter rule, `jira`, `local` (default), Registered adapters, Source Adapters

### Community 61 - "Community 61"
Cohesion: 0.12
Nodes (15): 1. Load and validate, 1a. Select build mode, 2. Find next step, 3. Build the step, 4. Pause for review, 5. Handle response, 6. Commit and mark done, 7. Loop (+7 more)

### Community 63 - "Community 63"
Cohesion: 0.22
Nodes (8): 1. Parse arguments, 2. Locate specs, 3. Derive state per spec, 4. Next command, 5. Output, List mode, Single mode, Workflow

### Community 64 - "Community 64"
Cohesion: 0.40
Nodes (4): Auto-clarity overrides, Lite rules, Never compress, Persistence

### Community 65 - "Community 65"
Cohesion: 0.40
Nodes (5): Edge Case Handling, No Data for Country, Rate-Limited API (429 Handling), Slow Connection / API Timeout, Stale Data Indicator

### Community 66 - "Community 66"
Cohesion: 0.40
Nodes (5): fitBounds with Sidebar Padding, Gesture Handling — `leaflet-gesture-handling`, Locate Control — `leaflet.locatecontrol`, Map Interaction Improvements, Smooth Wheel Zoom — `@luomus/leaflet-smooth-wheel-zoom`

### Community 67 - "Community 67"
Cohesion: 0.50
Nodes (4): Accessibility (a11y) and Usability, ARIA Labels on Map Container and Markers, Keyboard Navigation for Markers, Reduced Motion Respect

### Community 68 - "Community 68"
Cohesion: 0.50
Nodes (4): Affected Files, Analysis, Decisions, Risks & Concerns

### Community 69 - "Community 69"
Cohesion: 0.50
Nodes (4): Canvas Renderer for GeoJSON, LayerGroup / FeatureGroup per Category, Performance and Scalability, WebGL Renderer — `leaflet-glify` (future-scale)

### Community 70 - "Community 70"
Cohesion: 0.50
Nodes (4): Country Comparison Mode (Future), Dark Tile Layer Swap on Theme Toggle, Fullscreen Mode — `leaflet.fullscreen`, Optional / Advanced Toggleable Features

### Community 71 - "Community 71"
Cohesion: 0.50
Nodes (4): Country Highlight on GeoJSON Hover, Progressive Disclosure, Tooltip on Marker Hover (Desktop), Zoom-Level Detail Tiers

### Community 72 - "Community 72"
Cohesion: 0.50
Nodes (4): Heatmap Overlay — `@linkurious/leaflet-heat`, Marker Clustering — `leaflet.markercluster`, Pane Management (Z-index Layering), Visual Data Differentiation

### Community 73 - "Community 73"
Cohesion: 0.50
Nodes (4): Minimap Context Widget — `leaflet-minimap`, Mobile-Only Bottom Sheet Sidebar, Mobile vs Desktop UX, Touch-Optimized Tap Targets

### Community 74 - "Community 74"
Cohesion: 0.67
Nodes (3): Category Persistence in localStorage, Sidebar Open/Scroll State Persistence, State Persistence

## Knowledge Gaps
- **494 isolated node(s):** `1. Think before coding`, `2. Simplicity first`, `3. Surgical changes`, `4. Goal-driven execution`, `Pause caveat` (+489 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LanguageContext` connect `Country Panel` to `Map Rendering & Data`, `Point Rendering`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `Spec for Leaflet Feature Research And Recommendations` connect `Community 51` to `Community 65`, `Community 66`, `Community 67`, `Community 68`, `Community 69`, `Community 70`, `Community 71`, `Community 72`, `Community 73`, `Community 74`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `Countries` connect `Leaflet Integration` to `Point Rendering`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `LanguageContext` (e.g. with `App()` and `ChannelPanel()`) actually correct?**
  _`LanguageContext` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Map()` (e.g. with `App()` and `Countries()`) actually correct?**
  _`Map()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `1. Think before coding`, `2. Simplicity first`, `3. Surgical changes` to the rest of the system?**
  _498 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Map Rendering & Data` be split into smaller, more focused modules?**
  _Cohesion score 0.1286549707602339 - nodes in this community are weakly interconnected._