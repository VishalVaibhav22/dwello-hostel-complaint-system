package tests;

import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

public class StudentTest extends BaseTest {

    @Test
    public void TC_06_studentDashboardLoads() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        wait.until(ExpectedConditions.urlContains("/dashboard"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));
        Assert.assertTrue(isDisplayed(By.xpath("//h2[normalize-space()='Complaints Overview']")));
    }

    @Test
    public void TC_07_submitComplaintWithValidData() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        String title = "Water leakage " + UUID.randomUUID().toString().substring(0, 6);
        String description = "Water leakage is continuously happening in the washroom area.";
        waitForPageLoad();
        String alertText = submitComplaint(title, description, true, true);

        Assert.assertTrue(alertText.contains("Complaint submitted successfully"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));
    }

    @Test
    public void TC_08_missingComplaintDescription() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        click(By.id("raiseComplaintBtn"));
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/raise-complaint"));

        type(By.id("title"), "Fan not working " + UUID.randomUUID().toString().substring(0, 6));
        waitForClickable(By.id("submitComplaintBtn"));
        click(By.id("submitComplaintBtn"));

        Assert.assertTrue(isDisplayed(By.xpath("//p[normalize-space()='Description is required']")));
    }

    @Test
    public void TC_09_imageUploadPreview() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        click(By.id("raiseComplaintBtn"));
        wait.until(ExpectedConditions.urlContains("/raise-complaint"));
        waitForPageLoad();

        try {
            Path imagePath = Paths.get(
                    System.getProperty("user.dir"),
                    "test-data",
                    "test-image.jpg"
            );
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("input[type='file']")));
            driver.findElement(By.cssSelector("input[type='file']")).sendKeys(imagePath.toString());
            wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("img[src]")));
            Assert.assertTrue(driver.findElements(By.cssSelector("img[src]")).size() > 0);
        } catch (Exception ex) {
            Assert.fail("Image upload preview validation failed", ex);
        }
    }

    @Test
    public void TC_10_addAvailabilitySlot() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        click(By.id("raiseComplaintBtn"));
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/raise-complaint"));

        waitForClickable(By.xpath("//button[normalize-space()='Add time slot']"));
        click(By.xpath("//button[normalize-space()='Add time slot']"));

        Assert.assertTrue(isDisplayed(By.cssSelector("input[type='time']")));
        Assert.assertTrue(driver.findElements(By.cssSelector("input[type='time']")).size() >= 2);
    }

    @Test
    public void TC_11_viewComplaintsPageLoads() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        click(By.id("allComplaintsBtn"));
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/all-complaints"));

        Assert.assertTrue(isDisplayed(By.xpath("//h2[normalize-space()='All Complaints']")));
    }

    @Test
    public void TC_12_complaintDetailModalOpens() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        String title = "Window issue " + UUID.randomUUID().toString().substring(0, 6);
        submitComplaint(title, "Window is broken and needs urgent repair.", false, false);

        click(By.id("allComplaintsBtn"));
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/all-complaints"));

        waitForClickable(By.xpath("(//button[normalize-space()='View'])[1]"));
        click(By.xpath("(//button[normalize-space()='View'])[1]"));
        Assert.assertTrue(isDisplayed(By.xpath("//h2[normalize-space()='Complaint Details']")));
        closeModalIfOpen();
    }

    @Test
    public void TC_13_notificationBadgeUpdates() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        String title = "Notification check " + UUID.randomUUID().toString().substring(0, 6);
        submitComplaint(title, "Need maintenance for room light.", false, false);
        logoutStudent();

        loginAsAdmin();
        navigateAdminToAllComplaints();
        searchComplaint(title);

        By row = complaintRowByTitle(title);
        wait.until(ExpectedConditions.visibilityOfElementLocated(row));
        waitForClickable(By.xpath("//tr[.//p[normalize-space()='" + title + "']]//button[contains(normalize-space(),'Mark Progress')]")).click();
        acceptConfirmIfPresent();
        wait.until(ExpectedConditions.textToBePresentInElementLocated(row, "In Progress"));
        logoutAdmin();

        loginAsStudent(student);

        By badge = By.cssSelector("button[aria-label='Notifications'] span");
        wait.until(ExpectedConditions.visibilityOfElementLocated(badge));
        String countText = waitForVisible(badge).getText().trim();

        Assert.assertFalse(countText.isEmpty());
        Assert.assertNotEquals(countText, "0");
    }

    @Test
    public void TC_30_verifyAICategoryAndPriorityAssignment() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        openRelative("/raise-complaint");
        wait.until(ExpectedConditions.urlContains("raise-complaint"));
        waitForPageLoad();

        String complaintTitle = "AI feature check " + UUID.randomUUID().toString().substring(0, 6);

        type(By.id("title"), complaintTitle);
        type(By.id("description"), "Checking AI category and priority rendering in the UI. This text is long enough to trigger meaningful categorization.");

        waitForClickable(By.id("submitComplaintBtn"));
        click(By.id("submitComplaintBtn"));

        wait.until(ExpectedConditions.alertIsPresent());
        driver.switchTo().alert().accept();

        /*
         STUDENT VIEW
        */
        openRelative("/all-complaints");
        wait.until(ExpectedConditions.urlContains("/all-complaints"));
        waitForPageLoad();

        // On student side, find row by text since there is no search bar
        waitForClickable(By.xpath("//tr[.//p[normalize-space()='" + complaintTitle + "']]//button[normalize-space()='View']")).click();

        // Wait for the 'Category' label to be visible in the modal
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[normalize-space()='Category']")));
        Assert.assertTrue(isDisplayed(By.xpath("//label[normalize-space()='Category']")));

        closeModalIfOpen();

        logoutStudent();

        /*
         ADMIN VIEW
        */
        loginAsAdmin();
        navigateAdminToAllComplaints();
        searchComplaint(complaintTitle);

        // Wait for filtering to settle
        wait.until(ExpectedConditions.visibilityOfElementLocated(complaintRowByTitle(complaintTitle)));

        waitForClickable(By.xpath("//tr[.//p[normalize-space()='" + complaintTitle + "']]//button[normalize-space()='View']")).click();

        // Admin modal renders labels 'Category' and 'Priority'
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[normalize-space()='Category']")));
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//label[normalize-space()='Priority']")));

        Assert.assertTrue(isDisplayed(By.xpath("//label[normalize-space()='Category']")));
        Assert.assertTrue(isDisplayed(By.xpath("//label[normalize-space()='Priority']")));

        closeModalIfOpen();
        logoutAdmin();
    }
}