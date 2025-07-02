const PDFDocument = require('pdfkit');
const path = require('path');
const { translateKey, getTypeByKey } = require('../utils/translate');

function createPdfStream(res) {
  const doc = new PDFDocument();
  res.setHeader('Content-disposition', 'attachment; filename=report.pdf');
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);
  return doc;
}

function drawLogo(doc) {
  const imagePath = path.resolve(__dirname, '../image/NYCPD.png');
  const imageWidth = 70;
  const imageHeight = 70;
  const pageWidth = doc.page.width;
  const imageY = doc.y;
  const centerX = (pageWidth - imageWidth) / 2;

  doc.image(imagePath, centerX, doc.y, {
    width: imageWidth,
    height: imageHeight
  });

  doc.moveDown();
  doc.y = imageY + imageHeight + 10;
}

function renderSectionHeader(doc, title, pageWidth, margin, rectHeight) {
  const rectWidth = pageWidth - 2 * margin;
  const y = doc.y;

  doc.fillColor('#c7c7c7')
    .rect(margin, y, rectWidth, rectHeight)
    .fill();

  doc.fillColor('black')
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(title, margin + 10, y + 7, {
      width: rectWidth - 20
    });

  doc.moveDown(1);
}

function renderField(doc, title, text) {
  const label = translateKey(title) + ": ";
  const type = getTypeByKey(title);

  if (type === 1 || type === 2) {
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('black')
      .text(label, { continued: true, lineGap: 4 });
  } else {
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .fillColor('black')
      .text(label, { lineGap: 4 });
  }

  if(type === 1){
    doc.font('Helvetica')
        .fontSize(12)
        .fillColor('black')
        .text(text + '      ' || '      ', { continued: true, lineGap: 4 });
    }
    else{
        doc.font('Helvetica')
        .fontSize(12)
        .fillColor('black')
        .text(text || ' ', { lineGap: 4 });
        doc.moveDown();  
    }
}

module.exports = {
  createPdfStream,
  drawLogo,
  renderSectionHeader,
  renderField
};
