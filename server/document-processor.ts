
import pdfParse from 'pdf-parse';
import { Document as DocxReader } from 'docx';
import * as XLSX from 'xlsx';

export async function extractText(buffer: Buffer, fileType: string): Promise<string> {
  switch (fileType.toLowerCase()) {
    case 'application/pdf':
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
      
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      const docx = new DocxReader(buffer);
      const text = await docx.getText();
      return text;
      
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      const workbook = XLSX.read(buffer);
      let result = '';
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        result += XLSX.utils.sheet_to_txt(worksheet) + '\n';
      });
      return result;
      
    case 'text/plain':
      return buffer.toString('utf-8');
      
    default:
      throw new Error('Formato de arquivo não suportado');
  }
}
