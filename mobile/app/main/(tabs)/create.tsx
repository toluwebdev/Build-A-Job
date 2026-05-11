import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  X,
  Zap,
  ZapOff,
  RotateCw,
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing, BorderRadius, Shadows } from '../../../src/constants';
import { useCreateJobStore } from '../../../src/context/CreateJobContext';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = Math.min(width, height) * 0.75;

// Animated corner marker component
function CornerMarker({
  position,
}: {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const getPosition = () => {
    switch (position) {
      case 'topLeft':
        return { top: -2, left: -2 };
      case 'topRight':
        return { top: -2, right: -2 };
      case 'bottomLeft':
        return { bottom: -2, left: -2 };
      case 'bottomRight':
        return { bottom: -2, right: -2 };
    }
  };

  const getRotation = () => {
    switch (position) {
      case 'topLeft':
        return '0deg';
      case 'topRight':
        return '90deg';
      case 'bottomRight':
        return '180deg';
      case 'bottomLeft':
        return '270deg';
    }
  };

  return (
    <Animated.View
      style={[
        styles.cornerMarker,
        getPosition(),
        { transform: [{ rotate: getRotation() }, { scale: pulseAnim }] },
      ]}
    >
      <View style={styles.cornerHorizontal} />
      <View style={styles.cornerVertical} />
    </Animated.View>
  );
}

// Framing guide with animated dashed border
function FramingGuide() {
  const dashOffset = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animate = Animated.loop(
      Animated.timing(dashOffset, {
        toValue: 20,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animate.start();
    return () => animate.stop();
  }, []);

  return (
    <View style={styles.frameContainer}>
      <Animated.View style={[styles.frameBorder, { borderDashOffset: dashOffset } as any]}>
        <CornerMarker position="topLeft" />
        <CornerMarker position="topRight" />
        <CornerMarker position="bottomLeft" />
        <CornerMarker position="bottomRight" />
      </Animated.View>
      <Text style={styles.frameText}>Center your project area</Text>
    </View>
  );
}

// Shutter button with animation
function ShutterButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Shutter animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Ring pulse animation
    Animated.sequence([
      Animated.timing(ringAnim, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={styles.shutterContainer}
    >
      <Animated.View
        style={[
          styles.shutterRing,
          {
            transform: [{ scale: ringAnim }],
            opacity: ringAnim.interpolate({
              inputRange: [1, 1.5],
              outputRange: [0.5, 0],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.shutterButton,
          {
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View style={styles.shutterInner} />
      </Animated.View>
    </TouchableOpacity>
  );
}

// Photo preview component
function PhotoPreview({
  uri,
  onRetake,
  onContinue,
}: {
  uri: string;
  onRetake: () => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.previewContainer}>
      <View style={styles.previewImageContainer}>
        {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
        <View style={styles.previewPlaceholder}>
          <ImageIcon size={64} color={Colors.textMuted} />
          <Text style={styles.previewText}>Photo captured!</Text>
        </View>
      </View>

      <View style={styles.previewActions}>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
          <RotateCw size={24} color={Colors.text} />
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueText}>Continue</Text>
          <ChevronRight size={20} color={Colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CreateJobScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const { setPhotos, photos } = useCreateJobStore();

  // Request permission on mount
  React.useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const toggleCamera = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlash((current) => !current);
  };

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (photo) {
        setCapturedPhoto(photo.uri);
        setPhotos([...photos, photo.uri]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, photos, setPhotos]);

  const handleRetake = () => {
    setCapturedPhoto(null);
    setPhotos(photos.slice(0, -1));
  };

  const handleContinue = () => {
    router.push('/main/ai-generate');
  };

  const handleClose = () => {
    router.back();
  };

  // Permission handling
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need camera access to capture photos of your project
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show preview if photo captured
  if (capturedPhoto) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <PhotoPreview
          uri={capturedPhoto}
          onRetake={handleRetake}
          onContinue={handleContinue}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash ? 'on' : 'off'}
        mode="picture"
      >
        {/* Top Controls */}
        <SafeAreaView style={styles.topControls} edges={['top']}>
          <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.topRightControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              {flash ? (
                <Zap size={24} color={Colors.primary} fill={Colors.primary} />
              ) : (
                <ZapOff size={24} color={Colors.text} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
              <RotateCw size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Framing Guide */}
        <View style={styles.guideContainer}>
          <FramingGuide />
        </View>

        {/* Bottom Controls */}
        <SafeAreaView style={styles.bottomControls} edges={['bottom']}>
          <View style={styles.bottomControlsContent}>
            {/* Gallery Button */}
            <TouchableOpacity style={styles.galleryButton}>
              <ImageIcon size={24} color={Colors.text} />
            </TouchableOpacity>

            {/* Shutter Button */}
            <ShutterButton onPress={takePicture} disabled={isCapturing} />

            {/* Spacer for alignment */}
            <View style={styles.spacer} />
          </View>

          {/* Photo counter */}
          {photos.length > 0 && (
            <View style={styles.photoCounter}>
              <Text style={styles.photoCounterText}>
                {photos.length} photo{photos.length !== 1 ? 's' : ''} captured
              </Text>
            </View>
          )}
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  camera: {
    flex: 1,
  },

  // Top Controls
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Framing Guide
  guideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameContainer: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameBorder: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    position: 'relative',
  },
  frameText: {
    position: 'absolute',
    bottom: -40,
    color: Colors.text,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Corner Markers
  cornerMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
  },
  cornerHorizontal: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  cornerVertical: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 3,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  // Bottom Controls
  bottomControls: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  bottomControlsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Shutter Button
  shutterContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.text,
    borderWidth: 3,
    borderColor: Colors.background,
  },

  // Gallery Button
  galleryButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: 48,
  },

  // Photo Counter
  photoCounter: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BorderRadius.full,
  },
  photoCounterText: {
    color: Colors.text,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },

  // Permission Screen
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  permissionButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  closeButton: {
    paddingVertical: Spacing.md,
  },
  closeButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },

  // Preview Screen
  previewContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  previewImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  previewPlaceholder: {
    width: '100%',
    height: '60%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  previewText: {
    marginTop: Spacing.md,
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.text,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl + 20,
    gap: Spacing.md,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  retakeText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  continueButton: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  continueText: {
    color: Colors.text,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});
