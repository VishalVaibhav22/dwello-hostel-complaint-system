package utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

public final class ScreenshotUtil {

    private static final DateTimeFormatter TS_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private ScreenshotUtil() {
    }

    public static void captureScreenshot(WebDriver driver, String testName) {
        if (driver == null) {
            return;
        }

        try {
            Path screenshotsDir = Paths.get("screenshots");
            Files.createDirectories(screenshotsDir);

            String timestamp = LocalDateTime.now().format(TS_FORMAT);
            String safeTestName = testName.replaceAll("[^a-zA-Z0-9_-]", "_");
            Path outputPath = screenshotsDir.resolve(safeTestName + "_" + timestamp + ".png");

            File source = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Files.copy(source.toPath(), outputPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ignored) {
            // Screenshot capture should never break the test teardown.
        }
    }

    public static void capture(WebDriver driver, String testName) {
        captureScreenshot(driver, testName);
    }
}
