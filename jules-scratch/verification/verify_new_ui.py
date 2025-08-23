from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:8000", wait_until="networkidle")

        # Verify Metro Modal
        page.click("div.nav-card:has-text('Metro')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/metro_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

        # Verify Tickets Modal
        page.click("button.action-pill:has-text('Buy Tickets')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/tickets_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

        # Verify Plan Journey Modal
        page.click("button.action-pill:has-text('Plan Journey')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/plan_journey_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
