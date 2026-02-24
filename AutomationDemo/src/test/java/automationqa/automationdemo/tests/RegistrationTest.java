package automationqa.automationdemo.tests;

import java.time.Duration;

import junit.framework.TestCase;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

public class RegistrationTest extends TestCase {

    private WebDriver driver;
    private WebDriverWait wait;
    private final String baseUrl = "http://localhost:5173";

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

    public void testStudentRegistration() throws Exception {

        // 1. Open landing page
        driver.get(baseUrl);
        slowDown(2000);

        // 2. Click Get Started
        WebElement getStartedBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Get Started')]")
            )
        );
        getStartedBtn.click();
        slowDown(2000);

        // 3. Verify registration page
        assertTrue(driver.getCurrentUrl().contains("register"));

        // 4. Select University
        WebElement universityDropdown = wait.until(
            ExpectedConditions.visibilityOfElementLocated(By.id("universitySelect"))
        );
        new Select(universityDropdown)
            .selectByVisibleText("Thapar Institute of Engineering and Technology");
        slowDown(1000);

        // 5. Full Name
        driver.findElement(By.name("fullName"))
            .sendKeys("Test Student");
        slowDown(1000);

        // 6. Unique Email
        String email = "teststudent" + System.currentTimeMillis() + "@example.com";
        driver.findElement(By.name("email"))
            .sendKeys(email);
        System.out.println("[INFO] Registered email: " + email);
        slowDown(1000);

        // 7. Password
        driver.findElement(By.name("password"))
            .sendKeys("Test@123");
        slowDown(1000);

        // 8. Select Hostel
        WebElement hostelDropdown = driver.findElement(By.name("hostel"));
        new Select(hostelDropdown)
            .selectByVisibleText("Hostel A");
        slowDown(1000);

        // 9. Room Number
        driver.findElement(By.name("roomNumber"))
            .sendKeys("101");
        slowDown(1000);

        // 10. Submit registration
        driver.findElement(By.cssSelector("button[type='submit']")).click();
        slowDown(2500);

        // 11. Verify redirect to login
        assertTrue(driver.getCurrentUrl().contains("login"));
        System.out.println("[PASS] Registration completed successfully");
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
