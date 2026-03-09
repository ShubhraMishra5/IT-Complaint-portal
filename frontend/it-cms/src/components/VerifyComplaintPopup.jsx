import React, { useState } from 'react';
import axios from '../components/api'; // custom axios instance

export default function VerifyComplaintPopup({ complaint, onClose }) {
  console.log("Popup mounted with complaint:", complaint);
  const [remark, setRemark] = useState('');
  const [step, setStep] = useState('options'); // 'options' | 'closed' | 'reopen'

  const complaintId = complaint?.id?.replace(/^C/, ''); // in earlier version we were using .id

  const handleCloseComplaint = async () => {
    try {
      await axios.patch(`/dashboard/complaints/${complaintId}/verify`, {
        remark,
        action: 'close',
      }, { withCredentials: true });

      setStep('closed');
    } catch (err) {
      console.error("Error closing complaint:", err);
    }
  };

  const handleReopenComplaint = async () => {
    try {
      await axios.patch(`/dashboard/complaints/${complaintId}/verify`, {
        remark,
        action: 'reopen',
      }, { withCredentials: true });

      setStep('reopen');
    } catch (err) {
      console.error("Error reopening complaint:", err);
    }
  };

  const handleExit = () => {
    setRemark('');
    setStep('options');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold text-center mb-4">Verify Complaint</h2>

        {step === 'options' && (
          <>
            <textarea
              className="w-full border p-2 mb-4"
              rows={3}
              placeholder="Add remarks (optional)..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <div className="flex justify-between gap-4">
              <button
                className="w-full bg-blue-600 text-white p-2 rounded"
                onClick={handleCloseComplaint}
              >
                Confirm & Close
              </button>
              <button
                className="w-full bg-gray-600 text-white p-2 rounded"
                onClick={handleReopenComplaint}
              >
                Raise New
              </button>
            </div>
            <button className="mt-4 w-full text-sm text-gray-500 underline" onClick={handleExit}>
              Cancel
            </button>
          </>
        )}

        {step === 'closed' && (
          <>
            <p className="text-center mb-4">Complaint has been successfully closed.</p>
            <button className="w-full bg-blue-600 text-white p-2 rounded" onClick={handleExit}>
              Done
            </button>
          </>
        )}

        {step === 'reopen' && (
          <>
            <p className="text-center mb-4">Complaint will be reopened and reassigned.</p>
            <button className="w-full bg-blue-600 text-white p-2 rounded" onClick={handleExit}>
              Okay
            </button>
          </>
        )}
      </div>
    </div>
  );
}
