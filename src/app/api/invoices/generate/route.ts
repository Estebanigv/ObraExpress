import { NextRequest, NextResponse } from 'next/server';
import { Invoice, CompanyBillingInfo } from '@/types/billing';

// Simulación de base de datos en memoria
let invoices: Invoice[] = [];

export async function POST(request: NextRequest) {
  try {
    const { invoice, billingInfo, paymentMethod } = await request.json();
    
    // Validar datos requeridos
    if (!invoice || !billingInfo) {
      return NextResponse.json(
        { error: 'Datos de factura y facturación requeridos' },
        { status: 400 }
      );
    }

    // Generar factura con ID único
    const newInvoice: Invoice = {
      ...invoice,
      id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      numero: Math.floor(Math.random() * 1000000) + 1000000,
      fecha: new Date(),
      vencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      estado: 'pendiente'
    };

    // Guardar en "base de datos"
    invoices.push(newInvoice);

    // Simular envío de email con factura
    await sendInvoiceEmail(newInvoice, billingInfo);

    // Simular generación de PDF
    const pdfUrl = await generateInvoicePDF(newInvoice);
    newInvoice.pdfUrl = pdfUrl;

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      message: 'Factura generada exitosamente'
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function sendInvoiceEmail(invoice: Invoice, billingInfo: CompanyBillingInfo) {
  // Simular envío de email
  console.log(`Enviando factura ${invoice.numero} a ${billingInfo.email}`);
  
  // En un sistema real, aquí integrarías con un servicio de email como:
  // - Resend
  // - SendGrid
  // - Amazon SES
  // etc.
  
  return new Promise(resolve => setTimeout(resolve, 1000));
}

async function generateInvoicePDF(invoice: Invoice): Promise<string> {
  // Simular generación de PDF
  console.log(`Generando PDF para factura ${invoice.numero}`);
  
  // En un sistema real, aquí integrarías con una librería como:
  // - puppeteer
  // - jsPDF
  // - PDFKit
  // etc.
  
  return new Promise(resolve => 
    setTimeout(() => resolve(`/api/invoices/pdf/${invoice.id}`), 500)
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('id');
    
    if (invoiceId) {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (!invoice) {
        return NextResponse.json(
          { error: 'Factura no encontrada' },
          { status: 404 }
        );
      }
      return NextResponse.json({ invoice });
    }
    
    // Retornar todas las facturas
    return NextResponse.json({ invoices });
    
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}