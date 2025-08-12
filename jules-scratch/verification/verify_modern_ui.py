import os
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Get the absolute path to the index.html file
    file_path = os.path.abspath("index.html")

    # Navigate to the local HTML file
    page.goto(f"file://{file_path}")

    # Wait for the bottom sheet to be visible as a sign the new UI has loaded
    bottom_sheet = page.locator("#bottomSheet")
    expect(bottom_sheet).to_be_visible(timeout=10000) # Increased timeout for safety

    # Give the map a moment to initialize
    page.wait_for_timeout(2000)

    # Take a screenshot of the new UI
    screenshot_path = "jules-scratch/verification/modern_ui_verification.png"
    page.screenshot(path=screenshot_path)

    browser.close()
    print(f"Screenshot saved to {screenshot_path}")

with sync_playwright() as playwright:
    run(playwright)
