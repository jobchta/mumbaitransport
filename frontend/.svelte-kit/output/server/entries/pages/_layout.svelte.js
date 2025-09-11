import { w as bind_props, x as stringify, y as slot, v as pop, t as push } from "../../chunks/index.js";
import { b as base } from "../../chunks/paths.js";
import { a as attr } from "../../chunks/attributes.js";
function Header($$payload, $$props) {
  let toggleTheme = $$props["toggleTheme"];
  $$payload.out.push(`<div class="header svelte-fjimzg"><div class="header-container svelte-fjimzg"><a${attr("href", `${stringify(base)}/`)} class="logo svelte-fjimzg"><div class="logo-icon svelte-fjimzg"><i class="fas fa-subway svelte-fjimzg"></i></div> <span class="logo-text svelte-fjimzg">Mumbai Transit</span></a> <div class="header-right svelte-fjimzg"><div class="language-selector svelte-fjimzg"><button class="language-btn svelte-fjimzg" id="language-btn"><i class="fas fa-globe svelte-fjimzg"></i> <span id="current-language" class="svelte-fjimzg">English</span> <i class="fas fa-caret-down svelte-fjimzg"></i></button> <div class="language-dropdown svelte-fjimzg" id="language-dropdown"><div class="language-option active svelte-fjimzg" data-lang="en"><span class="svelte-fjimzg">🇺🇸</span> <span class="svelte-fjimzg">English</span></div> <div class="language-option svelte-fjimzg" data-lang="hi"><span class="svelte-fjimzg">🇮🇳</span> <span class="svelte-fjimzg">हिंदी (Hindi)</span></div> <div class="language-option svelte-fjimzg" data-lang="mr"><span class="svelte-fjimzg">🇮🇳</span> <span class="svelte-fjimzg">मराठी (Marathi)</span></div></div></div> <button class="theme-toggle svelte-fjimzg" aria-label="Toggle dark mode"><i class="fas fa-sun svelte-fjimzg"></i></button></div></div></div>`);
  bind_props($$props, { toggleTheme });
}
function _layout($$payload, $$props) {
  push();
  let isDark = true;
  function toggleTheme() {
    isDark = !isDark;
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("mumbai-transport-theme", isDark ? "dark" : "light");
  }
  Header($$payload, { toggleTheme });
  $$payload.out.push(`<!----> <main><!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></main>`);
  pop();
}
export {
  _layout as default
};
