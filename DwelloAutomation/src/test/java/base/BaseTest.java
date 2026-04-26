package base;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import utils.ScreenshotUtil;

public class BaseTest {

    protected static final String BASE_URL = "http://localhost:5173";
    protected static final String DEFAULT_ADMIN_EMAIL = "admin@thapar.edu";
    protected static final String DEFAULT_ADMIN_PASSWORD = "admin@123";

    protected WebDriver driver;
    protected WebDriverWait wait;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--start-maximized");
        options.addArguments("--remote-allow-origins=*");

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(30));

        openRelative("/login");
        waitForVisible(By.id("loginEmail"));
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown(ITestResult result) {
        if (result != null && !result.isSuccess()) {
            ScreenshotUtil.captureScreenshot(driver, result.getName());
        }

        if (driver != null) {
            driver.quit();
        }
    }

    protected void openRelative(String path) {
        driver.get(BASE_URL + path);
        waitForPageLoad();
    }

    protected void waitForPageLoad() {
        wait.until(driver -> "complete".equals(
                ((JavascriptExecutor) driver).executeScript("return document.readyState")));
    }

    protected WebElement waitForPresence(By locator) {
        return wait.until(ExpectedConditions.presenceOfElementLocated(locator));
    }

    protected WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected WebElement waitForClickable(By locator) {
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    protected void type(By locator, String value) {
        WebElement element = waitForVisible(locator);
        element.clear();
        element.sendKeys(value);
    }

    protected void click(By locator) {
        waitForClickable(locator).click();
    }

    protected boolean isDisplayed(By locator) {
        try {
            return waitForVisible(locator).isDisplayed();
        } catch (TimeoutException ex) {
            return false;
        }
    }

    protected void loginAsAdmin() {
        login(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD, "admin");
        wait.until(ExpectedConditions.urlContains("/admin/dashboard"));
    }

    protected void loginAsStudent(StudentAccount student) {
        login(student.email, student.password, "student");
        wait.until(ExpectedConditions.urlContains("/dashboard"));
    }

    protected void login(String email, String password, String role) {
        openRelative("/login");
        waitForVisible(By.id("loginEmail"));

        if ("admin".equalsIgnoreCase(role)) {
            click(By.xpath("//button[normalize-space()='Admin']"));
        } else {
            click(By.xpath("//button[normalize-space()='Student']"));
        }

        type(By.id("loginEmail"), email);
        type(By.id("loginPassword"), password);
        click(By.id("loginBtn"));
    }

    protected StudentAccount registerNewStudent() {
        StudentAccount student = StudentAccount.create();

        openRelative("/register");
        waitForVisible(By.id("universitySelect"));

        Select university = new Select(waitForVisible(By.id("universitySelect")));
        university.selectByVisibleText("Thapar Institute of Engineering and Technology");

        type(By.id("fullNameInput"), student.fullName);
        type(By.id("rollNumberInput"), student.rollNumber);
        type(By.id("emailInput"), student.email);
        type(By.id("passwordInput"), student.password);

        Select hostel = new Select(waitForVisible(By.id("hostelInput")));
        hostel.selectByVisibleText("Hostel A");

        type(By.id("roomInput"), student.roomNumber);
        click(By.id("signupBtn"));

        wait.until(ExpectedConditions.or(
                ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"), "Registration successful"),
                ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"), "already exists")
        ));

        openRelative("/login");
        waitForVisible(By.id("loginEmail"));

        return student;
    }

    protected void logoutStudent() {
        try {
            click(By.id("logoutBtn"));
        } catch (TimeoutException ex) {
            click(By.cssSelector("button[aria-label='Account menu']"));
            click(By.xpath("//button[.//span[normalize-space()='Logout']]"));
        }
        wait.until(ExpectedConditions.urlContains("/login"));
    }

    protected void logoutAdmin() {
        try {
            click(By.cssSelector("button[title='Logout']"));
        } catch (TimeoutException ex) {
            click(By.cssSelector("button[aria-label='Account menu']"));
            click(By.xpath("//button[.//span[normalize-space()='Logout']]"));
        }
        wait.until(ExpectedConditions.urlContains("/login"));
    }

    protected String submitComplaint(String title, String description, boolean withImage, boolean withSlot) {
        click(By.id("raiseComplaintBtn"));
        wait.until(ExpectedConditions.urlContains("/raise-complaint"));
        waitForPageLoad();

        type(By.id("title"), title);
        type(By.id("description"), description);

        if (withImage) {
            Path imagePath = Path.of(
                    System.getProperty("user.dir"),
                    "test-data",
                    "test-image.jpg"
            );
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[type='file']")));
            driver.findElement(By.cssSelector("input[type='file']")).sendKeys(imagePath.toString());
        }

        if (withSlot) {
            click(By.xpath("//button[normalize-space()='Add time slot']"));
            waitForVisible(By.cssSelector("select[class*='rounded-lg']"));
        }

        waitForClickable(By.id("submitComplaintBtn"));
        click(By.id("submitComplaintBtn"));

        String alertText = "";
        try {
            wait.until(ExpectedConditions.alertIsPresent());
            Alert alert = driver.switchTo().alert();
            alertText = alert.getText();
            alert.accept();
        } catch (Exception ignored) {
        }

        wait.until(ExpectedConditions.urlContains("/dashboard"));
        return alertText;
    }

    protected String acceptAlertIfPresent() {
        try {
            Alert alert = new WebDriverWait(driver, Duration.ofSeconds(5))
                    .until(ExpectedConditions.alertIsPresent());
            String text = alert.getText();
            alert.accept();
            return text;
        } catch (TimeoutException | NoAlertPresentException ex) {
            return "";
        }
    }

    protected void acceptConfirmIfPresent() {
        acceptAlertIfPresent();
    }

    protected void navigateAdminToAllComplaints() {
        click(By.cssSelector("button[title='All Complaints']"));
        wait.until(ExpectedConditions.urlContains("/admin/all-complaints"));
    }

    protected void navigateAdminToAnnouncements() {
        click(By.cssSelector("button[title='Announcements']"));
        wait.until(ExpectedConditions.urlContains("tab=announcements"));
    }

    protected void navigateAdminToStudents() {
        click(By.cssSelector("button[title='Students']"));
        wait.until(ExpectedConditions.urlContains("/admin/students"));
    }

    protected void navigateAdminToAnalytics() {
        click(By.cssSelector("button[title='Analytics']"));
        wait.until(ExpectedConditions.urlContains("/admin/analytics"));
    }

    protected void closeModalIfOpen() {
        try {
            // Attempt to click the 'Close' button in the footer
            WebElement closeBtn = driver.findElement(By.xpath("//button[normalize-space()='Close']"));
            if (closeBtn.isDisplayed()) {
                closeBtn.click();
            }
        } catch (Exception e1) {
            try {
                // Attempt to click the 'X' (svg) close button in top right
                WebElement xBtn = driver.findElement(By.xpath("//button[./svg and (contains(@class,'text-gray-400') or @aria-label='Close')]"));
                if (xBtn.isDisplayed()) {
                    xBtn.click();
                }
            } catch (Exception e2) {
                // No modal or close button found
                return;
            }
        }
        // Wait for backdrop to disappear
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//div[contains(@class, 'bg-opacity-50')]")));
        } catch (Exception ignored) {}
    }

    protected void searchComplaint(String query) {
        type(By.cssSelector("input[placeholder*='Search by title']"), query);
    }

    protected Path createTemporaryPng() throws IOException {
        byte[] tinyPng = Base64.getDecoder().decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XnM0AAAAASUVORK5CYII="
        );
        Path tempImage = Files.createTempFile("complaint-upload-", ".png");
        Files.write(tempImage, tinyPng);
        tempImage.toFile().deleteOnExit();
        return tempImage;
    }

    protected By complaintRowByTitle(String title) {
        return By.xpath("//tr[.//p[normalize-space()='" + title + "']]");
    }

    protected By announcementCardByTitle(String title) {
        return By.xpath("//h3[normalize-space()='" + title + "']/ancestor::div[contains(@class,'rounded-2xl')]");
    }

    protected boolean isPresent(By locator) {
        try {
            driver.findElement(locator);
            return true;
        } catch (NoSuchElementException ex) {
            return false;
        }
    }

    public static class StudentAccount {
        public final String fullName;
        public final String email;
        public final String password;
        public final String rollNumber;
        public final String roomNumber;

        private StudentAccount(String fullName, String email, String password, String rollNumber, String roomNumber) {
            this.fullName = fullName;
            this.email = email;
            this.password = password;
            this.rollNumber = rollNumber;
            this.roomNumber = roomNumber;
        }

        public static StudentAccount create() {
            String token = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
            String fullName = "Auto Student " + token;
            String email = "autostudent_" + token + "@example.com";
            String password = "Test@123A";
            String rollNumber = String.valueOf(System.currentTimeMillis()).substring(4, 13);
            String roomNumber = "10" + token.substring(0, 1);
            return new StudentAccount(fullName, email, password, rollNumber, roomNumber);
        }
    }
}
