package automationqa.automationdemo.tests;

import java.time.Duration;

import junit.framework.TestCase;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class AdminDashboardTest extends TestCase {

    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = "http://localhost:5173";

    // Admin credentials
    private final String adminEmail = "admin@thapar.edu";
    private final String adminPassword = "admin@123";

    @Override
    protected void setUp() throws Exception {

        System.setProperty(
            "webdriver.chrome.driver",
            "C:\\browserDrivers\\chromedriver.exe"
        );

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--remote-allow-origins=*");

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    public void testAdminWorkflow() throws Exception {

        // 1. Login as Admin
        loginAsAdmin();

        // 2. Verify admin dashboard
        wait.until(ExpectedConditions.urlContains("admin"));
        slowDown(2000);

        // 3. Click first View button
        WebElement viewBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("(//button[contains(text(),'View')])[1]")
            )
        );
        viewBtn.click();
        slowDown(2000);

        // 4. Verify modal opens
        wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h2[contains(text(),'Complaint')]")
            )
        );
        System.out.println("[PASS] Complaint details modal opened");

        // 5. Click Close button in modal
        WebElement closeBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Close')]")
            )
        );
        closeBtn.click();
        slowDown(2000);
        System.out.println("[PASS] Modal closed");

        // 6. Click Mark Progress (button next to View)
        WebElement markProgressBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("(//button[contains(text(),'Progress')])[1]")
            )
        );
        markProgressBtn.click();
        slowDown(2000);
        System.out.println("[PASS] Clicked Mark Progress");

        // 7. Accept confirmation alert (if any)
        try {
            wait.until(ExpectedConditions.alertIsPresent());
            driver.switchTo().alert().accept();
            System.out.println("[INFO] Confirmation alert accepted");
        } catch (Exception e) {
            System.out.println("[INFO] No confirmation alert");
        }

        slowDown(2000);

        // 8. Logout
        WebElement logoutBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[.//span[contains(text(),'Logout')]]")
            )
        );
        logoutBtn.click();
        slowDown(1500);

        wait.until(ExpectedConditions.urlContains("login"));
        System.out.println("[PASS] Admin logged out successfully");
    }

    private void loginAsAdmin() throws Exception {

        driver.get(baseUrl + "/login");
        slowDown(1500);

        // Select Admin role
        wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Admin')]")
            )
        ).click();
        slowDown(1000);

        // Enter credentials
        driver.findElement(By.name("email"))
            .sendKeys(adminEmail);
        slowDown(500);

        driver.findElement(By.name("password"))
            .sendKeys(adminPassword);
        slowDown(500);

        // Sign in
        driver.findElement(
            By.xpath("//button[contains(text(),'Sign')]")
        ).click();
        slowDown(2500);
    }

    @Override
    protected void tearDown() throws Exception {
        if (driver != null) {
            slowDown(1500);
            driver.quit();
        }
    }

    private void slowDown(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
