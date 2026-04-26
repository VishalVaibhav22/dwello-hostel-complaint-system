package tests;

import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.UUID;

public class AdminTest extends BaseTest {

    @Test
    public void TC_14_adminDashboardLoads() {
        loginAsAdmin();

        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/dashboard"));
        Assert.assertTrue(isDisplayed(By.xpath("//h3[normalize-space()='Recent Complaints']")));
    }

    @Test
    public void TC_15_viewAllComplaints() {
        loginAsAdmin();
        navigateAdminToAllComplaints();

        Assert.assertTrue(isDisplayed(By.xpath("//input[contains(@placeholder,'Search by title')]")));
        Assert.assertTrue(isDisplayed(By.xpath("//th[normalize-space()='Title']")));
    }

    @Test
    public void TC_16_filterComplaintsByStatus() {
        ComplaintSeed seed = createComplaintSeedAndOpenAdminAllComplaints();

        searchComplaint(seed.title);
        waitForVisible(complaintRowByTitle(seed.title));

        driver.findElement(By.xpath("(//select[.//option[normalize-space()='All Statuses']])[1]")).sendKeys("Open");
        Assert.assertTrue(waitForVisible(complaintRowByTitle(seed.title)).getText().contains("Open"));
    }

    @Test
    public void TC_17_searchComplaintByStudentName() {
        ComplaintSeed seed = createComplaintSeedAndOpenAdminAllComplaints();

        searchComplaint(seed.student.fullName);
        By row = complaintRowByTitle(seed.title);
        waitForVisible(row);

        Assert.assertTrue(driver.findElement(row).getText().contains(seed.student.fullName));
    }

    @Test
    public void TC_18_markComplaintInProgress() {
        ComplaintSeed seed = createComplaintSeedAndOpenAdminAllComplaints();
        searchComplaint(seed.title);

        By row = complaintRowByTitle(seed.title);
        waitForVisible(row);

        driver.findElement(By.xpath("//tr[.//p[normalize-space()='" + seed.title + "']]//button[contains(normalize-space(),'Mark Progress')]")).click();
        acceptConfirmIfPresent();

        wait.until(ExpectedConditions.textToBePresentInElementLocated(row, "In Progress"));
        Assert.assertTrue(driver.findElement(row).getText().contains("In Progress"));
    }

    @Test
    public void TC_19_resolveComplaint() {
        ComplaintSeed seed = createComplaintSeedAndOpenAdminAllComplaints();
        searchComplaint(seed.title);

        By row = complaintRowByTitle(seed.title);
        waitForVisible(row);

        driver.findElement(By.xpath("//tr[.//p[normalize-space()='" + seed.title + "']]//button[contains(normalize-space(),'Mark Progress')]")).click();
        acceptConfirmIfPresent();
        wait.until(ExpectedConditions.textToBePresentInElementLocated(row, "In Progress"));

        driver.findElement(By.xpath("//tr[.//p[normalize-space()='" + seed.title + "']]//button[contains(normalize-space(),'Resolve')]")).click();
        acceptConfirmIfPresent();

        wait.until(ExpectedConditions.textToBePresentInElementLocated(row, "Resolved"));
        Assert.assertTrue(driver.findElement(row).getText().contains("Resolved"));
    }

    @Test
    public void TC_20_rejectComplaintWithReason() {
        ComplaintSeed seed = createComplaintSeedAndOpenAdminAllComplaints();
        searchComplaint(seed.title);

        driver.findElement(By.xpath("//tr[.//p[normalize-space()='" + seed.title + "']]//button[normalize-space()='View']")).click();
        waitForVisible(By.xpath("//h2[normalize-space()='Complaint Details']"));

        click(By.xpath("//button[normalize-space()='Reject']"));
        waitForVisible(By.xpath("//h2[normalize-space()='Reject Complaint']"));

        type(By.xpath("//h2[normalize-space()='Reject Complaint']/ancestor::div[contains(@class,'max-w-lg')]//textarea"), "Invalid complaint category for maintenance workflow");
        click(By.xpath("//button[normalize-space()='Reject Complaint']"));
        closeModalIfOpen();

        By row = complaintRowByTitle(seed.title);
        wait.until(ExpectedConditions.textToBePresentInElementLocated(row, "Rejected"));
        Assert.assertTrue(driver.findElement(row).getText().contains("Rejected"));
    }

    @Test
    public void TC_21_createAnnouncement() {
        loginAsAdmin();
        navigateAdminToAnnouncements();

        String title = "Maintenance Notice " + UUID.randomUUID().toString().substring(0, 6);

        click(By.xpath("//button[.//span[normalize-space()='New Announcement']]"));
        type(By.cssSelector("input[placeholder='Announcement title']"), title);
        type(By.cssSelector("textarea[placeholder='Write your announcement...']"), "Water tank cleaning scheduled tomorrow morning.");
        driver.findElement(By.xpath("//label[normalize-space()='Tag']/following-sibling::select")).sendKeys("Maintenance");
        click(By.xpath("//button[normalize-space()='Publish']"));

        Assert.assertTrue(isDisplayed(By.xpath("//h3[normalize-space()='" + title + "']")));
    }

    @Test
    public void TC_22_deleteAnnouncement() {
        loginAsAdmin();
        navigateAdminToAnnouncements();

        String title = "Delete Notice " + UUID.randomUUID().toString().substring(0, 6);

        click(By.xpath("//button[.//span[normalize-space()='New Announcement']]"));
        type(By.cssSelector("input[placeholder='Announcement title']"), title);
        type(By.cssSelector("textarea[placeholder='Write your announcement...']"), "Temporary announcement for delete test.");
        click(By.xpath("//button[normalize-space()='Publish']"));

        By card = announcementCardByTitle(title);
        waitForVisible(card);

        driver.findElement(By.xpath("//h3[normalize-space()='" + title + "']/ancestor::div[contains(@class,'rounded-2xl')]//button[@title='Delete announcement']")).click();
        acceptConfirmIfPresent();

        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.xpath("//h3[normalize-space()='" + title + "']")));
        Assert.assertFalse(isPresent(By.xpath("//h3[normalize-space()='" + title + "']")));
    }

    @Test
    public void TC_23_studentsListPageLoads() {
        loginAsAdmin();
        navigateAdminToStudents();

        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/students"));
        Assert.assertTrue(isDisplayed(By.cssSelector("input[placeholder='Search students by name, email, or ID']")));
    }

    @Test
    public void TC_24_analyticsPageLoads() {
        loginAsAdmin();
        navigateAdminToAnalytics();

        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/analytics"));
        Assert.assertTrue(isDisplayed(By.xpath("//h3[normalize-space()='Status Distribution']")));
    }

    @Test
    public void TC_25_adminLogout() {
        loginAsAdmin();

        logoutAdmin();

        Assert.assertTrue(driver.getCurrentUrl().contains("/login"));
        Assert.assertTrue(isDisplayed(By.id("loginEmail")));
    }

    private ComplaintSeed createComplaintSeedAndOpenAdminAllComplaints() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        String title = "Admin Fixture " + UUID.randomUUID().toString().substring(0, 6);
        submitComplaint(title, "Generated complaint for admin workflow checks.", false, false);

        logoutStudent();
        loginAsAdmin();
        navigateAdminToAllComplaints();

        return new ComplaintSeed(student, title);
    }

    private static class ComplaintSeed {
        private final StudentAccount student;
        private final String title;

        private ComplaintSeed(StudentAccount student, String title) {
            this.student = student;
            this.title = title;
        }
    }
}
