<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="html" indent="yes"/>

<xsl:template match="/">

<html>

<head>
    <title>TestNG Report</title>

    <style>
        body { font-family: Arial; }

        table {
            border-collapse: collapse;
            width: 60%;
            margin: 20px auto;
        }

        th, td {
            border: 1px solid black;
            padding: 10px;
            text-align: center;
        }

        th {
            background-color: #4CAF50;
            color: white;
        }

        h2 {
            text-align: center;
        }
    </style>

</head>

<body>

<!-- ================= Summary ================= -->

<h2>TestNG Report Summary</h2>

<table>

<tr>
    <th>Total</th>
    <th>Passed</th>
    <th>Failed</th>
    <th>Skipped</th>
</tr>

<tr>
    <td>
        <xsl:value-of select="testng-results/@total"/>
    </td>

    <td>
        <xsl:value-of select="testng-results/@passed"/>
    </td>

    <td>
        <xsl:value-of select="testng-results/@failed"/>
    </td>

    <td>
        <xsl:value-of select="testng-results/@skipped"/>
    </td>
</tr>

</table>

<!-- ================= Suite ================= -->

<h2>Test Suites</h2>

<table>

<tr>
    <th>Suite Name</th>
    <th>Duration (ms)</th>
</tr>

<xsl:for-each select="testng-results/suite">

<tr>
    <td>
        <xsl:value-of select="@name"/>
    </td>

    <td>
        <xsl:value-of select="@duration-ms"/>
    </td>
</tr>

</xsl:for-each>

</table>

<!-- ================= Test Modules ================= -->

<h2>Test Modules</h2>

<table>

<tr>
    <th>Test Name</th>
    <th>Duration (ms)</th>
</tr>

<xsl:for-each select="testng-results/suite/test">

<tr>
    <td>
        <xsl:value-of select="@name"/>
    </td>

    <td>
        <xsl:value-of select="@duration-ms"/>
    </td>
</tr>

</xsl:for-each>

</table>

</body>

</html>

</xsl:template>

</xsl:stylesheet>