# Score Calculator

A static score-planning tool for Project SEKAI World Link runs. It helps compare chapter ranking scores (`b`) and the total ranking score (`a`) while searching for target digit patterns, locked scores, and lower-effort score plans.

## Features

- Single mode: plan one remaining chapter while keeping the current `a - b` difference unchanged.
- Multi mode: plan multiple chapter scores and calculate the total score as `a = sum(b1..bn)`.
- Exact match and lock controls: fix a final score when a chapter has ended or when the target score is already decided.
- Digit rules: require, prefer, or exclude digit groups for `a` and `b`.
- Optional hard preference: turn "may include" groups into an "at least one" requirement.
- Bilingual UI, mobile layout support, and tap-friendly tooltips.

## Usage

Open `index.html` directly in a browser, or preview the project with any static file server:

```bash
npx serve .
```

The Python script is kept as a reference implementation:

```bash
python calculator.py
```

## Development

Install the local test dependencies first:

```bash
npm install
```

Run the main checks:

```bash
npm run check:js
npm test
python -m py_compile calculator.py
```

`npm test` runs Playwright coverage for the WebUI, including single mode, multi mode, language switching, mobile layout, and locked-input behavior.

## Deployment

This is a fully static project and can be deployed to GitHub Pages from the repository root. Use `index.html` as the entry file.

## License

MIT License. See [LICENSE](LICENSE).
