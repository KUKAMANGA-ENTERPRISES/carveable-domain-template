# Hello-World Walkthrough

Soup-to-nuts: how a fresh clone of this branch reaches a working greeting.

## 1. Install

```bash
git clone <repo>
cd playpen
git checkout example/hello-world
npm install
```

`npm install` resolves the `runsnative` dependency from the in-repo tarball (`file:runsnative-0.2.0.tgz`). Nothing reaches the network.

## 2. Run

```bash
npm start
# [hello-world] http://127.0.0.1:8910/
# [hello-world] try:  curl http://127.0.0.1:8910/api/hello?name=domain
```

## 3. Verify the layer chain

Open `http://127.0.0.1:8910/`. Click "Hello, world". You should see:

```json
{
  "greeting": "Hello, world",
  "source": "echo"
}
```

The `source: "echo"` is what proves the request reached the adapter. If it were missing or the route had hardcoded the string, the field wouldn't be there.

## 4. Verify each layer in isolation

```bash
# Adapter — no service, no HTTP
node -e "import('./adapters/echo/index.js').then(m => console.log(m.echo.getPrefix()))"
# → { prefix: 'Hello', source: 'echo' }

# Service — no HTTP
node -e "import('./services/hello/index.js').then(m => console.log(m.hello.sayHello({name:'svc'})))"
# → { greeting: 'Hello, svc', source: 'echo' }

# Tool — what an agent would call
node -e "import('./behavior/tools/say-hello.js').then(m => console.log(m.tool.invoke({name:'tool'})))"
# → { greeting: 'Hello, tool', source: 'echo' }

# HTTP
curl http://127.0.0.1:8910/api/hello?name=http
# → {"greeting":"Hello, http","source":"echo"}
```

All four paths return the same result. That's the hexagon working — the outside (HTTP, tools, raw imports) can hit the inside (service + adapter) interchangeably.

## 5. Retheme the brand

Edit `presentation/styles/tokens.css`. Refresh `/presentation/pages/variants.html`. The buttons re-skin without touching any component code. That's the carve story for the brand layer: a buyer with their own tokens swaps one file.

## 6. Carve test

```bash
grep -RIn "C:\\\\_DEV\\\\KUKAMANGA" . \
  --exclude-dir=node_modules --exclude-dir=.git
# → should print zero matches in instance-owned files
```

If anything in `services/`, `adapters/`, or `interface/` matches, the domain is leaking a sibling-repo absolute path.
