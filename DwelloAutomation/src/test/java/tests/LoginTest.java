package tests;

import base.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LoginTest extends BaseTest {

    @Test
    public void TC_01_validStudentLogin() {
        StudentAccount student = registerNewStudent();

        loginAsStudent(student);

        Assert.assertTrue(driver.getCurrentUrl().contains("/dashboard"));
        Assert.assertTrue(isDisplayed(By.xpath("//h2[normalize-space()='Complaints Overview']")));
    }

    @Test
    public void TC_02_validAdminLogin() {
        loginAsAdmin();

        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/dashboard"));
        Assert.assertTrue(isDisplayed(By.xpath("//h3[normalize-space()='Recent Complaints']")));
    }

    @Test
    public void TC_03_invalidLoginCredentials() {
        openRelative("/login");

        type(By.id("loginEmail"), "invalid_" + System.currentTimeMillis() + "@example.com");
        type(By.id("loginPassword"), "Wrong@123");
        click(By.id("loginBtn"));

        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"), "Invalid email or password"));
        Assert.assertTrue(isDisplayed(By.xpath("//div[contains(.,'Invalid email or password')]")));
    }

    @Test
    public void TC_04_emptyLoginFields() {
        openRelative("/login");

        click(By.id("loginBtn"));

        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.tagName("body"), "All fields are required"));
        Assert.assertTrue(isDisplayed(By.xpath("//div[contains(.,'All fields are required')]")));
    }

    @Test
    public void TC_05_logoutTest() {
        StudentAccount student = registerNewStudent();
        loginAsStudent(student);

        logoutStudent();

        Assert.assertTrue(driver.getCurrentUrl().contains("/login"));
        Assert.assertTrue(isDisplayed(By.id("loginEmail")));
    }
}
