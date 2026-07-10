# interface/api/middleware/

HTTP middleware stubs for the domain's API layer.

## locale.js

Attaches `req.locale` from the incoming request. Three resolution strategies are documented in the file; the default stub uses `Accept-Language`. Instances pick their strategy and swap the body — the exported shape stays stable.

Inject the default locale from `domain.yaml` at server startup:

```js
import { localeMiddleware } from './middleware/locale.js';

// Pass domain.yaml i18n.default_locale here:
const withLocale = localeMiddleware('en');

// In your request handler:
withLocale(req, res, () => {
  // req.locale is now set
});
```
