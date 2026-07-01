import React from "react";

export default function TrialExpiryScreen({
  open,
  onGoHome,
}: {
  open: boolean;
  onGoHome: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold">Trial expired</h2>
        <p className="text-sm text-gray-600 mt-2">
          Your 7-day trial has ended. Upgrade to continue.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              window.location.href = "https://gallero.in/start";
            }}
            className="w-full bg-black text-white py-2 rounded-xl font-semibold"
          >
            Upgrade now
          </button>
          <button
            type="button"
            onClick={onGoHome}
            className="w-full border border-gray-300 py-2 rounded-xl font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
