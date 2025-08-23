from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:8000", wait_until="networkidle")

        metro_tab_button = page.locator('label[for="metro-radio"]')
        metro_tab_button.click()

        page.wait_for_timeout(1000) # Wait for styles to apply

        # Get the HTML of the page
        html = page.content()
        print("Page HTML:")
        print(html)

        # Get the computed style of the container
        container = page.locator("#metro-tab-container")
        style = container.evaluate("element => window.getComputedStyle(element).display")
        print(f"Computed display for #metro-tab-container: {style}")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
