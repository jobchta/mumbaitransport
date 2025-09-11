import { F as ensure_array_like, v as pop, t as push } from "../../chunks/index.js";
import { a as attr } from "../../chunks/attributes.js";
import { e as escape_html } from "../../chunks/escaping.js";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
function Plan($$payload, $$props) {
  push();
  let from = "";
  let to = "";
  let routes = [];
  let loading = false;
  $$payload.out.push(`<div class="plan-tab svelte-16405g6"><div class="transport-modes svelte-16405g6"><button class="micro-btn active svelte-16405g6" data-mode="all"><i class="fas fa-shuffle"></i> <span>All</span></button> <button class="micro-btn svelte-16405g6" data-mode="metro"><i class="fas fa-train"></i> <span>Metro</span></button> <button class="micro-btn svelte-16405g6" data-mode="bus"><i class="fas fa-bus"></i> <span>Bus</span></button> <button class="micro-btn svelte-16405g6" data-mode="train"><i class="fas fa-train"></i> <span>Train</span></button></div> <form><div class="form-group svelte-16405g6"><label for="from">From</label> <div class="input-wrapper svelte-16405g6"><i class="fas fa-map-pin input-icon svelte-16405g6"></i> <input type="text" id="from"${attr("value", from)} placeholder="Current location or address"/></div></div> <div class="form-group svelte-16405g6"><label for="to">To</label> <div class="input-wrapper svelte-16405g6"><i class="fas fa-map-pin input-icon svelte-16405g6"></i> <input type="text" id="to"${attr("value", to)} placeholder="Destination"/> <button type="button" class="location-swap svelte-16405g6" aria-label="Swap locations"><i class="fas fa-arrows-up-down"></i></button></div></div> <button type="submit" class="btn btn-primary btn-full btn-large svelte-16405g6"${attr("disabled", loading, true)}><i class="fas fa-route"></i> `);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<span>Find Routes</span>`);
  }
  $$payload.out.push(`<!--]--></button></form> `);
  if (routes.length > 0) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(routes);
    $$payload.out.push(`<div class="routes-section svelte-16405g6"><h3 class="svelte-16405g6">Available Routes</h3> <!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let route = each_array[$$index];
      $$payload.out.push(`<div class="route-card svelte-16405g6"><div class="route-info svelte-16405g6"><h4 class="svelte-16405g6">${escape_html(route.summary)}</h4> <p class="svelte-16405g6">Duration: ${escape_html(route.legs[0].duration.text)}</p> <p class="svelte-16405g6">Distance: ${escape_html(route.legs[0].distance.text)}</p></div></div>`);
    }
    $$payload.out.push(`<!--]--></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div id="map" class="map-container svelte-16405g6"></div></div>`);
  pop();
}
const firebaseConfig = {
  apiKey: "AIzaSyDUMMY_API_KEY",
  // Replace with your API key
  authDomain: "mumbai-transport.firebaseapp.com",
  // Replace with your auth domain
  projectId: "mumbai-transport",
  // Replace with your project ID
  storageBucket: "mumbai-transport.appspot.com",
  // Replace with your storage bucket
  messagingSenderId: "123456789",
  // Replace with your sender ID
  appId: "1:123456789:web:DUMMY_APP_ID"
  // Replace with your app ID
};
const app = initializeApp(firebaseConfig);
getAuth(app);
getFirestore(app);
getFunctions(app);
function _page($$payload, $$props) {
  push();
  let commutes = [];
  let newCommuteName = "";
  const each_array = ensure_array_like(commutes);
  $$payload.out.push(`<div class="hero svelte-1nvj1ng"><h1 class="hero-title">Navigate Mumbai</h1> <p class="hero-subtitle">Plan your journeys with station-based metro fares and reliable transit routes across Mumbai</p> <div class="cta-buttons svelte-1nvj1ng"><button class="cta-button cta-primary svelte-1nvj1ng"><i class="fas fa-route"></i> Plan Your Journey</button> <button class="cta-button cta-secondary svelte-1nvj1ng"><i class="fas fa-map-marked-alt"></i> View Network Map</button> <button class="cta-button cta-secondary svelte-1nvj1ng"><i class="fas fa-bookmark"></i> Bookmark This Page</button></div></div> <div class="my-commutes svelte-1nvj1ng"><h2 class="svelte-1nvj1ng">My Commutes</h2> <div class="commute-form svelte-1nvj1ng"><input type="text"${attr("value", newCommuteName)} placeholder="Commute name" class="svelte-1nvj1ng"/> <button class="svelte-1nvj1ng">Save Commute</button></div> <div class="commutes-list svelte-1nvj1ng"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let commute = each_array[$$index];
    $$payload.out.push(`<div class="commute-item svelte-1nvj1ng"><h3 class="svelte-1nvj1ng">${escape_html(commute.name)}</h3> <p class="svelte-1nvj1ng">${escape_html(commute.from)} → ${escape_html(commute.to)}</p></div>`);
  }
  $$payload.out.push(`<!--]--></div></div> `);
  Plan($$payload);
  $$payload.out.push(`<!---->`);
  pop();
}
export {
  _page as default
};
