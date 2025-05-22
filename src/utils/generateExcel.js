import Exceljs from 'exceljs';
import path from 'path';
import fs from 'fs';
import logger from '../logs/logger.js';

export const generateExcelReport = async (dashboardData) => {
    try{
        const workbook = new Exceljs.Workbook();
        const templatePath = path.resolve('src/templates', 'plantilla.xlsx');

        await workbook.xlsx.readFile(templatePath);
        const sheet = workbook.getWorksheet(0);

        sheet.getCell('B9').value = new Date().toLocaleDateString();
        sheet.getCell('B10').value  = dashboardData.passed;
        sheet.getCell('B11').value  = dashboardData.failed;
        sheet.getCell('B12').value  = dashboardData.pending;
        sheet.getCell('B13').value  = dashboardData.blocked;

        const buffer = await workbook.xlsx.writeBuffer();
        logger.info('[EXCEL] REPORTE EXCEL GENERADO!!!!!');
        return buffer;

    }catch(err){
        logger.error('[EXCEL] ERROR AL GENERAR REPORTE EXCEL');
        throw new Error();
    }
}