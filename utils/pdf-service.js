const PDFDoucument = require('pdfkit');
const { getDailyRevenue, getWeeklyRevenue, getSalesReport } = require('../model/admin-helpers');


async function buildPdf(dataCallback,endCallback){
    revenReport1 = await getDailyRevenue()
    revenReport2 = await getWeeklyRevenue()
    let salesReport = await getSalesReport()
    const doc = new PDFDoucument();
    doc.on('data',dataCallback)
    doc.on('end',endCallback)

    doc
    .fontSize(25)
    .text("Sales Report",{ align: 'left'})
    .text(``,{ align: 'center'})
    .text(`Total (Weekly) :  Rs. ${revenReport2}`,{ align: 'center'})
    const table = { 
        title: '',
        headers: [],
        datas: [ salesReport ],
        rows: [ /* or simple data */ ],
      };
      doc.table(table)
    doc.end()

}

 module.exports = { buildPdf}