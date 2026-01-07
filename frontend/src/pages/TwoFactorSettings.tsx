import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { totpAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import OTPInput from '../components/OTPInput';
import DeviceList from '../components/DeviceList';

interface Device {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

const TwoFactorSettings: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isEnabled, setIsEnabled] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Setup states
  const [showSetup, setShowSetup] = useState(false);
  const [setupSecret, setSetupSecret] = useState('');
  const [setupQRCode, setSetupQRCode] = useState('');
  const [setupOTP, setSetupOTP] = useState('');
  const [deviceName, setDeviceName] = useState('');

  // Disable states
  const [showDisable, setShowDisable] = useState(false);
  const [disableOTP, setDisableOTP] = useState('');

  // Add device states
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [addDeviceSecret, setAddDeviceSecret] = useState('');
  const [addDeviceQRCode, setAddDeviceQRCode] = useState('');
  const [addDeviceOTP, setAddDeviceOTP] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await totpAPI.getDevices();
      setDevices(response.data.devices || []);
      setIsEnabled(response.data.devices && response.data.devices.length > 0);
    } catch (err: any) {
      setError('Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetup = async () => {
    try {
      setError('');
      const response = await totpAPI.setup();
      setSetupSecret(response.data.secret);
      setSetupQRCode(response.data.qrCodeUrl);
      setShowSetup(true);
    } catch (err: any) {
      setError('Failed to setup 2FA');
    }
  };

  const handleEnable = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    try {
      setError('');
      await totpAPI.enable(setupSecret, setupOTP, deviceName);
      setSuccess('2FA enabled successfully!');
      setShowSetup(false);
      setSetupOTP('');
      setDeviceName('');
      loadDevices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enable 2FA');
    }
  };

  const handleDisable = async () => {
    try {
      setError('');
      await totpAPI.disable(disableOTP);
      setSuccess('2FA disabled successfully!');
      setShowDisable(false);
      setDisableOTP('');
      loadDevices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  const handleAddDevice = async () => {
    try {
      setError('');
      const response = await totpAPI.setup();
      setAddDeviceSecret(response.data.secret);
      setAddDeviceQRCode(response.data.qrCodeUrl);
      setShowAddDevice(true);
    } catch (err: any) {
      setError('Failed to generate new secret');
    }
  };

  const handleConfirmAddDevice = async () => {
    if (!newDeviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    try {
      setError('');
      await totpAPI.addDevice(addDeviceSecret, addDeviceOTP, newDeviceName);
      setSuccess('Device added successfully!');
      setShowAddDevice(false);
      setAddDeviceOTP('');
      setNewDeviceName('');
      loadDevices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add device');
    }
  };

  const handleRemoveDevice = async (id: string) => {
    if (!confirm('Are you sure you want to remove this device?')) {
      return;
    }

    try {
      setError('');
      await totpAPI.removeDevice(id);
      setSuccess('Device removed successfully!');
      loadDevices();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove device');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {isEnabled ? '2FA is enabled' : '2FA is not enabled'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Setup 2FA */}
        {!isEnabled && !showSetup && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
              <div className="mt-6">
                <button
                  onClick={handleSetup}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Setup Form */}
        {showSetup && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Setup 2FA</h3>

            {/* QR Code */}
            {setupQRCode && (
              <div className="mb-6 text-center">
                <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                  <QRCodeSVG value={setupQRCode} size={200} />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Scan this QR code with your authenticator app
                </p>
                <p className="text-xs text-gray-500 mt-1">Or enter this code manually:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{setupSecret}</code>
              </div>
            )}

            {/* Device Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Device Name</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., iPhone 15, iPad"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* OTP Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code
              </label>
              <div className="flex justify-center">
                <OTPInput value={setupOTP} onChange={setSetupOTP} length={6} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleEnable}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Enable 2FA
              </button>
              <button
                onClick={() => {
                  setShowSetup(false);
                  setSetupOTP('');
                  setDeviceName('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Enabled State */}
        {isEnabled && !showSetup && !showAddDevice && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Status</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your account is protected with 2FA
                  </p>
                </div>
                <div className="flex items-center">
                  <svg
                    className="h-8 w-8 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Devices */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Your Devices</h3>
                <button
                  onClick={handleAddDevice}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Device
                </button>
              </div>
              <DeviceList devices={devices} onRemove={handleRemoveDevice} />
            </div>

            {/* Disable Button */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Disable 2FA</h3>
              <p className="text-sm text-gray-500 mb-4">
                Disabling 2FA will make your account less secure
              </p>
              <button
                onClick={() => setShowDisable(true)}
                className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        )}

        {/* Add Device Form */}
        {showAddDevice && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Device</h3>

            {/* QR Code */}
            {addDeviceQRCode && (
              <div className="mb-6 text-center">
                <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                  <QRCodeSVG value={addDeviceQRCode} size={200} />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Scan this QR code with your authenticator app
                </p>
              </div>
            )}

            {/* Device Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Device Name</label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g., iPhone 15, iPad"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* OTP Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code
              </label>
              <div className="flex justify-center">
                <OTPInput value={addDeviceOTP} onChange={setAddDeviceOTP} length={6} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmAddDevice}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Device
              </button>
              <button
                onClick={() => {
                  setShowAddDevice(false);
                  setAddDeviceOTP('');
                  setNewDeviceName('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Disable 2FA Confirmation */}
        {showDisable && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Disable 2FA</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter a 6-digit code from your authenticator app to disable 2FA
            </p>

            {/* OTP Input */}
            <div className="mb-4">
              <div className="flex justify-center">
                <OTPInput value={disableOTP} onChange={setDisableOTP} length={6} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDisable}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Disable 2FA
              </button>
              <button
                onClick={() => {
                  setShowDisable(false);
                  setDisableOTP('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettings;
