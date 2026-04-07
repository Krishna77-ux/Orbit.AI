import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
  const doc = new PDFDocument({ margin: 50 });
  const outputPath = path.join(__dirname, 'Commerce_Resume.pdf');
  const stream = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log('✅ PDF Created Successfully at:', outputPath);
      resolve();
    });
    stream.on('error', reject);

    doc.pipe(stream);

    // Content
    doc.fontSize(22).text('ROHIT SHARMA', { align: 'center' });
    doc.fontSize(10).text('rohit.sharma@example.com | +91 9876543210', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text('Objective');
    doc.fontSize(10).text('Proactive commerce graduate looking for an entry-level accounting role.');
    doc.moveDown();

    doc.fontSize(14).text('Skills');
    doc.fontSize(10).text('Financial Analysis, Tally ERP, GST Filing, Excel (VLOOKUP, Pivot Tables).');
    doc.moveDown();

    doc.fontSize(14).text('Experience');
    doc.fontSize(12).text('Accounts Intern | ABC Finance (2023)');
    doc.fontSize(10).text('Handled bookkeeping and basic financial reporting.');

    doc.end();
  });
}

generate().catch(console.error);
