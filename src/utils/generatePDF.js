import fs from 'fs';
import puppeteer from 'puppeteer';
import path from 'path';


function renderTemplate(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
}

export const generateReportPDF = async (data) => {
    const templatePath = path.resolve('src/templates', 'reportTemplate.html');
    const templateHTML = fs.readFileSync(templatePath, 'utf-8');
    const filledHTML = renderTemplate(templateHTML, {
        fecha: new Date().toLocaleDateString(),
        exitosas: data.success,
        fallidas: data.failed,
        pendientes: data.pending,
        total: data.total,
    });

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(filledHTML, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
    });

    await browser.close();
    return pdfBuffer;
};