package automationqa.automationdemo.tests;

import java.time.Duration;

import junit.framework.TestCase;

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class StudentComplaintTest extends TestCase {

    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = "http://localhost:5173";

    
    private final String studentEmail = "test@gmail.com";
    private final String studentPassword = "123456";

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

    public void testRaiseComplaint() throws Exception {

        // --- LOGIN AS STUDENT ---
        loginAsStudent();

        // 1. Verify dashboard
        wait.until(ExpectedConditions.urlContains("dashboard"));
        slowDown(1500);

        // 2. Click Raise Complaint
        WebElement raiseComplaintBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Complaint')]")
            )
        );
        raiseComplaintBtn.click();
        slowDown(2000);

        // 3. Verify complaint form page
        wait.until(ExpectedConditions.urlContains("complaint"));

        // 4. Fill complaint form
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.name("title")))
            .sendKeys("Water leakage in bathroom");
        slowDown(1000);

        driver.findElement(By.name("description"))
            .sendKeys("Water is leaking continuously from the ceiling in Room 101.");
        slowDown(1000);

        // 5. Submit complaint
        driver.findElement(
            By.xpath("//button[contains(text(),'Submit')]")
        ).click();
        slowDown(2000);

        // 6. Handle success alert (if present)
        try {
            wait.until(ExpectedConditions.alertIsPresent());
            Alert alert = driver.switchTo().alert();
            System.out.println("[INFO] Alert text: " + alert.getText());
            alert.accept();
        } catch (Exception e) {
            System.out.println("[INFO] No alert found, continuing");
        }

        // 7. Verify redirect to dashboard
        wait.until(ExpectedConditions.urlContains("dashboard"));
        System.out.println("[PASS] Complaint submitted successfully");
        slowDown(1500);

        // 8. Logout
        WebElement logoutBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[.//span[contains(text(),'Logout')]]")
            )
        );
        logoutBtn.click();
        slowDown(1500);

        wait.until(ExpectedConditions.urlContains("login"));
        System.out.println("[PASS] Logged out successfully");
    }

    private void loginAsStudent() throws Exception {

        driver.get(baseUrl + "/login");
        slowDown(1500);

        // Select Student role
        wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Student')]")
            )
        ).click();
        slowDown(1000);

        // Enter credentials
        driver.findElement(By.name("email"))
            .sendKeys(studentEmail);
        slowDown(500);

        driver.findElement(By.name("password"))
            .sendKeys(studentPassword);
        slowDown(500);

        // Click Sign in
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
