const SAMPLE = "Design is the silent ambassador of your brand. Simplicity is key to effective communication, creating clarity in every interaction. A great design transforms complex ideas into elegant solutions, making them easy to understand. It blends aesthetics and functionality seamlessly.";
const stats = ($) => [$("#char-count").textContent, $("#word-count").textContent, $("#sentence-count").textContent, $("#reading-time").textContent];
const CHECKS = [
  ["initial state", ({ $ }) => [stats($), ["00", "00", "00", "0 minute"]]],
  ["typing sample", ({ $, type }) => (type(SAMPLE), [stats($), ["278", "39", "04", "<1 minute"]])],
  ["exclude spaces", ({ $ }) => ($("#exclude-spaces").click(), [[$("#char-label").textContent, $("#char-count").textContent], ["Total Characters (no space)", "240"]])],
  ["include spaces again", ({ $ }) => ($("#exclude-spaces").click(), [[$("#char-label").textContent, $("#char-count").textContent], ["Total Characters", "278"]])],
  ["clearing text", ({ $, type }) => (type(""), [stats($), ["00", "00", "00", "0 minute"]])],
];
const fire = (w, el) => el.dispatchEvent(new w.InputEvent("input", { bubbles: true }));
const setLimit = (w, $, v) => { $("#limit-input").value = v; fire(w, $("#limit-input")); };
// Simulates real typing/pasting, which (unlike setting .value) is constrained by maxlength
const userType = (d, $, text) => { $("#text-input").focus(); d.execCommand("insertText", false, text); };
const limitState = ($) => ({
  inputShown: !$("#limit-input").hidden,
  maxLength: $("#text-input").maxLength,
  msgShown: !$("#limit-message").hidden,
  invalid: $("#text-input").getAttribute("aria-invalid"),
  describedBy: $("#text-input").getAttribute("aria-describedby"),
});
CHECKS.push(
  ["limit on: input shown, maxlength 300", ({ $, type }) => (type(SAMPLE), $("#limit-toggle").click(), [limitState($), { inputShown: true, maxLength: 300, msgShown: false, invalid: "false", describedBy: null }])],
  ["limit equals length: 'has reached'", ({ w, $ }) => (setLimit(w, $, "278"), [[limitState($), $("#limit-text").textContent], [{ inputShown: true, maxLength: 278, msgShown: true, invalid: "true", describedBy: "limit-message" }, "Limit reached! Your text has reached 278 characters."]])],
  ["typing at the limit is blocked", ({ d, $ }) => (userType(d, $, "xyz"), [$("#text-input").value.length, 278])],
  ["lower limit keeps text: 'exceeds'", ({ w, $ }) => (setLimit(w, $, "200"), [[$("#text-input").value.length, $("#limit-text").textContent], [278, "Limit reached! Your text exceeds 200 characters."]])],
  ["paste is cut at the limit", ({ d, w, $, type }) => (type(""), setLimit(w, $, "10"), userType(d, $, "Hello world, this is long"), [[$("#text-input").value, $("#char-count").textContent, !$("#limit-message").hidden], ["Hello worl", "10", true]])],
  ["empty limit = no limit", ({ w, $ }) => (setLimit(w, $, ""), [[limitState($).maxLength, limitState($).msgShown], [-1, false]])],
  ["limit off: all cleared", ({ w, $ }) => (setLimit(w, $, "5"), $("#limit-toggle").click(), [limitState($), { inputShown: false, maxLength: -1, msgShown: false, invalid: "false", describedBy: null }])],
);
const rows = ($) => [...$("#density-list").children].map((li) => `${li.querySelector(".density-letter").textContent} ${li.querySelector(".density-value").textContent}`);
const densityUi = ($) => ({ empty: !$("#density-empty").hidden, toggle: !$("#density-toggle").hidden, label: $("#density-toggle span").textContent, expanded: $("#density-toggle").getAttribute("aria-expanded"), rows: $("#density-list").children.length });
CHECKS.push(
  ["empty text: empty message, no rows", ({ $, type }) => (type(""), [densityUi($), { empty: true, toggle: false, label: "See more", expanded: "false", rows: 0 }])],
  ["sample: top 5 rows", ({ $, type }) => (type(SAMPLE), [rows($), ["E 25 (10.68%)", "I 24 (10.26%)", "T 23 (9.83%)", "N 21 (8.97%)", "S 21 (8.97%)"]])],
  ["sample: toggle shown, collapsed", ({ $ }) => [densityUi($), { empty: false, toggle: true, label: "See more", expanded: "false", rows: 5 }]],
  ["bar width = percent", ({ $ }) => [$("#density-list .density-bar span").style.getPropertyValue("--percent").slice(0, 7), "10.6837"]],
  ["see more: all letters", ({ $ }) => ($("#density-toggle").click(), [densityUi($), { empty: false, toggle: true, label: "See less", expanded: "true", rows: 22 }])],
  ["typing keeps it expanded", ({ $, type }) => (type(SAMPLE + " zzz"), [densityUi($).rows, 23])],
  ["see less: back to 5", ({ $ }) => ($("#density-toggle").click(), [densityUi($), { empty: false, toggle: true, label: "See more", expanded: "false", rows: 5 }])],
  ["≤5 letters: no toggle", ({ $, type }) => (type("abc"), [densityUi($), { empty: false, toggle: false, label: "See more", expanded: "false", rows: 3 }])],
  ["markup in text stays text", ({ $, type }) => (type("<b>x</b>"), [[$("#density-list b"), rows($)], [null, ["B 2 (66.67%)", "X 1 (33.33%)"]]])],
);
const freshTheme = () => new Promise((resolve) => {
  const g = Object.assign(document.createElement("iframe"), { src: "../index.html" });
  g.onload = () => { resolve(g.contentDocument.documentElement.dataset.theme); g.remove(); };
  document.body.append(g);
});
const themeUi = ($, d) => [d.documentElement.dataset.theme, $(".theme-toggle").getAttribute("aria-label")];
CHECKS.push(
  ["theme label on load (system dark)", ({ d, $, w }) => (w.localStorage.removeItem("character-counter:theme"), [themeUi($, d), ["dark", "Switch to light theme"]])],
  ["toggle to light", ({ d, $, w }) => ($(".theme-toggle").click(), [[...themeUi($, d), w.localStorage.getItem("character-counter:theme")], ["light", "Switch to dark theme", "light"]])],
  ["light persists on reload", async () => [await freshTheme(), "light"]],
  ["toggle back to dark", ({ d, $, w }) => ($(".theme-toggle").click(), [[...themeUi($, d), w.localStorage.getItem("character-counter:theme")], ["dark", "Switch to light theme", "dark"]])],
  ["dark persists on reload", async ({ w }) => { const t = await freshTheme(); w.localStorage.removeItem("character-counter:theme"); return [t, "dark"]; }],
);
CHECKS.push(
  ["60k-char paste renders under 50ms", ({ $, type, w }) => {
    const big = SAMPLE.repeat(216); // ~60,000 characters
    const t = w.performance.now();
    type(big);
    const ms = w.performance.now() - t;
    console.log(ms);
    return [[ms < 50, $("#char-count").textContent], [true, String(big.length)]];
  }],
  ["average keystroke render (20x) under 2ms", ({ $, type, w }) => {
    let text = "";
    const t = w.performance.now();
    for (let i = 0; i < 20; i++) type((text += SAMPLE.slice(i * 10, i * 10 + 10)));
    return [(w.performance.now() - t) / 20 < 2, true];
  }],
);
CHECKS.push(
  ["empty density list is display:none", ({ $, type, w }) => (type(""), [w.getComputedStyle($("#density-list")).display, "none"])],
  ["alert not rewritten while unchanged; cleared when off", ({ $, type, w }) => {
    $("#limit-toggle").click();
    type(SAMPLE);
    setLimit(w, $, "200"); // shows "exceeds 200"
    let mutations = 0;
    const obs = new w.MutationObserver((list) => (mutations += list.length));
    obs.observe($("#limit-message"), { subtree: true, childList: true, characterData: true });
    for (let i = 1; i <= 5; i++) type(SAMPLE.slice(0, -i)); // user deleting, still over the limit
    const records = obs.takeRecords().length + mutations;
    obs.disconnect();
    const shown = $("#limit-text").textContent;
    $("#limit-toggle").click();
    return [[records, shown, $("#limit-text").textContent], [0, "Limit reached! Your text exceeds 200 characters.", ""]];
  }],
);
