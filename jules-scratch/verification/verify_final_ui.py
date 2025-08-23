from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:8000", wait_until="networkidle")

        # Verify Metro Modal
        page.click(".glass-card:has-text('Hyper Metro')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/final_metro_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

        # Verify Tickets Modal
        page.click("nav a:has-text('Tickets')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/final_tickets_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

        # Verify Plan Journey Modal
        page.click("button.btn-primary:has-text('Start Journey')")
        page.wait_for_selector(".modal-overlay.show")
        page.screenshot(path="jules-scratch/verification/final_plan_journey_modal.png")
        page.click(".modal-close-btn")
        page.wait_for_selector(".modal-overlay:not(.show)")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
