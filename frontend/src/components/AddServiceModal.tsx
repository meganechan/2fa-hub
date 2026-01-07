import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { servicesAPI } from '../services/api';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const AddServiceModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [mode, setMode] = useState<'manual' | 'qr'>('manual');
  const [serviceName, setServiceName] = useState('');
  const [secret, setSecret] = useState('');
  const [issuer, setIssuer] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse otpauth:// URL from QR code
  const parseOtpAuthUrl = (url: string) => {
    try {
      // Format: otpauth://totp/ISSUER:ACCOUNT?secret=XXX&issuer=XXX
      const match = url.match(/^otpauth:\/\/totp\/([^?]+)\?(.+)$/);
      if (!match) {
        throw new Error('Invalid QR code format');
      }

      const label = decodeURIComponent(match[1]);
      const params = new URLSearchParams(match[2]);

      // Parse label (can be "issuer:account" or just "account")
      let parsedIssuer = '';
      let parsedAccount = label;
      if (label.includes(':')) {
        const [i, a] = label.split(':');
        parsedIssuer = i;
        parsedAccount = a;
      }

      // Get secret and issuer from params
      const secretParam = params.get('secret');
      const issuerParam = params.get('issuer');

      if (!secretParam) {
        throw new Error('No secret found in QR code');
      }

      return {
        secret: secretParam,
        issuer: issuerParam || parsedIssuer,
        accountName: parsedAccount,
        serviceName: issuerParam || parsedIssuer || parsedAccount,
      };
    } catch (err) {
      throw new Error('Invalid QR code format. Please use a valid 2FA QR code.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      const image = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (!code) {
        throw new Error('No QR code found in image');
      }

      const parsed = parseOtpAuthUrl(code.data);
      setSecret(parsed.secret);
      setIssuer(parsed.issuer);
      setAccountName(parsed.accountName);
      setServiceName(parsed.serviceName);
      setMode('manual'); // Switch to manual mode to show/edit values
    } catch (err: any) {
      setError(err.message || 'Failed to read QR code');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!serviceName.trim()) {
      setError('Service name is required');
      return;
    }

    if (!secret.trim()) {
      setError('Secret key is required');
      return;
    }

    setIsLoading(true);

    try {
      await servicesAPI.import({
        serviceName: serviceName.trim(),
        secret: secret.trim(),
        issuer: issuer.trim() || undefined,
        accountName: accountName.trim() || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add service');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add Service</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Enter Secret
            </button>
            <button
              type="button"
              onClick={() => setMode('qr')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === 'qr'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upload QR
            </button>
          </div>

          {mode === 'qr' ? (
            <div className="text-center py-8">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
                id="qr-upload"
              />
              <label
                htmlFor="qr-upload"
                className="cursor-pointer inline-flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 hover:bg-gray-200 transition-colors">
                  {isLoading ? (
                    <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-indigo-600">
                  Click to upload QR code image
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, or screenshot
                </span>
              </label>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g., GitHub, Google, Twitter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Key *
                  </label>
                  <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value.toUpperCase())}
                    placeholder="e.g., JBSWY3DPEHPK3PXP"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The secret key from the website (usually shown when setting up 2FA)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account (optional)
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g., user@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Adding...' : 'Add Service'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddServiceModal;
