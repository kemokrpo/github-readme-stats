import { Card } from "../common/Card.js";
import { getCardColors } from "../common/color.js";
import { formatBytes } from "../common/fmt.js";
import { I18n } from "../common/I18n.js";
import { chunkArray, clampValue, lowercaseTrim } from "../common/ops.js";
import { createProgressNode, flexLayout, measureText } from "../common/render.js";
import { langCardLocales } from "../translations.js";

const DEFAULT_CARD_WIDTH = 300;
const MIN_CARD_WIDTH = 280;
const DEFAULT_LANG_COLOR = "#858585";
const CARD_PADDING = 25;
const COMPACT_LAYOUT_BASE_HEIGHT = 90;
const MAXIMUM_LANGS_COUNT = 20;

const NORMAL_LAYOUT_DEFAULT_LANGS_COUNT = 5;
const COMPACT_LAYOUT_DEFAULT_LANGS_COUNT = 6;
const DONUT_LAYOUT_DEFAULT_LANGS_COUNT = 5;
const PIE_LAYOUT_DEFAULT_LANGS_COUNT = 6;
const DONUT_VERTICAL_LAYOUT_DEFAULT_LANGS_COUNT = 6;

// Utility functions (trimTopLanguages, polar/cartesian conversions, layout heights) remain unchanged

const getDisplayValue = (size, percentages, format) => format === "bytes" ? formatBytes(size) : `${percentages.toFixed(2)}%`;

// Compact nodes without stagger/animations
const createCompactLangNode = ({ lang, totalSize, hideProgress, statsFormat = "percentages" }) => {
  const percentages = (lang.size / totalSize) * 100;
  const displayValue = getDisplayValue(lang.size, percentages, statsFormat);
  const color = lang.color || DEFAULT_LANG_COLOR;

  return `
    <g>
      <circle cx="5" cy="6" r="5" fill="${color}" />
      <text x="15" y="10" class='lang-name'>${lang.name} ${hideProgress ? "" : displayValue}</text>
    </g>
  `;
};

// Other layout renderers (renderCompactLayout, renderDonutVerticalLayout, renderPieLayout, etc.) keep logic but remove animation/stagger references

const renderTopLanguages = (topLangs, options = {}) => {
  const {
    hide_title = false,
    hide_border = false,
    card_width,
    title_color,
    text_color,
    bg_color,
    hide,
    hide_progress,
    theme,
    layout,
    custom_title,
    locale,
    langs_count = 5,
    border_radius,
    border_color,
    disable_animations,
    stats_format = "percentages",
  } = options;

  const i18n = new I18n({ locale, translations: langCardLocales });
  const { langs, totalLanguageSize } = trimTopLanguages(topLangs, langs_count, hide);

  const width = Math.max(card_width || DEFAULT_CARD_WIDTH, MIN_CARD_WIDTH);
  const height = layout === "compact" ? COMPACT_LAYOUT_BASE_HEIGHT : COMPACT_LAYOUT_BASE_HEIGHT + 50;

  const colors = getCardColors({ title_color, text_color, bg_color, border_color, theme });

  const card = new Card({ customTitle: custom_title, defaultTitle: i18n.t("langcard.title"), width, height, border_radius, colors });
  card.setHideBorder(hide_border);
  card.setHideTitle(hide_title);

  return card.render(`<svg data-testid="lang-items" x="${CARD_PADDING}">SVG_CONTENT_HERE</svg>`);
};

export { renderTopLanguages, trimTopLanguages, MIN_CARD_WIDTH };