import { Injectable } from '@nestjs/common';
const PdfPrinter = require('pdfmake'); // ✅ Fix import
import * as path from 'path';

@Injectable()
export class PdfService {
  async generatePermisPDF(data: any, lang: 'fr' | 'ar'): Promise<Buffer> {
   const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
  },
  Arabic: {
    normal: path.join(process.cwd(), 'assets', 'fonts', 'Amiri-Regular.ttf'),
    bold: path.join(process.cwd(), 'assets', 'fonts', 'Amiri-Bold.ttf'),
  },
};

    const printer = new PdfPrinter(fonts); // ✅ no more error

    const docDefinition = lang === 'ar'
      ? this.getArabicDefinition(data)
      : this.getFrenchDefinition(data);

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: any[] = [];

    return new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.end();
    });
  }

  private getFrenchDefinition(data: any): any {
    return {
      content: [
        { text: 'Permis d’exploitation', style: 'header' },
        { text: `Code permis : ${data.code_demande}`, style: 'field' },
        { text: `Type de permis : ${data.typePermis?.lib_type}`, style: 'field' },
        { text: `Titulaire : ${data.detenteur?.nom_sociétéFR}`, style: 'field' },
        { text: `Wilaya : ${data.wilaya?.nom_wilaya}`, style: 'field' },
        { text: `Daira : ${data.daira?.nom_daira}`, style: 'field' },
        { text: `Commune : ${data.commune?.nom_commune}`, style: 'field' },
        { text: `Lieu dit : ${data.lieu_dit || ''}`, style: 'field' },
        { text: `Superficie : ${data.superficie || 0} ha`, style: 'field' },
      ],
      styles: {
        header: { fontSize: 20, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
        field: { fontSize: 12, margin: [0, 5] },
      },
      defaultStyle: { font: 'Helvetica' },
    };
  }

  private getArabicDefinition(data: any): any {
  const toField = (label: string, value: string) => ({
    columns: [
      { text: value, alignment: 'left' },
      { text: label, alignment: 'right' }
    ],
    margin: [0, 4],
  });

  return {
    content: [
      { text: 'رخصة الاستغلال', style: 'header' },
      toField('رمز الرخصة:', data.code_demande),
      toField('نوع الرخصة:', data.typePermis?.lib_type || ''),
      toField('صاحب الامتياز:', data.detenteur?.nom_sociétéAR || ''),
      toField('الولاية:', data.wilaya?.nom_wilaya || ''),
      toField('الدائرة:', data.daira?.nom_daira || ''),
      toField('البلدية:', data.commune?.nom_commune || ''),
      toField('المكان:', data.lieu_dit || ''),
      toField('المساحة:', `${data.superficie || 0} هكتار`),
    ],
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20],
      },
    },
    defaultStyle: {
      font: 'Arabic',
      alignment: 'right',
    },
  };
}

}
