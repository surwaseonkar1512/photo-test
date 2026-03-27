import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export const generatePDF = async (data, outputPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(`Generating PDF for ${data.quotationNumber}...`);
            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            doc.on('error', (err) => {
                console.error('PDFKit Error:', err);
                reject(err);
            });

            // BRAND COLORS
            const primaryColor = '#000000';
            const secondaryColor = '#666666';
            const accentColor = '#3b82f6';

            // --- 1. HEADER SECTION ---
            if (data.logo) {
                try {
                    console.log('Fetching logo from:', data.logo);
                    const response = await axios.get(data.logo, { 
                        responseType: 'arraybuffer',
                        timeout: 5000 
                    });
                    doc.image(Buffer.from(response.data), 50, 45, { width: 80 });
                    console.log('Logo added to PDF');
                } catch (e) {
                    console.error('Logo fetch/render failed:', e.message);
                    doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text(data.studioName || 'VISIONARY STUDIO', 50, 50);
                }
            } else {
                doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text(data.studioName || 'VISIONARY STUDIO', 50, 50);
            }

            doc.fillColor(secondaryColor).fontSize(10).font('Helvetica')
               .text(data.contactPhone || '', 200, 50, { align: 'right' })
               .text(data.contactEmail || '', 200, 65, { align: 'right' })
               .text(data.website || '', 200, 80, { align: 'right' });

            doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#eeeeee').stroke();
            doc.fillColor(primaryColor);

            // ... (rest of the logic stays similar but with better color resets)
            doc.fontSize(14).font('Helvetica-Bold').text('QUOTATION', 50, 130);
            doc.fontSize(10).font('Helvetica').text(`Quote No: ${data.quotationNumber}`, 50, 150);
            doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 165);

            // Client Info Box
            doc.rect(300, 130, 250, 100).fill('#f9fafb').stroke('#eeeeee');
            doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('CLIENT DETAILS', 315, 145);
            doc.font('Helvetica').text(`Name: ${data.clientName}`, 315, 165);
            doc.text(`Email: ${data.clientEmail}`, 315, 180);
            doc.text(`Contact: ${data.clientPhone}`, 315, 195);
            doc.text(`Location: ${data.location || 'N/A'}`, 315, 210);

            // Event Details
            doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('EVENT INFORMATION', 50, 200);
            doc.font('Helvetica').text(`Event Type: ${data.eventType || 'N/A'}`, 50, 220);
            doc.text(`Event Date: ${data.eventDate || 'N/A'}`, 50, 235);

            // --- 3. PACKAGE INCLUDES ---
            doc.moveTo(50, 260).lineTo(550, 260).strokeColor('#eeeeee').stroke();
            doc.fontSize(12).font('Helvetica-Bold').text('PACKAGE INCLUDES', 50, 280);

            let yPos = 305;
            if (data.services && data.services.length > 0) {
                data.services.forEach(service => {
                    doc.circle(55, yPos + 4, 2).fill(primaryColor);
                    doc.fontSize(10).font('Helvetica').fillColor(primaryColor).text(service, 65, yPos);
                    yPos += 20;
                });
            }

            // --- 4. PRICING TABLE ---
            yPos = Math.max(yPos + 30, 420);
            doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text('PRICING DETAILS', 50, yPos);
            yPos += 25;

            // Table Header
            doc.rect(50, yPos, 500, 25).fill('#f3f4f6');
            doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('Description', 60, yPos + 7);
            doc.text('Amount (₹)', 480, yPos + 7, { align: 'right', width: 60 });

            yPos += 30;
            const drawRow = (label, value, isBold = false) => {
                doc.fillColor(primaryColor).font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).text(label, 60, yPos);
                doc.text(value.toLocaleString(), 480, yPos, { align: 'right', width: 60 });
                yPos += 22;
            };

            const discount = (data.actualPrice || 0) - (data.sellingPrice || 0);
            drawRow('Actual Menu Price', data.actualPrice || 0);
            if (discount > 0) {
                doc.fillColor('#ef4444');
                drawRow('Discount Applied', -discount);
            }
            
            drawRow('Subtotal', data.sellingPrice || 0, true);
            
            if (data.gstType === 'excluded' && data.gst > 0) {
                drawRow(`GST (${data.gstPercentage}%)`, data.gst);
            } else if (data.gstType === 'included') {
                doc.fontSize(9).font('Helvetica-Oblique').fillColor(secondaryColor).text('* Prices are inclusive of GST', 60, yPos);
                yPos += 15;
            }

            // Final Total Highlight
            doc.moveTo(50, yPos + 5).lineTo(550, yPos + 5).strokeColor(primaryColor).stroke();
            yPos += 15;
            doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('TOTAL PAYABLE:', 50, yPos);
            doc.fontSize(16).text(`₹ ${(data.finalAmount || 0).toLocaleString()}`, 400, yPos, { align: 'right', width: 140 });

            // --- 5. TERMS & CONDITIONS ---
            yPos += 60;
            doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('TERMS & NOTES', 50, yPos);
            yPos += 20;
            const terms = [
                'Advance payment (30%) required to confirm the booking.',
                'Remaining payment must be cleared before the delivery of final data.',
                'Cancellation policy: Advance is non-refundable if cancelled within 15 days of event.',
                'Delivery Timeline: 4-6 weeks for processed photos and videos.'
            ];
            terms.forEach(term => {
                doc.fontSize(9).font('Helvetica').fillColor(secondaryColor).text(`• ${term}`, 55, yPos);
                yPos += 15;
            });

            // --- 6. FOOTER ---
            const footerY = doc.page.height - 70;
            doc.moveTo(50, footerY).lineTo(550, footerY).strokeColor('#eeeeee').stroke();
            doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text(`THANK YOU FOR CHOOSING ${data.studioName || 'VISIONARY STUDIO'}!`, 50, footerY + 20, { align: 'center', width: 500 });
            doc.fontSize(8).font('Helvetica').fillColor(secondaryColor).text('We look forward to capturing your special moments.', 50, footerY + 35, { align: 'center', width: 500 });

            doc.end();
            stream.on('finish', () => {
                console.log('PDF stream finished writing.');
                resolve();
            });
            stream.on('error', (err) => {
                console.error('Stream Error:', err);
                reject(err);
            });
        } catch (error) {
            console.error('Fatal PDF Generation Error:', error);
            reject(error);
        }
    });
};
