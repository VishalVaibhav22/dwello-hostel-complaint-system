package tests;

import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SystemTest extends BaseTest {

    @Test
    public void TC_26_unauthorizedAdminAccess() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        openRelative("/admin/dashboard");
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/login"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/login"));
    }

    @Test
    public void TC_27_sidebarNavigationTest() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        click(By.id("allComplaintsBtn"));
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/all-complaints"));
        Assert.assertTrue(isDisplayed(By.xpath("//h2[normalize-space()='All Complaints']")));

        click(By.id("announcementsBtn"));
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/announcements"));
        Assert.assertTrue(isDisplayed(By.xpath("//h2[contains(normalize-space(),'Announcement')]")));

        click(By.id("raiseComplaintBtn"));
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/raise-complaint"));
        Assert.assertTrue(isDisplayed(By.id("submitComplaintBtn")));
    }

    @Test
    public void TC_28_sessionPersistenceOnRefresh() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        driver.navigate().refresh();
        waitForPageLoad();
        wait.until(ExpectedConditions.urlContains("/dashboard"));

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));
    }

    @Test
    public void TC_29_invalidUrlHandling() {
        openRelative("/this-route-does-not-exist");
        wait.until(ExpectedConditions.urlContains("/this-route-does-not-exist"));

        String bodyText = driver.findElement(By.tagName("body")).getText().trim().toLowerCase();
        Assert.assertTrue(
                bodyText.isEmpty() || bodyText.contains("404") || bodyText.contains("not found"),
                "Invalid route should display a not-found style state."
        );
    }
}
