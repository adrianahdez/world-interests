# Graph Report - world-interests  (2026-06-19)

## Corpus Check
- 79 files · ~143,821 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 334 nodes · 525 edges · 34 communities (15 shown, 19 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7fd09e04`
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
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]

## God Nodes (most connected - your core abstractions)
1. `LanguageContext` - 19 edges
2. `Map()` - 14 edges
3. `Spec: Realtime Country Modal And Live Clock` - 14 edges
4. `translations` - 10 edges
5. `WIF-8: Codebase Audit And Quality Improvements` - 10 edges
6. `CountryPanel()` - 9 edges
7. `ChannelPanel()` - 8 edges
8. `Countries()` - 8 edges
9. `getCountryLatLon()` - 8 edges
10. `App Component` - 8 edges

## Surprising Connections (you probably didn't know these)
- `WIF-16: Map Pin Style Loss on Language Change` --references--> `LanguageContext`  [INFERRED]
  .sdd/specs/WIF-16.md → src/Common/LanguageContext.jsx
- `WIF-14: SEO And Performance Optimization` --references--> `translations`  [INFERRED]
  .sdd/specs/WIF-14.md → src/Common/translations.js
- `WIF-11: Tooltip With Date Ranges For Channel History` --references--> `CountryPanel()`  [INFERRED]
  .sdd/specs/WIF-11.md → src/CountryPanel/CountryPanel.jsx
- `WIF-12: Channel Images Not Loading In Map Pin` --references--> `CountryPanel()`  [INFERRED]
  .sdd/specs/WIF-12.md → src/CountryPanel/CountryPanel.jsx
- `WIF-17: Rename InfoSidebar To ChannelPanel` --references--> `App()`  [INFERRED]
  .sdd/specs/WIF-17.md → src/App/App.jsx

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

## Communities (34 total, 19 thin omitted)

### Community 0 - "Map Rendering & Data"
Cohesion: 0.08
Nodes (31): CountryPanelContext, MapPointContext, Countries(), SELECTED_STYLE, CustomMarker(), Mutual Panel Exclusivity Pattern, Real-Time Data Update Pattern, useImageRetry() (+23 more)

### Community 1 - "App Shell & Navigation"
Cohesion: 0.12
Nodes (17): App(), Categories(), CATEGORY_RETRY_DELAYS, ChannelPanel(), LanguageContext, SidebarContext, ThemeContext, Footer() (+9 more)

### Community 2 - "Global Configuration"
Cohesion: 0.06
Nodes (33): dependencies, dotenv-webpack, leaflet, leaflet-gesture-handling, @linkurious/leaflet-heat, prop-types, react, react-dom (+25 more)

### Community 3 - "Backend & Architecture"
Cohesion: 0.11
Nodes (27): Countries Component, CustomMarker Component, Footer Component, InfoSidebar Component, Map Component, MapSettings Component, MapViewSaver Component, Codebase Quality and Architectural Improvements (+19 more)

### Community 4 - "Country Panel"
Cohesion: 0.09
Nodes (27): ChannelPanel Component, IconComment(), IconEye(), IconInfo(), IconThumbUp(), translations, AppearancesTooltip(), buildLastUpdatedLabel() (+19 more)

### Community 5 - "Leaflet Integration"
Cohesion: 0.23
Nodes (10): Leaflet, leaflet-heat, react-leaflet, Countries, CustomMarker, makeStyleConfig, HeatmapLayer, getAlpha2FromAlpha3 (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (7): CompressionWebpackPlugin, CopyWebpackPlugin, { DefinePlugin }, Dotenv, HtmlWebpackPlugin, path, TerserPlugin

### Community 8 - "Sitemap Generation"
Cohesion: 0.17
Nodes (14): API_BASE, buildRobots(), buildSitemap(), fetchJson(), fs, http, https, loadEnvFile() (+6 more)

### Community 9 - "UI Screenshots"
Cohesion: 0.25
Nodes (11): Country Polygon Click Selection, Color-Coded Content Category Markers, Dark Mode Theme, Leaflet Interactive Map, Category Sidebar, Live Clock Display, World Interests Main UI, Ranked Content Display (N of Total) (+3 more)

### Community 10 - "Categories & Player"
Cohesion: 0.22
Nodes (10): Categories Component, Player Component, Backend-Sourced Content Localization, Browser Console Warnings Resolution, Error State Management and Graceful Degradation, Data.js Module, translations.js Module, WIF-2: Frontend Error Handling For Missing Categories (+2 more)

### Community 11 - "Point Rendering"
Cohesion: 0.14
Nodes (15): App Component, Categories Component, LanguageProvider(), ThemeProvider(), Theme & Language Persistence, URL Parameter State Synchronization, App Entry Point, Footer (+7 more)

### Community 17 - "History API"
Cohesion: 0.09
Nodes (22): A. Live clock label, Acceptance Criteria, Affected Files, Analysis, B. Country modal — structure, C. Country modal — Tab 1 (real-time / today), Clarifications, Context / Background (+14 more)

### Community 30 - "Community 30"
Cohesion: 0.12
Nodes (14): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, Architecture, Backend, Build & Dev Commands, Component Organization (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.43
Nodes (7): calculatePointAttributes(), changePointAppearance(), COLOR_PALETTE, hexToRgba(), nameToColorIndex(), processPoint(), resize()

## Knowledge Gaps
- **134 isolated node(s):** `DEFAULT_CENTER`, `Context / Background`, `Summary`, `A. Live clock label`, `B. Country modal — structure` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `LanguageContext` connect `App Shell & Navigation` to `Map Rendering & Data`, `Point Rendering`, `Country Panel`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `Countries` connect `Leaflet Integration` to `Map Rendering & Data`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `Map()` connect `Map Rendering & Data` to `App Shell & Navigation`, `Country Panel`, `Community 33`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `LanguageContext` (e.g. with `App()` and `ChannelPanel()`) actually correct?**
  _`LanguageContext` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `Map()` (e.g. with `App()` and `Countries()`) actually correct?**
  _`Map()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `DEFAULT_CENTER`, `Context / Background`, `Summary` to the rest of the system?**
  _138 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Map Rendering & Data` be split into smaller, more focused modules?**
  _Cohesion score 0.0783673469387755 - nodes in this community are weakly interconnected._