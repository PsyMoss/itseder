import path from 'path';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Heebo',
  fonts: [
    {
      src: path.join(process.cwd(), 'public', 'fonts', 'heebo-regular.ttf'),
      fontWeight: 'normal',
    },
    {
      src: path.join(process.cwd(), 'public', 'fonts', 'heebo-bold.ttf'),
      fontWeight: 'bold',
    },
  ],
});

// ₪ as unicode escape — react-pdf can't render ₪ directly
const SHEKEL = '\u05E9\u0022\u05D7';

const S = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Heebo',
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E8931E',
  },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#E8931E', textAlign: 'right', alignSelf: 'flex-end' },
  logoSub: { fontSize: 11, color: '#555555', marginTop: 2, textAlign: 'right', alignSelf: 'flex-end' },
  headerLeft: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 22, fontWeight: 'bold', color: '#111111', textAlign: 'right' },
  invoiceId: { fontSize: 13, color: '#555555', marginTop: 4, textAlign: 'right' },
  invoiceDate: { fontSize: 11, color: '#555555', marginTop: 2, textAlign: 'right' },
  status: { fontSize: 9, marginTop: 4, textAlign: 'right' },

  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 20 },
  box: { flex: 1, marginLeft: 16 },
  boxLast: { flex: 1 },
  sectionTitle: { fontSize: 10, color: '#666666', marginBottom: 6, textAlign: 'right' },
  label: { fontSize: 11, color: '#333333', marginBottom: 2, textAlign: 'right' },
  value: { fontSize: 13, color: '#111111', textAlign: 'right', marginBottom: 4, fontWeight: 'bold' },

  table: { marginBottom: 20 },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f5f5f5',
    padding: '8 12',
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    padding: '8 12',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableRowAlt: {
    flexDirection: 'row-reverse',
    padding: '8 12',
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  col1: { flex: 4, fontSize: 12, textAlign: 'right', color: '#111111' },
  col2: { flex: 1, fontSize: 12, textAlign: 'center', color: '#111111' },
  col3: { flex: 1, flexDirection: 'row', justifyContent: 'flex-start' },
  col3Text: { fontSize: 12, color: '#111111' },
  colHeader: { fontSize: 10, fontWeight: 'bold', color: '#555555' },

  totalBox: {
    alignItems: 'flex-end',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#E8931E',
  },
  totalLabel: { fontSize: 13, color: '#555555', textAlign: 'right' },
  totalValue: { fontSize: 26, fontWeight: 'bold', color: '#E8931E', marginTop: 4, textAlign: 'right' },

  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    // Use normal row — manually order items left-to-right for LTR footer layout
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 10, color: '#666666' },
});

const STATUS_LABELS: Record<string, string> = {
  paid: 'שולם', pending: 'ממתין לתשלום', cancelled: 'בוטל'
};

const STATUS_COLORS: Record<string, string> = {
  paid: '#4A9E7A', pending: '#E8931E', cancelled: '#ff5050'
};

interface InvoiceItem {
  description: string;
  qty: number;
  price: number;
}

interface Props {
  invoice: {
    id: string;
    client_name: string;
    created_at: string;
    status: string;
    total: number;
    items: InvoiceItem[];
  };
  client?: {
    company_name?: string;
    tax_id?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
  };
}

export default function InvoicePDF({ invoice, client }: Props) {
  const date = new Date(invoice.created_at).toLocaleDateString('he-IL');

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.logo}>ITSeder</Text>
            <Text style={S.logoSub}>פתרונות IT · ישראל</Text>
            <Text style={S.logoSub}>052-598-3311</Text>
            <Text style={S.logoSub}>info@itseder.com</Text>
          </View>
          <View style={S.headerLeft}>
            <Text style={S.invoiceTitle}>חשבונית</Text>
            <Text style={S.invoiceId}>{invoice.id}</Text>
            <Text style={S.invoiceDate}>{date}</Text>
            <Text style={[S.status, { color: STATUS_COLORS[invoice.status] || '#9A9188' }]}>
              {STATUS_LABELS[invoice.status] || invoice.status}
            </Text>
          </View>
        </View>

        {/* From / To */}
        <View style={S.row}>
          <View style={S.box}>
            <Text style={S.sectionTitle}>מאת</Text>
            <Text style={S.value}>ITSeder</Text>
            <Text style={S.label}>אלכסיי פבלנקו</Text>
            <Text style={S.label}>ע.מ: 000000000</Text>
            <Text style={S.label}>ישראל</Text>
            <Text style={S.label}>052-598-3311</Text>
            <Text style={S.label}>info@itseder.com</Text>
          </View>
          <View style={S.boxLast}>
            <Text style={S.sectionTitle}>לכבוד</Text>
            <Text style={S.value}>{client?.company_name || invoice.client_name}</Text>
            {client?.tax_id && <Text style={S.label}>ח.פ / ע.מ: {client.tax_id}</Text>}
            {client?.address && <Text style={S.label}>{client.address}</Text>}
            {client?.city && <Text style={S.label}>{client.city}</Text>}
            {client?.phone && <Text style={S.label}>{client.phone}</Text>}
          </View>
        </View>

        {/* Table */}
        <View style={S.table}>
          <View style={S.tableHeader}>
            <Text style={[S.col1, S.colHeader]}>תיאור</Text>
            <Text style={[S.col2, S.colHeader]}>כמות</Text>
            <Text style={[S.col3, S.colHeader]}>סכום</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
              <Text style={S.col1}>{item.description}</Text>
              <Text style={S.col2}>{item.qty}</Text>
              <View style={S.col3}>
                <Text style={S.col3Text}>{SHEKEL} </Text>
                <Text style={S.col3Text}>{(item.qty * item.price).toLocaleString('he-IL')}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={S.totalBox}>
          <Text style={S.totalLabel}>סכום לפני מע"מ: {(invoice.total / 1.18).toLocaleString('he-IL', {maximumFractionDigits: 2})} {SHEKEL}</Text>
          <Text style={S.totalLabel}>מע"מ 18%: {(invoice.total - invoice.total / 1.18).toLocaleString('he-IL', {maximumFractionDigits: 2})} {SHEKEL}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Text style={S.totalValue}>{SHEKEL} </Text>
            <Text style={S.totalValue}>{invoice.total.toLocaleString('he-IL')}</Text>
          </View>
        </View>

        {/* Footer — left to right: site | thank you | invoice id */}
        <View style={S.footer}>
          <Text style={S.footerText}>ITSeder · itseder.com</Text>
          <Text style={S.footerText}>!תודה על הזמנתך</Text>
          <Text style={S.footerText}>{invoice.id}</Text>
        </View>

      </Page>
    </Document>
  );
}
