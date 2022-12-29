const PDFDoucument = require('pdfkit');
const { getDailyRevenue, getWeeklyRevenue } = require('../model/admin-helpers');


async function buildPdf(dataCallback,endCallback){
    revenReport1 = await getDailyRevenue()
    revenReport2 = await getWeeklyRevenue()
    const doc = new PDFDoucument();
    doc.on('data',dataCallback)
    doc.on('end',endCallback)

    doc
    .fontSize(25)
    .text("Sales Report",{ align: 'left'})
    .text(`Total (Daily) :  Rs. ${revenReport1}`,{ align: 'center'})
    .text(`Total (Weekly) :  Rs. ${revenReport2}`,{ align: 'center'})
    doc.end()

}

 module.exports = { buildPdf}