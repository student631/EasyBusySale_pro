'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, X, MapPin, DollarSign, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { CATEGORIES, TEXAS_CITIES, CONDITION_TYPES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PostAdPage() {
  const { isAuthenticated, loading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    location: '',
    condition: 'new',
    images: [] as File[],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Remove authentication check - allow anyone to access post ad form

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== IMAGE UPLOAD HANDLER ===');
    const files = Array.from(e.target.files || []);
    console.log('📁 Files selected from input:', files.length);
    console.log('📄 File details:', files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified
    })));

    if (files.length === 0) {
      console.log('⚠️ No files selected');
      return;
    }

    // Validate files
    const validFiles = files.filter(file => {
      console.log(`🔍 Validating file: ${file.name}`);
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        console.log(`❌ File ${file.name} too large: ${file.size} bytes`);
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        console.log(`❌ File ${file.name} not an image: ${file.type}`);
        alert(`File ${file.name} is not an image.`);
        return false;
      }
      console.log(`✅ File ${file.name} is valid`);
      return true;
    });

    console.log('✅ Valid files count:', validFiles.length);

    const newImages = [...formData.images, ...validFiles];
    console.log('📊 Total images after adding:', newImages.length);
    console.log('🗂️ Current form images count:', formData.images.length);

    // Limit to 5 images total
    const limitedImages = newImages.slice(0, 5);
    console.log('🔢 Images after 5-image limit:', limitedImages.length);

    // Update form data
    setFormData(prev => {
      const updated = { ...prev, images: limitedImages };
      console.log('💾 Updating form data with images:', updated.images.length);
      return updated;
    });

    // Create preview URLs only for valid files
    const newPreviews = validFiles.map(file => {
      const url = URL.createObjectURL(file);
      console.log(`🖼️ Created preview URL for ${file.name}:`, url);
      return url;
    });
    setImagePreview(prev => {
      const updated = [...prev, ...newPreviews].slice(0, 5);
      console.log('🖼️ Total preview URLs:', updated.length);
      return updated;
    });

    console.log('✅ Image upload handler completed');
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreview(newPreviews);
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError('');

    try {
      setSubmitting(true);

      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Form data on submit:', {
        title: formData.title,
        imagesCount: formData.images.length,
        images: formData.images.map(img => ({
          name: img.name,
          size: img.size,
          type: img.type
        }))
      });

      // Upload images first if any
      let imageUrls: string[] = [];
      if (formData.images.length > 0) {
        console.log('🖼️ Starting image upload with', formData.images.length, 'files...');

        // Validate files before upload
        const validFiles = formData.images.filter(file => {
          console.log('Validating file:', file.name, file.type, file.size);
          return file.size > 0 && file.type.startsWith('image/');
        });

        console.log('Valid files for upload:', validFiles.length);

        if (validFiles.length === 0) {
          setError('No valid image files selected');
          return;
        }

        const uploadResponse = await apiClient.uploadFiles(validFiles);
        console.log('📤 Upload response:', uploadResponse);
        console.log('📤 Upload response.data:', uploadResponse.data);
        console.log('📤 Upload response.data type:', typeof uploadResponse.data);

        if (uploadResponse.success && uploadResponse.data) {
          // Handle nested data structure
          const dataObj = uploadResponse.data as any;
          imageUrls = dataObj.files || dataObj.data?.files || [];
          console.log('✅ Image URLs received:', imageUrls);
          console.log('✅ Image URLs count:', imageUrls.length);
        } else {
          console.error('❌ Upload failed:', uploadResponse.error);
          setError('Failed to upload images: ' + uploadResponse.error);
          return;
        }
      } else {
        console.log('⚠️ No images selected for upload');
      }

      // Create ad with uploaded image URLs
      console.log('Creating ad with image URLs:', imageUrls);
      const response = await apiClient.createAd({
        title: formData.title,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        location: formData.location,
        condition_type: formData.condition,
        images: imageUrls,
        contact_phone: '',
        contact_email: '',
      });

      console.log('Ad creation response:', response);

      if (response.success) {
        alert('Ad posted successfully!');
        router.push('/');
      } else {
        setError('Failed to post ad: ' + response.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Error posting ad:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Post Your Ad</h1>
          <p className="text-gray-600 mt-2">Reach millions of buyers with your advertisement</p>
          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                ✨ You can post ads without logging in! Create your account anytime to manage your ads.
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-20 h-1 mx-2 ${
                  step < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Card className="easysale-card">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Ad Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., iPhone 13 Pro - Excellent Condition"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange({ target: { name: 'category', value } } as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => handleInputChange({ target: { name: 'subcategory', value } } as any)}
                        disabled={!formData.category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.category && CATEGORIES.find(c => c.slug === formData.category)?.subcategories?.map(subcat => (
                            <SelectItem key={subcat} value={subcat}>{subcat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          required
                          value={formData.price}
                          onChange={handleInputChange}
                          placeholder="0"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleInputChange({ target: { name: 'condition', value } } as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_TYPES.map(cond => (
                            <SelectItem key={cond.value} value={cond.value}>{cond.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!formData.title || !formData.category || !formData.price}
                      className="easysale-btn-primary"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Description & Location */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-900">Description & Location</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your item in detail..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select value={formData.location} onValueChange={(value) => handleInputChange({ target: { name: 'location', value } } as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Texas City" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEXAS_CITIES.map(city => (
                          <SelectItem key={city.city} value={`${city.city}, ${city.stateCode}`}>
                            {city.city}, {city.stateCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!formData.description || !formData.location}
                      className="easysale-btn-primary"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Images */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-900">Upload Images</h2>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Images (Max 5)</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="image-upload" className="cursor-pointer easysale-btn-primary inline-block">
                          Choose Images
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG, GIF up to 5MB each
                      </p>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {imagePreview.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <Button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-8 h-8 hover:bg-red-600"
                              size="sm"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="easysale-btn-primary"
                    >
                      {submitting ? 'Posting...' : 'Post Ad'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}