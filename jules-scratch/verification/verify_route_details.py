import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the local HTML file
    page.goto("file:///app/journey-planner.html")

    # Mock the Google Maps API to return a predictable response
    # This avoids a real network call and makes the test reliable
    page.route(re.compile(".*"), lambda route: route.abort()) # Abort all network requests

    # We can't easily mock the google maps API here, so we will just check the UI elements
    # and not the actual route finding logic.

    # Fill in the form
    page.get_by_placeholder("From: Current location").fill("Churchgate")
    page.get_by_placeholder("To: Enter destination").fill("Andheri")

    # Click the find routes button
    page.get_by_role("button", name="Find Best Routes").click()

    # Wait for the results to appear. A real app would show a loading spinner.
    # We will just wait for the first route card to be visible.
    # Since we can't mock the API easily, we'll just check if the section is visible
    # and then manually add some html to test the UI.

    # For verification, let's inject a sample route card and see if it behaves as expected.
    page.evaluate("""() => {
        const routesList = document.getElementById('routesList');
        const card = document.createElement('div');
        card.className = 'route-card';
        card.id = 'test-card';
        card.innerHTML = `
          <div class="route-header">
            <div class="route-time">35 min</div>
            <div class="route-cost">₹25</div>
          </div>
          <div class="route-steps">
            <div class="step-icon step-walk"><i class="fa-solid fa-person-walking"></i></div>
            <i class="fa-solid fa-chevron-right step-separator"></i>
            <div class="step-icon step-train"><i class="fa-solid fa-train"></i></div>
          </div>
          <div class="route-details">Direct route • 10:30 AM - 11:05 AM</div>
          <div class="detailed-steps" style="display: none;">
            <ul>
                <li class="detailed-step-item">
                    <i class="fa-solid fa-person-walking"></i>
                    <span>Walk to Churchgate Station</span>
                    <strong class="step-duration">5 min</strong>
                </li>
                <li class="detailed-step-item">
                    <i class="fa-solid fa-train"></i>
                    <span>Train to Andheri</span>
                    <strong class="step-duration">30 min</strong>
                </li>
            </ul>
          </div>
        `;
        // Manually add the event listener since it's not part of the innerHTML
        card.onclick = () => selectRoute(card, {}); // Pass empty route object as it's not used in the function
        routesList.innerHTML = '';
        routesList.appendChild(card);
    }""")

    # Now click the card and check if the details appear
    route_card = page.locator("#test-card")
    detailed_steps = route_card.locator(".detailed-steps")

    # Expect the detailed steps to be hidden initially
    expect(detailed_steps).to_be_hidden()

    # Click the route card
    route_card.click()

    # Expect the detailed steps to be visible now
    expect(detailed_steps).to_be_visible()

    # Expect the card to have the active class
    expect(route_card).to_have_class(re.compile(r'active'))

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
