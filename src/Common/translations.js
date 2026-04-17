const translations = {
  en: {
    statsFor: "Statistics for ",
    youtubeCategories: "YouTube Categories",
    footerTitle: "Youtube channels trending #1 now (realtime)",
    footerDesc: "Data obtained from the YouTube API - You are viewing the #1 trending video channel from each country.",
    developedBy: "Developed by ",
    channelName: "Channel Name: ",
    channelUsername: "Channel username: ",
    country: "Country: ",
    mostPopularVideo: "Today's #1 trending: ",
    category: "Category: ",
    appMetaTagTitle: "Real-time #1 Trending YouTube Channels around the world 🔥",
    appMetaTagDescription: "View on a real-time map the most popular YouTube channels in different categories and countries around the world",
    categoriesUnavailable: "Categories are not available right now. Please try again later.",
    categoriesRetry: "Try again",
    categoriesLoading: "Loading categories…",
    mapDataUnavailable: "Map data is not available right now. Please try again later.",
    retrying: "Retrying",
    mapAriaLabel: "Interactive world map showing trending YouTube channels by country",
    heatmapShow: "Show heatmap",
    heatmapHide: "Hide heatmap",
    heatmapLabel: "Heatmap",
    // "Marker clustering" is clearer than plain "Clustering" — pin icon added in MapSettings
    clusteringLabel: "Marker clustering",
    fullscreenLabel: "Fullscreen",
    flagsLabel: "Flags",
    footerLabel: "Footer",
    settingsLabel: "Map settings",
    countryChannelsLabel: "Country top channels",
    // ── Channel panel (InfoSidebar) ────────────────────────────────────────────
    // Used as the panel title: "Today's #1 for 🇲🇽 Mexico"
    channelPanelTitle: "Today's #1 for",
    // ── Country Panel ──────────────────────────────────────────────────────────
    // Used as the panel title: "Trends history for 🇧🇷 Brazil"
    countryPanelTitlePrefix: "Trends history for",
    countryPanelAriaLabel: "Country historical trends panel",
    countryPanelCategory: "Category:",
    // "Based on data from X day(s)" — compose as: basedOnData + bold(X + day/days)
    basedOnData: "Based on data from",
    day: "day",
    days: "days",
    // "Last updated …" label — two prefix variants handle today/yesterday vs. X ago
    // EN uses the same prefix for both; ES uses different prefixes (see es section).
    lastUpdatedRecent: "Last updated",  // for "today" / "yesterday"
    lastUpdatedAgo: "Last updated",     // for "X days/weeks/months ago"
    today: "today",
    yesterday: "yesterday",
    daysAgo: "days ago",
    weeksAgo: "weeks ago",
    monthsAgo: "months ago",
    // Suffix appended after the number of days in "Based on data from X days ago"
    ago: "ago",
    // Channel count notice suffix: "Showing X of up to N channels (based on your settings)"
    basedOnSettings: "(based on your settings)",
    // Prefix label shown above the #1 trending video link in the channel panel
    videoLabel: "#1 Video:",
    // Channel card appearances line: "Channel: 4 different days as #2 in data history"
    channelLabel: "Channel:",
    channelDayAs: "day as",
    channelDaysAs: "different days as",
    inDataHistory: "in data history",
    // Overflow suffix in the appearances tooltip: "+ 5 more"
    andMore: "+ {n} more",
    // Peak video label
    peakVideo: "Most viewed video",
    // Channel count notice (always shown when data loads): "Showing X of up to N channels"
    showingOf: "Showing",
    ofUpTo: "of up to",
    channels: "channels",
    // States
    countryPanelLoading: "Loading historical data…",
    countryPanelEmpty: "No historical data available for this country yet.",
    // Generic message — avoids implying data will ever arrive for countries that never trend
    countryPanelComingSoon: "Historical data for this country is not available yet.",
    countryPanelError: "Could not load historical data.",
    countryPanelRetry: "Try again",
  },
  es: {
    statsFor: "Estadísticas para ",
    youtubeCategories: "Categorías de YouTube",
    footerTitle: "Canales de YouTube en tendencia (en tiempo real)",
    footerDesc: "Datos obtenidos de la API de YouTube - Estás viendo el canal de video más popular de cada país.",
    developedBy: "Desarrollado por ",
    channelName: "Nombre del Canal: ",
    channelUsername: "Nombre de usuario del Canal: ",
    country: "País: ",
    mostPopularVideo: "Tendencia #1 de hoy: ",
    category: "Categoría: ",
    appMetaTagTitle: "Canales de YouTube más populares en tiempo real en todo el mundo 🔥",
    appMetaTagDescription: "Visualiza en un mapa en tiempo real los canales de YouTube más populares en diferentes categorías y países alrededor del mundo",
    categoriesUnavailable: "Las categorías no están disponibles en este momento. Por favor, inténtalo más tarde.",
    categoriesRetry: "Intentar de nuevo",
    categoriesLoading: "Cargando categorías…",
    mapDataUnavailable: "Los datos del mapa no están disponibles en este momento. Por favor, inténtalo más tarde.",
    retrying: "Reintentando",
    mapAriaLabel: "Mapa mundial interactivo con los canales de YouTube en tendencia por país",
    heatmapShow: "Mostrar mapa de calor",
    heatmapHide: "Ocultar mapa de calor",
    heatmapLabel: "Mapa de calor",
    clusteringLabel: "Agrupación de marcadores",
    fullscreenLabel: "Pantalla completa",
    flagsLabel: "Banderas",
    footerLabel: "Pie de página",
    settingsLabel: "Ajustes del mapa",
    countryChannelsLabel: "Top canales por país",
    // ── Panel de canal (InfoSidebar) ───────────────────────────────────────────
    channelPanelTitle: "Tendencia #1 hoy en",
    // ── Panel de país ──────────────────────────────────────────────────────────
    countryPanelTitlePrefix: "Historial de tendencias de",
    countryPanelAriaLabel: "Panel de tendencias históricas del país",
    countryPanelCategory: "Categoría:",
    // "Basado en datos de hace" includes "hace" so the number follows naturally: "hace 2 días"
    basedOnData: "Basado en datos de hace",
    // ago is empty for ES because "hace" is already embedded in basedOnData
    ago: "",
    day: "día",
    days: "días",
    // ES uses "Actualizado hoy/ayer" (no "hace") and "Actualizado hace X días" for relative
    lastUpdatedRecent: "Actualizado",   // for "hoy" / "ayer" — no "hace"
    lastUpdatedAgo: "Actualizado hace", // for "X días/semanas/meses" — includes "hace"
    today: "hoy",
    yesterday: "ayer",
    daysAgo: "días",
    weeksAgo: "semanas",
    monthsAgo: "meses",
    channelLabel: "Canal:",
    channelDayAs: "día como",
    channelDaysAs: "días diferentes como",
    inDataHistory: "en la historia de datos",
    andMore: "+ {n} más",
    peakVideo: "Vídeo más visto",
    showingOf: "Mostrando",
    ofUpTo: "de hasta",
    channels: "canales",
    // Channel count notice suffix
    basedOnSettings: "(según tu configuración)",
    // Prefix label shown above the #1 trending video link in the channel panel
    videoLabel: "Video #1:",
    countryPanelLoading: "Cargando datos históricos…",
    countryPanelEmpty: "Aún no hay datos históricos disponibles para este país.",
    countryPanelComingSoon: "Los datos históricos de este país aún no están disponibles.",
    countryPanelError: "No se pudieron cargar los datos históricos.",
    countryPanelRetry: "Intentar de nuevo",
  },
};

export default translations;
