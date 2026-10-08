# Character Counter

A real-time text analyzer built as the lab project for the UI Essentials course in the Frontend specialization.

## Features

- Live character, word and sentence counts
- Option to exclude spaces from the character count
- Optional character limit that blocks extra input and shows a warning
- Approximate reading time (200 words per minute)
- Letter density for the top five letters, with "See more" for the rest
- Light and dark themes that follow the system setting and remember your choice
- Responsive layout for mobile, tablet and desktop

## Built with

- Semantic HTML
- Modern CSS: custom properties, nesting, grid, subgrid and `clamp()`
- Vanilla JavaScript with no build step or dependencies

## Getting started

Open `index.html` in a browser. Nothing needs to be installed.

## Project structure

```
├── index.html     Page structure
├── styles.css     Design tokens, themes, layout and components
├── script.js      Text analysis and interactivity
└── assets/        Logos, icons, card patterns, background textures and favicon
```

## Accessibility

- Works fully with a keyboard, with a visible focus indicator on every control
- Labelled form controls; the limit warning is announced to screen readers
- Text meets WCAG AA contrast in both themes
- Lighthouse Accessibility score: 100
