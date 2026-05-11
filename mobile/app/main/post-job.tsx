import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, ChevronRight, Plus } from 'lucide-react-native';

import { Colors, Typography, Spacing, TRADE_CATEGORIES, URGENCY_OPTIONS } from '../../src/constants';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { GlassCard } from '../../src/components/ui/GlassCard';

export default function PostJobScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tradeCategory: '',
    urgency: 'WITHIN_WEEKS',
    address: '',
    city: '',
    postcode: '',
    budgetType: 'ESTIMATE',
    budgetMin: '',
    budgetMax: '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((a) => a.uri)]);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const draftId = `local-${Date.now()}`;
      Alert.alert(
        'Saved locally',
        'Wire your axios API to publish this job. Draft id: ' + draftId,
        [{ text: 'OK', onPress: () => router.push('/main') }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>What type of work do you need?</Text>
      
      <View style={styles.categoriesGrid}>
        {TRADE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.value}
            style={[
              styles.categoryButton,
              formData.tradeCategory === category.value && styles.categoryButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, tradeCategory: category.value })}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                formData.tradeCategory === category.value && styles.categoryTextActive,
              ]}
              numberOfLines={2}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Continue"
        onPress={() => setStep(2)}
        disabled={!formData.tradeCategory}
        style={styles.continueButton}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Tell us about your job</Text>

      <Input
        label="Job Title"
        placeholder="e.g., Kitchen renovation needed"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
      />

      <View style={styles.inputSpacing}>
        <Input
          label="Description"
          placeholder="Describe what you need done..."
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={styles.textArea}
        />
      </View>

      <Text style={styles.sectionLabel}>Urgency</Text>
      <View style={styles.urgencyContainer}>
        {URGENCY_OPTIONS.map((urgency) => (
          <TouchableOpacity
            key={urgency.value}
            style={[
              styles.urgencyButton,
              formData.urgency === urgency.value && styles.urgencyButtonActive,
            ]}
            onPress={() => setFormData({ ...formData, urgency: urgency.value })}
          >
            <Text
              style={[
                styles.urgencyText,
                formData.urgency === urgency.value && styles.urgencyTextActive,
              ]}
            >
              {urgency.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.navigationButtons}>
        <Button
          title="Back"
          variant="ghost"
          onPress={() => setStep(1)}
          style={styles.backButton}
        />
        <Button
          title="Continue"
          onPress={() => setStep(3)}
          disabled={!formData.title || !formData.description}
          style={styles.continueButton}
        />
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Add photos (recommended)</Text>
      <Text style={styles.stepSubtitle}>
        Photos help tradespeople understand your job and enable AI design generation
      </Text>

      <View style={styles.imageGrid}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <X size={16} color={Colors.text} />
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < 10 && (
          <>
            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
              <Plus size={32} color={Colors.primary} />
              <Text style={styles.addImageText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.addImageButton} onPress={takePhoto}>
              <Camera size={32} color={Colors.primary} />
              <Text style={styles.addImageText}>Camera</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.inputSpacing}>
        <Input
          label="Address"
          placeholder="Street address"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={styles.halfInput}>
          <Input
            label="City"
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
          />
        </View>
        <View style={styles.halfInput}>
          <Input
            label="Postcode"
            placeholder="Postcode"
            value={formData.postcode}
            onChangeText={(text) => setFormData({ ...formData, postcode: text.toUpperCase() })}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.navigationButtons}>
        <Button
          title="Back"
          variant="ghost"
          onPress={() => setStep(2)}
          style={styles.backButton}
        />
        <Button
          title="Post Job"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!formData.address || !formData.city || !formData.postcode}
          style={styles.continueButton}
        />
      </View>
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Post a Job</Text>
        <Text style={styles.stepIndicator}>Step {step} of 3</Text>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <GlassCard style={styles.formCard}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </GlassCard>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.md,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
  },
  stepIndicator: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: 2,
    marginBottom: Spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  formCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
  },
  stepTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  stepSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryButton: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  categoryButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: Colors.primary,
  },
  inputSpacing: {
    marginTop: Spacing.md,
  },
  textArea: {
    height: 100,
    paddingTop: Spacing.md,
  },
  sectionLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  urgencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  urgencyButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  urgencyButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
  },
  urgencyText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  urgencyTextActive: {
    color: Colors.primary,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontFamily: 'Inter-Medium',
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  continueButton: {
    flex: 2,
  },
  bottomPadding: {
    height: 100,
  },
});
