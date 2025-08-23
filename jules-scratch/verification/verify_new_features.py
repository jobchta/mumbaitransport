from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:8000", wait_until="networkidle")

        # Verify Metro Tab
        metro_tab_button = page.locator('label[for="metro-radio"]')
        metro_tab_button.click()
        page.wait_for_selector("#metro-tab .metro-lines-container")
        page.screenshot(path="jules-scratch/verification/metro_tab.png")

        # Verify Tickets Tab
        tickets_tab_button = page.locator('label[for="tickets-radio"]')
        tickets_tab_button.click()
        page.wait_for_selector("#tickets-tab .whatsapp-ticketing")
        page.screenshot(path="jules-scratch/verification/tickets_tab.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
