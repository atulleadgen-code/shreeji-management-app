import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type InvoiceDetails = {
  orderId: string;
  clientName: string;
  location: string;
  date: string;
  amount: string;
  status: string;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingRight: 48,
    paddingBottom: 48,
    paddingLeft: 48,
    backgroundColor: '#ffffff',
    color: '#17211c',
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#dce5df',
  },
  brand: {
    color: '#166534',
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
  },
  companyCaption: {
    marginTop: 5,
    color: '#647269',
    fontSize: 9,
  },
  invoiceLabel: {
    color: '#647269',
    fontSize: 9,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  invoiceTitle: {
    marginTop: 6,
    color: '#17211c',
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  sectionLabel: {
    marginBottom: 8,
    color: '#647269',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  clientSection: {
    marginTop: 30,
  },
  clientName: {
    color: '#17211c',
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
  },
  details: {
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#dce5df',
    borderRadius: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f3f7f4',
    borderBottomWidth: 1,
    borderBottomColor: '#dce5df',
  },
  detailHeaderText: {
    color: '#647269',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  orderColumn: { width: '22%' },
  locationColumn: { width: '25%' },
  dateColumn: { width: '18%' },
  amountColumn: { width: '20%', textAlign: 'right' },
  statusColumn: { width: '15%', textAlign: 'right' },
  detailValue: {
    color: '#17211c',
    fontSize: 9,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#dce5df',
  },
  totalLabel: {
    marginRight: 22,
    color: '#647269',
    fontSize: 10,
  },
  totalAmount: {
    color: '#166534',
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    right: 48,
    bottom: 30,
    left: 48,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e8eee9',
    color: '#849188',
    fontSize: 8,
    textAlign: 'center',
  },
});

export default function PurchaseOrderInvoice({ order }: { order: InvoiceDetails }) {
  return (
    <Document title={`Invoice ${order.orderId}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Shreeji</Text>
            <Text style={styles.companyCaption}>Project Management</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>Purchase order invoice</Text>
            <Text style={styles.invoiceTitle}>{order.orderId}</Text>
          </View>
        </View>

        <View style={styles.clientSection}>
          <Text style={styles.sectionLabel}>Bill to</Text>
          <Text style={styles.clientName}>{order.clientName || 'Client not specified'}</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailHeader}>
            <Text style={[styles.orderColumn, styles.detailHeaderText]}>Order ID</Text>
            <Text style={[styles.locationColumn, styles.detailHeaderText]}>Location</Text>
            <Text style={[styles.dateColumn, styles.detailHeaderText]}>Date</Text>
            <Text style={[styles.amountColumn, styles.detailHeaderText]}>Amount</Text>
            <Text style={[styles.statusColumn, styles.detailHeaderText]}>Status</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.orderColumn, styles.detailValue]}>{order.orderId}</Text>
            <Text style={[styles.locationColumn, styles.detailValue]}>{order.location || '—'}</Text>
            <Text style={[styles.dateColumn, styles.detailValue]}>{order.date || '—'}</Text>
            <Text style={[styles.amountColumn, styles.detailValue]}>{order.amount || '—'}</Text>
            <Text style={[styles.statusColumn, styles.detailValue]}>{order.status || '—'}</Text>
          </View>
        </View>

        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total amount</Text>
          <Text style={styles.totalAmount}>{order.amount || '—'}</Text>
        </View>

        <Text style={styles.footer}>Shreeji Project Management · Purchase Order Invoice</Text>
      </Page>
    </Document>
  );
}