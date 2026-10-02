/**
 * Cloudinary unsigned upload service
 *
 * Frontend mein sirf:
 * - Cloudinary Cloud Name
 * - Upload Preset
 *
 * use hota hai.
 *
 * API Secret frontend mein kabhi nahi hona chahiye.
 */

export const CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ftvncyya';

export const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

export const PRESET_NOT_CONFIGURED_MESSAGE =
  'Cloudinary upload preset is not configured yet.';


// Check whether Cloudinary upload is configured
export function isUploadConfigured() {
  return Boolean(
    CLOUD_NAME &&
    UPLOAD_PRESET
  );
}


// Upload file to Cloudinary
export function uploadToCloudinary(
  file,
  { onProgress, signal } = {}
) {
  return new Promise((resolve, reject) => {

    // -----------------------------------------
    // BASIC VALIDATION
    // -----------------------------------------

    if (!file) {
      reject(
        new Error('No file was selected.')
      );
      return;
    }

    if (!isUploadConfigured()) {
      reject(
        new Error(
          PRESET_NOT_CONFIGURED_MESSAGE
        )
      );
      return;
    }


    // -----------------------------------------
    // DETERMINE RESOURCE TYPE
    // -----------------------------------------

    const isVideo =
      file.type &&
      file.type.startsWith('video/');

    const resourceType =
      isVideo ? 'video' : 'image';


    // -----------------------------------------
    // CLOUDINARY URL
    // -----------------------------------------

    const uploadUrl =
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;


    // -----------------------------------------
    // FORM DATA
    // -----------------------------------------

    const formData = new FormData();

    formData.append(
      'file',
      file
    );

    formData.append(
      'upload_preset',
      UPLOAD_PRESET
    );


    // -----------------------------------------
    // CREATE REQUEST
    // -----------------------------------------

    const xhr =
      new XMLHttpRequest();

    xhr.open(
      'POST',
      uploadUrl,
      true
    );

    xhr.responseType = 'json';


    // -----------------------------------------
    // UPLOAD PROGRESS
    // -----------------------------------------

    xhr.upload.addEventListener(
      'progress',
      (event) => {

        if (
          event.lengthComputable &&
          typeof onProgress === 'function'
        ) {
          const percent = Math.round(
            (event.loaded / event.total) * 100
          );

          onProgress(percent);
        }
      }
    );


    // -----------------------------------------
    // SUCCESS / HTTP ERROR
    // -----------------------------------------

    xhr.addEventListener(
      'load',
      () => {

        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {

          const response =
            xhr.response;

          if (!response) {
            reject(
              new Error(
                'Cloudinary returned an empty response.'
              )
            );
            return;
          }

          resolve(response);

          return;
        }


        // Cloudinary error
        let errorMessage =
          `Cloudinary upload failed (HTTP ${xhr.status})`;

        if (
          xhr.response &&
          xhr.response.error &&
          xhr.response.error.message
        ) {
          errorMessage =
            xhr.response.error.message;
        }

        reject(
          new Error(errorMessage)
        );
      }
    );


    // -----------------------------------------
    // NETWORK ERROR
    // -----------------------------------------

    xhr.addEventListener(
      'error',
      () => {
        reject(
          new Error(
            'Network error while uploading to Cloudinary.'
          )
        );
      }
    );


    // -----------------------------------------
    // REQUEST ABORTED
    // -----------------------------------------

    xhr.addEventListener(
      'abort',
      () => {
        reject(
          new DOMException(
            'Upload canceled',
            'AbortError'
          )
        );
      }
    );


    // -----------------------------------------
    // ABORT CONTROLLER
    // -----------------------------------------

    if (signal) {

      if (signal.aborted) {
        xhr.abort();
        return;
      }

      signal.addEventListener(
        'abort',
        () => {
          xhr.abort();
        },
        { once: true }
      );
    }


    // -----------------------------------------
    // SEND REQUEST
    // -----------------------------------------

    xhr.send(formData);
  });
}