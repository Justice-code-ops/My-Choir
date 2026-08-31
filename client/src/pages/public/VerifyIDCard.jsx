import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { idCardAPI } from "../../api/client";
import { CheckCircle, XCircle } from "lucide-react";
import { formatDate, resolveAssetUrl } from "../../utils/format";

export default function VerifyIDCard() {
  const { choirId } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyCard = async () => {
      if (!choirId) {
        setError("No ID to verify");
        setLoading(false);
        return;
      }

      try {
        const res = await idCardAPI.verifyCard(choirId);
        setCard(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || "ID verification failed");
      } finally {
        setLoading(false);
      }
    };
    verifyCard();
  }, [choirId]);

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-300">Verifying ID...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">Verify ID Card</h1>

      {card ? (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">ID Card Valid</h2>
            <p className="text-gray-600 dark:text-gray-400">This membership ID is active and verified.</p>
          </div>

          <div className="space-y-4 bg-gray-50 dark:bg-dark-700 p-6 rounded-lg">
            {card.photo && (
              <img src={resolveAssetUrl(card.photo)} alt={card.name} className="w-24 h-24 rounded-lg object-cover mx-auto" />
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Member Name</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choir ID</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.choirId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Voice Part</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.voicePart}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valid Until</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(card.expiryDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 capitalize">{card.status}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-8">
          <div className="text-center">
            <XCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
