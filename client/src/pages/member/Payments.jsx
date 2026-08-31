import { useEffect, useMemo, useState } from "react";
import { CheckCircle, CreditCard, FileText, Loader2, ReceiptText } from "lucide-react";
import { paymentAPI } from "../../api/client";
import { formatCurrency, formatDate, formatMonthYear } from "../../utils/format";

export default function MemberPayments() {
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [selectedDueKey, setSelectedDueKey] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const outstandingMonths = summary?.outstandingMonths || [];

  const selectedDue = useMemo(() => {
    if (!selectedDueKey) return outstandingMonths[0] || null;
    return outstandingMonths.find((item) => `${item.year}-${item.month}` === selectedDueKey) || null;
  }, [outstandingMonths, selectedDueKey]);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(""), 4000);
  };

  const fetchPayments = async () => {
    const [summaryRes, historyRes] = await Promise.all([
      paymentAPI.getMySummary(),
      paymentAPI.getMyHistory({ limit: 50 })
    ]);

    const nextSummary = summaryRes.data?.data;
    setSummary(nextSummary);
    setPayments(historyRes.data?.data || []);

    const nextDue = nextSummary?.nextDue;
    setSelectedDueKey(nextDue ? `${nextDue.year}-${nextDue.month}` : "");
  };

  useEffect(() => {
    const load = async () => {
      try {
        await fetchPayments();
      } catch (err) {
        showMessage(err.response?.data?.message || "Unable to load payment information.", "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handlePay = async () => {
    if (!selectedDue) return;

    const confirmed = window.confirm(
      `Confirm payment of ${formatCurrency(selectedDue.amount)} for ${formatMonthYear(selectedDue.month, selectedDue.year)}?`
    );

    if (!confirmed) return;

    setProcessing(true);
    setReceipt(null);

    try {
      const paymentRes = await paymentAPI.simulatePayment({
        month: selectedDue.month,
        year: selectedDue.year,
        amount: selectedDue.amount
      });
      const receiptNumber = paymentRes.data?.data?.receiptNumber;
      const receiptRes = receiptNumber
        ? await paymentAPI.getPaymentReceipt(receiptNumber)
        : null;

      setReceipt(receiptRes?.data?.data || paymentRes.data?.data);
      await fetchPayments();
      showMessage("Payment confirmed and receipt generated.");
    } catch (err) {
      showMessage(err.response?.data?.message || "Payment could not be completed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = () => {
    if (!receipt) return;

    const printWindow = window.open("", "_blank", "width=720,height=680");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${receipt.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            .receipt { border: 1px solid #d1d5db; border-radius: 12px; padding: 24px; max-width: 560px; margin: 0 auto; }
            h1 { margin-top: 0; }
            dl { display: grid; grid-template-columns: 180px 1fr; gap: 12px; }
            dt { color: #6b7280; }
            dd { margin: 0; font-weight: 700; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h1>Voice of Light Chorale</h1>
            <h2>Dues Payment Receipt</h2>
            <dl>
              <dt>Receipt Number</dt><dd>${receipt.receiptNumber}</dd>
              <dt>Member</dt><dd>${receipt.memberName || summary?.memberName || ""}</dd>
              <dt>Membership ID</dt><dd>${receipt.memberId || ""}</dd>
              <dt>Period</dt><dd>${formatMonthYear(receipt.month, receipt.year)}</dd>
              <dt>Amount</dt><dd>${formatCurrency(receipt.amount)}</dd>
              <dt>Method</dt><dd>${receipt.method || "online"}</dd>
              <dt>Status</dt><dd>${receipt.status || "paid"}</dd>
              <dt>Paid At</dt><dd>${formatDate(receipt.paidAt || receipt.issuedAt)}</dd>
            </dl>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading payments...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dues Payments</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review your dues balance, confirm payments, and access receipts.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className={`mb-6 p-4 rounded-lg ${
            messageType === "success"
              ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
              : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary?.balance)}</p>
            </div>
            <CreditCard className="text-red-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Paid</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary?.totalPaid)}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Monthly Due</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary?.monthlyDue)}</p>
            </div>
            <ReceiptText className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <section className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-600">
                  <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Period</th>
                  <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Amount</th>
                  <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="py-3 pr-4 text-left font-semibold text-gray-900 dark:text-white">Receipt</th>
                  <th className="py-3 text-left font-semibold text-gray-900 dark:text-white">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="py-3 pr-4 text-gray-900 dark:text-white">{formatMonthYear(payment.month, payment.year)}</td>
                      <td className="py-3 pr-4 text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                          payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{payment.receiptNumber || "-"}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{formatDate(payment.paidAt || payment.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-gray-500 dark:text-gray-400">
                      No payment records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Pay Outstanding Due</h2>
            {outstandingMonths.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Month</label>
                  <select
                    value={selectedDueKey}
                    onChange={(event) => setSelectedDueKey(event.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
                  >
                    {outstandingMonths.map((due) => (
                      <option key={`${due.year}-${due.month}`} value={`${due.year}-${due.month}`}>
                        {formatMonthYear(due.month, due.year)} - {formatCurrency(due.amount)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handlePay}
                  disabled={processing || !selectedDue}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                  {processing ? "Confirming..." : "Confirm Payment"}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This records a successful simulated online payment. A gateway provider can be connected behind this endpoint later.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg p-4">
                Your dues are fully paid.
              </div>
            )}
          </div>

          {receipt && (
            <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-blue-600" size={20} />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Latest Receipt</h2>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Receipt</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{receipt.receiptNumber}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Period</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{formatMonthYear(receipt.month, receipt.year)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Amount</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{formatCurrency(receipt.amount)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Paid At</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">{formatDate(receipt.paidAt || receipt.issuedAt)}</dd>
                </div>
              </dl>
              <button
                onClick={printReceipt}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:opacity-90"
              >
                <FileText size={18} />
                Print Receipt
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
