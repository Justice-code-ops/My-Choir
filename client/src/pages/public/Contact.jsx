import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { publicAPI } from "../../api/client";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [churchInfo, setChurchInfo] = useState(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const res = await publicAPI.getChurchInfo();
        setChurchInfo(res.data?.data);
      } catch {
        setChurchInfo(null);
      }
    };
    loadInfo();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    try {
      await publicAPI.submitContact(data);
      setMessage("Message sent successfully. We will get back to you soon.");
      reset();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">Get in Touch</h2>
          <div className="space-y-6">
            {churchInfo?.email && (
              <div className="flex gap-4">
                <Mail className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400">{churchInfo.email}</p>
                </div>
              </div>
            )}
            {churchInfo?.phone && (
              <div className="flex gap-4">
                <Phone className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                  <p className="text-gray-600 dark:text-gray-400">{churchInfo.phone}</p>
                </div>
              </div>
            )}
            {churchInfo?.location && (
              <div className="flex gap-4">
                <MapPin className="text-blue-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Location</h3>
                  <p className="text-gray-600 dark:text-gray-400">{churchInfo.location}</p>
                </div>
              </div>
            )}
            {!churchInfo?.email && !churchInfo?.phone && !churchInfo?.location && (
              <p className="text-gray-600 dark:text-gray-400">
                Send a message through the form and the choir administration team will respond.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes("successfully")
                ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-100"
                : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-100"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                {...register("email", { required: "Email is required" })}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <input
                {...register("phone")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
              <input
                {...register("subject", { required: "Subject is required" })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
              <textarea
                {...register("message", { required: "Message is required" })}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg dark:bg-dark-700 dark:text-white"
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
