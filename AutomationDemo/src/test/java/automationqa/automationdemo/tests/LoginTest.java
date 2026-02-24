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

public class LoginTest extends TestCase {

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

    public void testStudentLogin() throws Exception {

        // 1. Open landing page
        driver.get(baseUrl);
        slowDown(2000);

        // 2. Click Sign In
        WebElement signInBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Sign')]")
            )
        );
        signInBtn.click();
        slowDown(2000);

        // 3. Verify login page
        assertTrue(driver.getCurrentUrl().contains("login"));

        // 4. Select Student role
        WebElement studentBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Student')]")
            )
        );
        studentBtn.click();
        slowDown(1000);

        // 5. Enter credentials
        driver.findElement(By.name("email"))
              .sendKeys(studentEmail);
        slowDown(1000);

        driver.findElement(By.name("password"))
              .sendKeys(studentPassword);
        slowDown(1000);

        // 6. Click Sign In
        driver.findElement(By.xpath("//button[contains(text(),'Sign')]"))
              .click();
        slowDown(2500);

        // 7. Verify dashboard
        assertTrue(driver.getCurrentUrl().contains("dashboard"));
        System.out.println("[PASS] Student logged in successfully");

        // 8. Verify dashboard element
        WebElement complaintBtn = wait.until(
            ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(text(),'Complaint')]")
            )
        );
        assertTrue(complaintBtn.isDisplayed());
        System.out.println("[PASS] Student dashboard verified");
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
