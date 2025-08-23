from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:8000", wait_until="networkidle")

        # Verify Metro Modal
        page.click(".transport-card:has-text('Metro Rail')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/neo_metro_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

        # Verify Fares Modal
        page.click("nav a:has-text('Fares')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/neo_fares_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

        # Verify Plan Journey Modal
        page.click("button.btn-primary:has-text('Plan Journey')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/neo_plan_journey_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
