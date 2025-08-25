from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:3000")

    # Mobile view
    page.set_viewport_size({"width": 375, "height": 812})
    page.screenshot(path="jules-scratch/verification/mobile_view.png")

    # Desktop view
    page.set_viewport_size({"width": 1920, "height": 1080})
    page.screenshot(path="jules-scratch/verification/desktop_view.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
