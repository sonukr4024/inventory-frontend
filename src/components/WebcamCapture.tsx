import React, { useRef, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert
} from '@mui/material';
import { CameraAlt, Cameraswitch } from '@mui/icons-material';

interface WebcamCaptureProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ open, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: 640, height: 480 },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'face-capture.jpg', { type: 'image/jpeg' });
          onCapture(file);
          stopCamera();
          onClose();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  React.useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Capture Face Image</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        </Box>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {isStreaming && (
          <>
            <Button
              startIcon={<Cameraswitch />}
              onClick={switchCamera}
            >
              Switch
            </Button>
            <Button
              variant="contained"
              startIcon={<CameraAlt />}
              onClick={capturePhoto}
            >
              Capture
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WebcamCapture;
