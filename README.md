# repair-site-v2

پرۆژا ماڵپەڕا چاکرنا مووبایلان (زاخو)

## دەستپێکرن

```
npm install
npm run dev
```

Piştre link-ê ku terminal nîşan dide (mînak http://localhost:5173) veke bi browser.

## بلاڤکرنا (build) بۆ Netlify

```
npm run build
```

Ev ê fişareke `dist/` çêke, tê push kirin GitHub, Netlify wê otomatîk deploy dike.

## تێبینی
Koda `src/App.tsx` xwe li ser sîstema hilanîna Claude.ai-ê (`window.storage`) hatibû nivîsîn.
`src/main.tsx` şêwazek bi `localStorage` çêkiriye da ku ev taybetmendî li derveyî Claude jî bixebite.
