// src/components/SOSButton.tsx
import React, { useState, useRef } from 'react';
import { useSOS } from '../../context/SOSContext';
import { AlertTriangle, Shield, WifiOff } from 'lucide-react';

export const SOSButton: React.FC = () => {
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [isHolding, setIsHolding] = useState<boolean>(false);
    const [holdProgress, setHoldProgress] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
    const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { triggerSOS, currentAlert, isConnected } = useSOS();

    const startHold = (): void => {
        if (currentAlert) return;

        setError('');
        setIsHolding(true);
        setHoldProgress(0);

        progressTimerRef.current = setInterval(() => {
            setHoldProgress(prev => {
                if (prev >= 100) {
                    if (progressTimerRef.current) {
                        clearInterval(progressTimerRef.current);
                    }
                    return 100;
                }
                return prev + 5;
            });
        }, 100);

        holdTimerRef.current = setTimeout(() => {
            setIsHolding(false);
            setHoldProgress(100);
            setShowConfirm(true);
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
            }
        }, 2000);
    };

    const cancelHold = (): void => {
        setIsHolding(false);
        setHoldProgress(0);
        setError('');

        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
        }
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
        }
    };

    const capturePhoto = async (): Promise<string | null> => {
        try {
            console.log('📸 Attempting to capture photo...');

            if (!navigator.mediaDevices?.getUserMedia) {
                console.log('Camera not available');
                return null;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            const video = document.createElement('video');
            video.srcObject = stream;

            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve(true);
                };
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            stream.getTracks().forEach(track => track.stop());

            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            console.log('✅ Photo captured successfully');
            return photoData;
        } catch (error) {
            console.error('❌ Error capturing photo:', error);
            return null;
        }
    };

    const confirmSOS = async (): Promise<void> => {
        try {
            setShowConfirm(false);
            setError('');

            const photo = await capturePhoto();
            await triggerSOS(photo);

        } catch (error: any) {
            console.error('❌ SOS Trigger Error:', error);
            setError(error.message || 'Failed to send SOS alert. Please try again.');
        }
    };

    if (currentAlert) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onMouseDown={startHold}
                    onMouseUp={cancelHold}
                    onMouseLeave={cancelHold}
                    onTouchStart={startHold}
                    onTouchEnd={cancelHold}
                    onTouchCancel={cancelHold}
                    disabled={!isConnected}
                    className={`
            relative w-20 h-20 rounded-full shadow-2xl 
            flex items-center justify-center text-white font-bold 
            transition-all duration-200
            ${isHolding
                            ? 'bg-red-600 scale-110'
                            : !isConnected
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-red-500 hover:bg-red-600 scale-100'
                        }
          `}
                >
                    {!isConnected && (
                        <WifiOff size={20} className="absolute -top-2 -right-2 text-yellow-500 bg-white rounded-full p-1" />
                    )}

                    {isHolding && (
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle
                                cx="40"
                                cy="40"
                                r="38"
                                stroke="white"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="239"
                                strokeDashoffset={239 - (239 * holdProgress) / 100}
                                className="transition-all duration-100"
                            />
                        </svg>
                    )}

                    <AlertTriangle size={24} className="drop-shadow-lg" />

                    {!isHolding && isConnected && (
                        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                    )}
                </button>

                {!isHolding && (
                    <div className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 
                         bg-black bg-opacity-75 text-white text-xs px-3 py-1 rounded-lg 
                         whitespace-nowrap">
                        {!isConnected ? 'Connecting...' : 'Hold for emergency'}
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md">
                    <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
                        <div className="flex items-center">
                            <AlertTriangle size={20} className="mr-2" />
                            <span className="font-semibold">Error</span>
                        </div>
                        <p className="mt-1 text-sm">{error}</p>
                        <button
                            onClick={() => setError('')}
                            className="mt-2 text-sm underline hover:no-underline"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <Shield className="text-red-600" size={32} />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-red-600 text-center mb-2">
                            Emergency SOS
                        </h3>
                        <p className="text-gray-600 text-center mb-2">
                            Are you sure you want to trigger emergency SOS?
                        </p>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            Help will be notified immediately and your location will be shared.
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold 
                         hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSOS}
                                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold 
                         hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                            >
                                Call for Help
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Holding Overlay */}
            {isHolding && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
                    <div className="text-center text-white">
                        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center 
                          mx-auto mb-4 animate-pulse">
                            <span className="text-lg font-bold">{Math.round(holdProgress)}%</span>
                        </div>
                        <p className="text-lg font-semibold">Hold to activate SOS</p>
                        <p className="text-sm opacity-80">Release to cancel</p>
                    </div>
                </div>
            )}
        </>
    );
};

// export default SOSButton;