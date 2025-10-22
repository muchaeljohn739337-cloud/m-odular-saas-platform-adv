"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API}/api/medbeds/my-bookings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) throw new Error("Failed to fetch booking");

        const bookings = await response.json();
        const foundBooking = bookings.find((b: any) => b.id === bookingId);

        if (foundBooking) {
          setBooking(foundBooking);
        } else {
          setError("Booking not found");
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch booking"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700 mb-6">{error || "Booking not found"}</p>
          <Link
            href="/features"
            className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Features
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
          <div className="mb-4">
            <CheckCircle size={64} className="mx-auto animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-green-100">
            Your Med Beds session has been successfully booked
          </p>
        </div>

        {/* Booking Details */}
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Session Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Calendar
                  className="text-blue-600 flex-shrink-0 mt-1"
                  size={24}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Session Date & Time
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(booking.sessionDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <Clock
                  className="text-purple-600 flex-shrink-0 mt-1"
                  size={24}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Duration
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {booking.duration} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <DollarSign
                  className="text-green-600 flex-shrink-0 mt-1"
                  size={24}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Total Paid
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    ${booking.cost}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    Paid via {booking.paymentMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
            <h3 className="text-xl font-bold mb-2">{booking.chamberName}</h3>
            <p className="text-blue-100 capitalize">
              {booking.chamberType} Session
            </p>
            <p className="text-sm text-blue-100 mt-4">
              Status:{" "}
              <span className="font-semibold capitalize">{booking.status}</span>
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-3 text-lg">
              What Happens Next?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">1.</span>
                <span>
                  You'll receive a confirmation email with your booking details
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">2.</span>
                <span>Our team will prepare the Med Bed for your session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">3.</span>
                <span>
                  Arrive 10 minutes early for check-in and preparation
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">4.</span>
                <span>
                  After your session, you'll receive a detailed health report
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/features"
              className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-center"
            >
              Book Another Session
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
