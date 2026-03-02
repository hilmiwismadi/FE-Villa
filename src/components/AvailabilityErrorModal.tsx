import React from 'react';

interface AvailabilityErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockedDates?: string[];
  conflictingDates?: string[];
}

const AvailabilityErrorModal: React.FC<AvailabilityErrorModalProps> = ({
  isOpen,
  onClose,
  blockedDates = [],
  conflictingDates = [],
}) => {
  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="aria-hidden fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal */}
      <div className="relative bg-white max-w-md w-full mx-4 p-6 shadow-2xl rounded-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-400 hover:text-primary-900 transition-colors"
          aria-label="Tutup"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            <title>Tutup</title>
          </svg>
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl font-serif text-primary-900 text-center mb-2">
          Tanggal Tidak Tersedia
        </h3>

        {/* Message */}
        <div className="text-sm text-primary-700 mb-4 space-y-2">
          {blockedDates.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="font-medium text-red-900 mb-1">
                Tanggal diblokir oleh admin:
              </p>
              <ul className="list-disc list-inside text-red-700">
                {blockedDates.map(date => (
                  <li key={date}>{formatDate(date)}</li>
                ))}
              </ul>
            </div>
          )}

          {conflictingDates.length > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="font-medium text-orange-900 mb-1">
                Tanggal sudah dipesan:
              </p>
              <ul className="list-disc list-inside text-orange-700">
                {conflictingDates.map(date => (
                  <li key={date}>{formatDate(date)}</li>
                ))}
              </ul>
            </div>
          )}

          {blockedDates.length === 0 && conflictingDates.length === 0 && (
            <p className="text-center py-2">
              Tanggal yang Anda pilih tidak tersedia untuk booking. Silakan pilih tanggal lain.
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-primary-900 text-white font-medium rounded hover:bg-primary-800 transition-colors"
        >
          Pilih Tanggal Lain
        </button>
      </div>
    </div>
  );
};

export default AvailabilityErrorModal;
