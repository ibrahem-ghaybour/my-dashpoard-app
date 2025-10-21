# Product Images Setup Guide

## ⚠️ Important: Backend Configuration Required

The image upload functionality requires **Cloudinary** to be configured on the backend server.

### Backend Setup (Node.js/Express)

#### 1. Install Cloudinary Package

```bash
npm install cloudinary
```

#### 2. Configure Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# OR use the full URL
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

#### 3. Update Product Routes (`routes/products.js`)

Replace the image upload route with this implementation:

```javascript
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @route   POST /api/products/:id/images
// @desc    Upload up to 5 images for a product
// @access  Private
router.post('/:id/images', [protect, upload.array('images', 5)], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check ownership/admin
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: 'No images uploaded' });

    // Upload images to Cloudinary
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'products',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // Add images to product
    product.images = [...product.images, ...imageUrls];
    
    // Set first image as primary if no primary exists
    if (!product.primaryImage && imageUrls.length > 0) {
      product.primaryImage = imageUrls[0];
    }

    await product.save();

    res.json({
      success: true,
      data: {
        images: product.images,
        primaryImage: product.primaryImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});
```

#### 4. Update Product Model (`models/Product.js`)

Make sure your Product schema includes:

```javascript
const productSchema = new mongoose.Schema({
  // ... other fields
  images: {
    type: [String],
    default: [],
  },
  primaryImage: {
    type: String,
    default: '',
  },
  // ... other fields
});
```

## Frontend Usage

### 1. Add New Product with Images

```vue
<script setup>
import { useProductsCRUD } from '~/composable/useProductsCRUD';
import { useImageUpload } from '~/composable/useImageUpload';

const { createProduct } = useProductsCRUD();
const { uploadProductImages } = useImageUpload();

const handleSubmit = async () => {
  // 1. Create product first
  const product = await createProduct(formData.value);
  
  // 2. Upload images if any
  if (pendingImages.value.length > 0) {
    await uploadProductImages(product._id, pendingImages.value);
  }
};
</script>
```

### 2. Edit Product Images

```vue
<script setup>
import ImageUpload from '~/components/ImageUpload.vue';
import { useImageUpload } from '~/composable/useImageUpload';

const { uploadProductImages, setPrimaryImage, deleteProductImage } = useImageUpload();

const handleImageUpload = async (files) => {
  await uploadProductImages(productId, files);
};

const handleSetPrimary = async (url) => {
  await setPrimaryImage(productId, url);
};

const handleImageRemove = async (url) => {
  await deleteProductImage(productId, url);
};
</script>

<template>
  <ImageUpload
    :model-value="productImages"
    :primary-image="productPrimaryImage"
    @upload="handleImageUpload"
    @remove="handleImageRemove"
    @set-primary="handleSetPrimary"
  />
</template>
```

## API Endpoints

### Upload Images
```
POST /api/products/:id/images
Content-Type: multipart/form-data

Body: FormData with 'images' field (up to 5 files)

Response:
{
  "success": true,
  "data": {
    "images": ["url1", "url2", ...],
    "primaryImage": "url1"
  }
}
```

### Set Primary Image
```
PATCH /api/products/:id/primary-image
Content-Type: application/json

Body: { "url": "image_url" }

Response:
{
  "success": true,
  "data": {
    "primaryImage": "image_url"
  }
}
```

### Delete Image
```
DELETE /api/products/:id/images
Content-Type: application/json

Body: { "url": "image_url" }

Response:
{
  "success": true,
  "data": {
    "images": ["remaining_urls"],
    "primaryImage": "url_or_empty"
  }
}
```

## Troubleshooting

### Error: "Image storage is not configured"
- Make sure Cloudinary environment variables are set
- Restart your backend server after adding environment variables

### Error: "Upload handler not implemented"
- Update your backend routes with the Cloudinary implementation above

### Images not showing
- Check that the URLs returned from Cloudinary are accessible
- Verify CORS settings if images are on a different domain

## Next Steps

To add image upload for **Categories** and **Users**, follow the same pattern:

1. Add Cloudinary upload routes for each entity
2. Update the respective models to include image fields
3. Use the `useImageUpload` composable in the frontend
