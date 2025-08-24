from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use a mobile viewport
        context = browser.new_context(**p.devices['iPhone 11'])
        page = context.new_page()

        try:
            # Go to the page
            page.goto("http://localhost:3000")

            # Wait for the icon bar to be visible
            page.wait_for_selector('.mobile-icons-bar', timeout=10000) # 10 seconds

            # Take a screenshot
            page.screenshot(path="jules-scratch/verification/verification.png")

            print("Screenshot taken successfully.")
        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
