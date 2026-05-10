import { renderToBuffer } from '@react-pdf/renderer';
import { NextRequest, NextResponse } from 'next/server';
import { createElement } from 'react';
import InvoicePDF from '@/components/InvoicePDF';
import { ReactElement } from 'react';
import { DocumentProps } from '@react-pdf/renderer';

export async function POST(request: NextRequest) {
  try {
    const { invoice, client } = await request.json();

    const element = createElement(InvoicePDF, { invoice, client }) as ReactElement<DocumentProps>;

    const pdf = await renderToBuffer(element);
    const buffer = Buffer.from(pdf);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}