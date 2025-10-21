import { ref } from "vue";
import { useApi } from "~/plugins/api";
import { useToastTheme } from "~/composable/useToastTheme";

export interface UploadResponse {
  success: boolean;
  message?: string;
  data: {
    images: string[];
    primaryImage: string;
  };
}

export function useImageUpload() {
  const api = useApi();
  const uploading = ref(false);
  const uploadProgress = ref(0);

  const uploadProductImages = async (productId: string, files: File[]): Promise<string[]> => {
    uploading.value = true;
    uploadProgress.value = 0;

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api<UploadResponse>(`/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response || !response.success) {
        // Check if it's the "not implemented" error from backend
        throw new Error(response?.message || "Image upload is not configured on the server. Please configure Cloudinary.");
      }

      useToastTheme.success("Images uploaded successfully");
      return response.data.images;
    } catch (error: any) {
      const errorMsg = error?.message || error?.data?.message || "Failed to upload images";
      useToastTheme.error(errorMsg);
      throw error;
    } finally {
      uploading.value = false;
      uploadProgress.value = 0;
    }
  };

  const setPrimaryImage = async (productId: string, url: string): Promise<void> => {
    try {
      await api(`/products/${productId}/primary-image`, {
        method: "PATCH",
        body: { url },
      });
      useToastTheme.success("Primary image updated");
    } catch (error: any) {
      useToastTheme.error(error?.message || "Failed to set primary image");
      throw error;
    }
  };

  const deleteProductImage = async (productId: string, url: string): Promise<void> => {
    try {
      await api(`/products/${productId}/images`, {
        method: "DELETE",
        body: { url },
      });
      useToastTheme.success("Image deleted successfully");
    } catch (error: any) {
      useToastTheme.error(error?.message || "Failed to delete image");
      throw error;
    }
  };

  const uploadCategoryImage = async (categoryId: string, file: File): Promise<string> => {
    uploading.value = true;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api<{ success: boolean; data: { image: string } }>(
        `/categories/${categoryId}/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.success) {
        throw new Error("Failed to upload image");
      }

      useToastTheme.success("Image uploaded successfully");
      return response.data.image;
    } catch (error: any) {
      useToastTheme.error(error?.message || "Failed to upload image");
      throw error;
    } finally {
      uploading.value = false;
    }
  };

  const uploadUserAvatar = async (userId: string, file: File): Promise<string> => {
    uploading.value = true;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api<{ success: boolean; data: { avatar: string } }>(
        `/users/${userId}/avatar`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.success) {
        throw new Error("Failed to upload avatar");
      }

      useToastTheme.success("Avatar uploaded successfully");
      return response.data.avatar;
    } catch (error: any) {
      useToastTheme.error(error?.message || "Failed to upload avatar");
      throw error;
    } finally {
      uploading.value = false;
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadProductImages,
    setPrimaryImage,
    deleteProductImage,
    uploadCategoryImage,
    uploadUserAvatar,
  };
}
