// @ts-check
import { fetchTopLanguages } from "../src/fetchers/top-languages.js";
import { renderTopLanguages } from "../src/cards/top-languages.js";
import { guardAccess } from "../src/common/access.js";
import { setCacheHeaders, setErrorCacheHeaders, resolveCacheSeconds } from "../src/common/cache.js";
import { parseArray, parseBoolean } from "../src/common/ops.js";
import { renderError } from "../src/common/render.js";
import { MissingParamError, retrieveSecondaryMessage } from "../src/common/error.js";
import { isLocaleAvailable } from "../src/translations.js";

export default async (req, res) => {
  const {
    username,
    hide,
    hide_title,
    hide_border,
    card_width,
    title_color,
    text_color,
    bg_color,
    theme,
    cache_seconds,
    layout,
    langs_count,
    exclude_repo,
    size_weight,
    count_weight,
    custom_title,
    locale,
    border_radius,
    border_color,
    disable_animations,
    hide_progress,
    stats_format,
    full_list, // new param: ?full_list=true
  } = req.query;

  res.setHeader("Content-Type", "image/svg+xml");

  const access = guardAccess({ res, id: username, type: "username", colors: { title_color, text_color, bg_color, border_color, theme } });
  if (!access.isPassed) return access.result;

  if (locale && !isLocaleAvailable(locale)) {
    return res.send(renderError({ message: "Something went wrong", secondaryMessage: "Locale not found", renderOptions: { title_color, text_color, bg_color, border_color, theme } }));
  }

  try {
    let topLangs = await fetchTopLanguages(username, parseArray(exclude_repo), size_weight, count_weight);

// Ensure it's always an array
if (!Array.isArray(topLangs)) topLangs = [];

// Convert query param to boolean
const showFullList = parseBoolean(full_list);

// Limit to top N if not full list
if (!showFullList) {
  const limit = langs_count ? parseInt(langs_count, 10) : 10;
  topLangs = topLangs.slice(0, limit);
}


    const cacheSeconds = resolveCacheSeconds({ requested: parseInt(cache_seconds, 10), def: 86400, min: 60, max: 86400 });
    setCacheHeaders(res, cacheSeconds);

    // Force flat SVG for GitHub (disable animations)
    return res.send(
      renderTopLanguages(topLangs, {
        custom_title,
        hide_title: parseBoolean(hide_title),
        hide_border: parseBoolean(hide_border),
        card_width: parseInt(card_width, 10) || 300,
        hide: parseArray(hide),
        title_color,
        text_color,
        bg_color,
        theme,
        layout,
        langs_count,
        border_radius,
        border_color,
        locale: locale ? locale.toLowerCase() : null,
        disable_animations: true, // force disable for GitHub
        hide_progress: parseBoolean(hide_progress),
        stats_format,
      })
    );
  } catch (err) {
    setErrorCacheHeaders(res);
    if (err instanceof Error) {
      return res.send(renderError({ message: err.message, secondaryMessage: retrieveSecondaryMessage(err), renderOptions: { title_color, text_color, bg_color, border_color, theme, show_repo_link: !(err instanceof MissingParamError) } }));
    }
    return res.send(renderError({ message: "An unknown error occurred", renderOptions: { title_color, text_color, bg_color, border_color, theme } }));
  }
};
