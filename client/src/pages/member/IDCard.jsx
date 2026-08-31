import { useEffect, useMemo, useState } from "react";
import { CreditCard, Download, Printer, ShieldCheck } from "lucide-react";
import { idCardAPI } from "../../api/client";
import { formatDate, resolveAssetUrl } from "../../utils/format";

const escapeXml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const compactText = (value = "", maxLength = 34) => {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const embedPhoto = async (photoUrl) => {
  if (!photoUrl || photoUrl.startsWith("data:")) return photoUrl;

  try {
    const response = await fetch(photoUrl);
    if (!response.ok) return photoUrl;
    return await blobToDataUrl(await response.blob());
  } catch {
    return photoUrl;
  }
};

const buildCardSvg = (card, embeddedPhotoUrl) => {
  const member = card.member || {};
  const membershipId = member.membershipId || member.choirId || "Pending";
  const photoUrl = embeddedPhotoUrl ?? resolveAssetUrl(member.photoUrl);
  const isActive = Boolean(member.isActive);
  const statusFill = isActive ? "#dcfce7" : "#fee2e2";
  const statusText = isActive ? "#166534" : "#991b1b";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1012" height="640" viewBox="0 0 1012 640" style="width:100%;height:auto;display:block">
  <defs>
    <clipPath id="photoClip"><rect x="58" y="182" width="238" height="300" rx="24"/></clipPath>
    <linearGradient id="header" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect x="8" y="8" width="996" height="624" rx="34" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="0" y="0" width="1012" height="166" rx="36" fill="url(#header)"/>
  <rect x="0" y="132" width="1012" height="46" fill="#1d4ed8"/>
  <rect x="418" y="24" width="176" height="24" rx="12" fill="#e2e8f0" opacity="0.8"/>
  <text x="54" y="70" fill="#ffffff" font-family="Arial, sans-serif" font-size="33" font-weight="700">${escapeXml(compactText(card.choirName, 34))}</text>
  <text x="54" y="112" fill="#bfdbfe" font-family="Arial, sans-serif" font-size="20">${escapeXml(compactText(card.churchName, 44))}</text>
  <text x="54" y="158" fill="#ffffff" font-family="Arial, sans-serif" font-size="21" font-weight="700" letter-spacing="3">OFFICIAL MEMBER ID</text>
  <rect x="770" y="54" width="178" height="42" rx="21" fill="${statusFill}"/>
  <text x="859" y="82" text-anchor="middle" fill="${statusText}" font-family="Arial, sans-serif" font-size="18" font-weight="700">${isActive ? "ACTIVE" : "INACTIVE"}</text>

  <rect x="46" y="170" width="262" height="324" rx="32" fill="#0f172a"/>
  <rect x="58" y="182" width="238" height="300" rx="24" fill="#e5e7eb"/>
  ${photoUrl ? `<image href="${escapeXml(photoUrl)}" x="58" y="182" width="238" height="300" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>` : `<text x="177" y="338" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="24">Photo</text>`}
  <rect x="54" y="178" width="246" height="308" rx="28" fill="none" stroke="#facc15" stroke-width="6"/>

  <text x="336" y="226" fill="#64748b" font-family="Arial, sans-serif" font-size="18" font-weight="700">FULL NAME</text>
  <text x="336" y="270" fill="#0f172a" font-family="Arial, sans-serif" font-size="36" font-weight="800">${escapeXml(compactText(member.fullName, 30))}</text>
  <rect x="336" y="294" width="316" height="54" rx="14" fill="#dbeafe"/>
  <text x="356" y="329" fill="#1d4ed8" font-family="Arial, sans-serif" font-size="24" font-weight="800">${escapeXml(membershipId)}</text>
  <text x="336" y="386" fill="#334155" font-family="Arial, sans-serif" font-size="22">Role: ${escapeXml(compactText(member.role || "Choir Member", 25))}</text>
  <text x="336" y="424" fill="#334155" font-family="Arial, sans-serif" font-size="22">Voice: ${escapeXml(member.voicePart || "Not set")}</text>
  <text x="336" y="462" fill="#334155" font-family="Arial, sans-serif" font-size="22">Phone: ${escapeXml(member.phone || "Not provided")}</text>
  <text x="336" y="500" fill="#334155" font-family="Arial, sans-serif" font-size="22">Email: ${escapeXml(compactText(member.email || "Not provided", 32))}</text>

  <rect x="724" y="206" width="198" height="198" rx="22" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <image href="${escapeXml(card.qrCodeDataUrl)}" x="742" y="224" width="162" height="162"/>
  <text x="823" y="438" text-anchor="middle" fill="#475569" font-family="Arial, sans-serif" font-size="17" font-weight="700">SCAN TO VERIFY</text>
  <text x="823" y="468" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="15">${escapeXml(compactText(membershipId, 24))}</text>

  <line x1="54" y1="538" x2="958" y2="538" stroke="#cbd5e1" stroke-width="2"/>
  <text x="54" y="574" fill="#475569" font-family="Arial, sans-serif" font-size="17">Registered: ${escapeXml(formatDate(member.registrationDate || member.dateJoined))}</text>
  <text x="374" y="574" fill="#475569" font-family="Arial, sans-serif" font-size="17">Issued: ${escapeXml(formatDate(card.issuedAt))}</text>
  <text x="646" y="574" fill="#475569" font-family="Arial, sans-serif" font-size="17">Expires: ${escapeXml(formatDate(card.expiresAt))}</text>
  <text x="958" y="574" text-anchor="end" fill="#0f172a" font-family="Arial, sans-serif" font-size="17" font-weight="700">${escapeXml(compactText(card.signatureLabel || "Choir Secretary", 24))}</text>
  <rect x="20" y="20" width="972" height="600" rx="28" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="8 8"/>
</svg>`;
};

export default function MemberIDCard() {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await idCardAPI.getMyCard();
        setCard(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load ID card.");
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, []);

  const member = card?.member || {};
  const photoUrl = resolveAssetUrl(member.photoUrl);
  const svg = useMemo(() => (card ? buildCardSvg(card) : ""), [card]);

  const getExportSvg = async () => {
    const embeddedPhoto = await embedPhoto(photoUrl);
    return buildCardSvg(card, embeddedPhoto);
  };

  const printCard = async () => {
    setExporting("print");
    try {
      const printSvg = await getExportSvg();
      const printWindow = window.open("", "_blank", "width=900,height=700");
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
          <head>
            <title>${escapeXml(member.fullName || "Member")} ID Card</title>
            <style>
              @page { size: A4; margin: 0.5in; }
              * { box-sizing: border-box; }
              body { margin: 0; font-family: Arial, sans-serif; background: #ffffff; color: #111827; }
              .sheet { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 0.25in; }
              .card { width: 3.375in; height: 2.125in; }
              .card svg { width: 3.375in !important; height: 2.125in !important; display: block; }
              @media screen { body { background: #e5e7eb; } .card { transform: scale(2); transform-origin: center; } }
              @media print { .sheet { padding: 0; align-items: flex-start; justify-content: flex-start; } }
            </style>
          </head>
          <body>
            <div class="sheet"><div class="card">${printSvg}</div></div>
            <script>window.onload = () => setTimeout(() => window.print(), 150);</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } finally {
      setExporting("");
    }
  };

  const downloadImage = async () => {
    setExporting("image");
    try {
      const exportSvg = await getExportSvg();
      const blob = new Blob([exportSvg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${member.membershipId || member.choirId || "member"}-id-card.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting("");
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Loading ID card...</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My ID Card</h1>
        <div className="bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-lg p-6">
          <p className="font-semibold mb-2">ID card unavailable</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My ID Card</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Official choir membership card sized for standard CR80 ID holders.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadImage}
            disabled={Boolean(exporting)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 disabled:opacity-50"
          >
            <Download size={18} />
            {exporting === "image" ? "Preparing..." : "Download Image"}
          </button>
          <button
            onClick={printCard}
            disabled={Boolean(exporting)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Printer size={18} />
            {exporting === "print" ? "Preparing..." : "Print / Save PDF"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <section className="bg-white dark:bg-dark-800 rounded-lg shadow border border-gray-200 dark:border-dark-700 p-4 sm:p-6 overflow-hidden">
          <div className="mx-auto w-full max-w-[720px]" dangerouslySetInnerHTML={{ __html: svg }} />
        </section>

        <aside className="bg-white dark:bg-dark-800 rounded-lg shadow p-6 border border-gray-200 dark:border-dark-700 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-blue-600 dark:text-blue-400" size={22} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Verification</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Membership ID</dt>
              <dd className="text-gray-900 dark:text-white font-semibold">{member.membershipId || member.choirId}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Status</dt>
              <dd className={member.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {member.isActive ? "Active" : "Inactive"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Verification URL</dt>
              <dd className="text-blue-600 dark:text-blue-400 break-all">{card.verificationUrl}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Issued</dt>
              <dd className="text-gray-900 dark:text-white">{formatDate(card.issuedAt)}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Print Size</dt>
              <dd className="text-gray-900 dark:text-white">3.375 in x 2.125 in</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
