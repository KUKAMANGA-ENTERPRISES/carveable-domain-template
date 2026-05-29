/**
 * Locale middleware stub — attaches req.locale from the incoming request.
 *
 * Resolution strategies (instance picks one):
 *   URL prefix    — parse the first path segment: /es/api/hello → 'es'
 *   Accept-Language header — parse the first tag from the header value
 *   Cookie        — read a locale cookie set during onboarding or settings
 *
 * This stub uses Accept-Language. Replace the body with whichever strategy
 * the instance needs; the exported shape (req.locale attached, next() called)
 * must remain stable so callers don't change.
 *
 * defaultLocale should come from domain.yaml i18n.default_locale. Pass it
 * in at server startup so the middleware is config-driven, not hard-coded.
 */

export function localeMiddleware(defaultLocale = 'en') {
  return function locale(req, _res, next) {
    const acceptLang = req.headers['accept-language'] ?? '';
    const tag = acceptLang.split(',')[0].trim().split(';')[0].trim().split('-')[0].toLowerCase();
    // '*' is a wildcard ("accept any language") — not a concrete tag; fall back to default.
    req.locale = (tag && tag !== '*') ? tag : defaultLocale;
    if (typeof next === 'function') next();
  };
}

export default localeMiddleware;
