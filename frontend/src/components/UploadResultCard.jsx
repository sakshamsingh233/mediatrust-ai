import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

const BACKGROUND_PRESETS = [
  {
    id: 'luxury',
    name: 'Luxury Studio',
    prompt:
      'a premium luxury product photography studio with elegant dark neutral tones, soft cinematic lighting, subtle shadows, high-end commercial photography',
  },
  {
    id: 'minimal',
    name: 'Minimal White',
    prompt:
      'a clean minimal white studio background with soft natural lighting, subtle realistic shadows, premium ecommerce product photography',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Home',
    prompt:
      'a beautiful modern luxury home interior with warm natural daylight, elegant furniture, realistic depth of field, premium lifestyle product photography',
  },
  {
    id: 'instagram',
    name: 'Instagram Premium',
    prompt:
      'a stylish modern social media product photography background with premium aesthetic, soft studio lighting, elegant composition, realistic shadows, high-end Instagram advertising style',
  },
];

const OPTIMIZATION_OPTIONS = [
  {
    id: 'auto',
    name: 'Auto Optimize',
    description:
      'Cloudinary automatically chooses the best format and quality.',
  },
  {
    id: 'webp',
    name: 'WebP',
    description:
      'Modern WebP format with automatic quality optimization.',
  },
];

/* ================================================= */
/* SOCIAL MEDIA / CREATIVE FORMATS                   */
/* ================================================= */

const CREATIVE_FORMATS = [
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    description:
      'Perfect square format for Instagram feed posts.',
    width: 1080,
    height: 1080,
    size: '1080 × 1080',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    description:
      'Vertical format for Instagram Stories and Reels.',
    width: 1080,
    height: 1920,
    size: '1080 × 1920',
  },
  {
    id: 'facebook-ad',
    name: 'Facebook Ad',
    description:
      'Landscape format suitable for social advertising.',
    width: 1200,
    height: 628,
    size: '1200 × 628',
  },
  {
    id: 'product-square',
    name: 'Product Square',
    description:
      'High-resolution square format for ecommerce.',
    width: 1600,
    height: 1600,
    size: '1600 × 1600',
  },
];

export default function UploadResultCard({ result }) {
  /* ================================================= */
  /* BACKGROUND REMOVAL STATE                          */
  /* ================================================= */

  const [
    removingBackground,
    setRemovingBackground,
  ] = useState(false);

  const [
    backgroundRemoved,
    setBackgroundRemoved,
  ] = useState(false);

  const [
    backgroundError,
    setBackgroundError,
  ] = useState('');


  /* ================================================= */
  /* AI VARIATION STATE                                */
  /* ================================================= */

  const [
    generatingVariation,
    setGeneratingVariation,
  ] = useState(false);

  const [
    variationError,
    setVariationError,
  ] = useState('');

  const [
    generatedVariation,
    setGeneratedVariation,
  ] = useState(null);

  const [
    selectedPreset,
    setSelectedPreset,
  ] = useState('');

  const [
    customPrompt,
    setCustomPrompt,
  ] = useState('');


  /* ================================================= */
  /* OPTIMIZATION STATE                                */
  /* ================================================= */

  const [
    optimizingImage,
    setOptimizingImage,
  ] = useState(false);

  const [
    optimizationError,
    setOptimizationError,
  ] = useState('');

  const [
    optimizedImage,
    setOptimizedImage,
  ] = useState(null);

  const [
    selectedOptimization,
    setSelectedOptimization,
  ] = useState('auto');


  /* ================================================= */
  /* CREATIVE FORMAT STATE                             */
  /* ================================================= */

  const [
    generatingCreative,
    setGeneratingCreative,
  ] = useState(false);

  const [
    creativeError,
    setCreativeError,
  ] = useState('');

  const [
    generatedCreative,
    setGeneratedCreative,
  ] = useState(null);


  /* ================================================= */
  /* ANALYSIS DATA                                     */
  /* ================================================= */

  const analysis =
    result?.analysis || {};

  const analysisError =
    analysis?.error;


  /* ================================================= */
  /* DIMENSIONS                                        */
  /* ================================================= */

  const dimensions =
    result?.width != null &&
    result?.height != null
      ? `${result.width} × ${result.height}`
      : null;


  /* ================================================= */
  /* CLOUDINARY INFORMATION                            */
  /* ================================================= */

  const rows = [
    ['Public ID', result?.public_id],

    [
      'Resource type',
      result?.resource_type,
    ],

    [
      'Original filename',
      result?.original_filename,
    ],

    [
      'Secure URL',
      result?.secure_url,
    ],

    [
      'Format',
      result?.format,
    ],

    [
      'Dimensions',
      dimensions,
    ],

    [
      'File size',
      result?.bytes != null
        ? formatBytes(result.bytes)
        : null,
    ],
  ].filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      value !== ''
  );


  /* ================================================= */
  /* AI TAGS                                           */
  /* ================================================= */

  const tags =
    Array.isArray(analysis.tags)
      ? analysis.tags
      : [];


  /* ================================================= */
  /* AI CONFIDENCE                                     */
  /* ================================================= */

  const rekognition =
    Array.isArray(
      analysis.rekognition
    )
      ? analysis.rekognition
      : [];


  /* ================================================= */
  /* BACKGROUND REMOVAL URL                            */
  /* ================================================= */

  const backgroundRemovedUrl =
    createBackgroundRemovalUrl(
      result?.secure_url,
      result?.public_id
    );


  /* ================================================= */
  /* REMOVE BACKGROUND                                */
  /* ================================================= */

  async function handleRemoveBackground() {
    if (!backgroundRemovedUrl) {
      setBackgroundError(
        'Background removal URL could not be created.'
      );

      return;
    }

    setRemovingBackground(true);

    setBackgroundError('');

    setBackgroundRemoved(false);

    try {
      await waitForBackgroundRemoval(
        backgroundRemovedUrl
      );

      setBackgroundRemoved(true);

    } catch (error) {
      setBackgroundError(
        error?.message ||
          'Unable to remove the background.'
      );

    } finally {
      setRemovingBackground(false);
    }
  }


  /* ================================================= */
  /* GENERATE AI BACKGROUND                           */
  /* ================================================= */

  async function handleGenerateVariation(
    prompt,
    presetId = 'custom'
  ) {
    if (!result?.secure_url) {
      setVariationError(
        'Original Cloudinary image URL is missing.'
      );

      return;
    }

    const cleanPrompt =
      String(prompt || '').trim();

    if (!cleanPrompt) {
      setVariationError(
        'Please select a background style or enter a custom prompt.'
      );

      return;
    }

    setGeneratingVariation(true);

    setVariationError('');

    setGeneratedVariation(null);

    setSelectedPreset(presetId);

    /*
     * New variation means old optimization
     * and creative format should be cleared.
     */

    setOptimizedImage(null);
    setOptimizationError('');

    setGeneratedCreative(null);
    setCreativeError('');

    try {
      const variationUrl =
        createBackgroundVariationUrl(
          result.secure_url,
          cleanPrompt
        );

      if (!variationUrl) {
        throw new Error(
          'Could not create the Cloudinary AI variation URL.'
        );
      }

      await waitForGeneratedImage(
        variationUrl
      );

      setGeneratedVariation({
        url: variationUrl,
        prompt: cleanPrompt,
        presetId,
      });

    } catch (error) {
      setVariationError(
        error?.message ||
          'Unable to generate the AI background variation.'
      );

    } finally {
      setGeneratingVariation(false);
    }
  }


  /* ================================================= */
  /* PRESET CLICK                                     */
  /* ================================================= */

  function handlePresetClick(preset) {
    setCustomPrompt('');

    setSelectedPreset(preset.id);

    handleGenerateVariation(
      preset.prompt,
      preset.id
    );
  }


  /* ================================================= */
  /* CUSTOM GENERATE                                  */
  /* ================================================= */

  function handleCustomGenerate() {
    handleGenerateVariation(
      customPrompt,
      'custom'
    );
  }


  /* ================================================= */
  /* RETRY VARIATION                                  */
  /* ================================================= */

  function handleRetryVariation() {
    if (
      selectedPreset === 'custom'
    ) {
      handleCustomGenerate();

      return;
    }

    const preset =
      BACKGROUND_PRESETS.find(
        (item) =>
          item.id === selectedPreset
      );

    if (preset) {
      handleGenerateVariation(
        preset.prompt,
        preset.id
      );
    }
  }


  /* ================================================= */
  /* OPTIMIZE IMAGE                                   */
  /* ================================================= */

  async function handleOptimizeImage(
    optimizationId = selectedOptimization
  ) {
    const sourceUrl =
      generatedVariation?.url ||
      result?.secure_url;

    if (!sourceUrl) {
      setOptimizationError(
        'No image is available for optimization.'
      );

      return;
    }

    setOptimizingImage(true);

    setOptimizationError('');

    setOptimizedImage(null);

    setSelectedOptimization(
      optimizationId
    );

    try {
      const optimizedUrl =
        createOptimizationUrl(
          sourceUrl,
          optimizationId
        );

      if (!optimizedUrl) {
        throw new Error(
          'Could not create the optimized Cloudinary URL.'
        );
      }

      await waitForOptimizedImage(
        optimizedUrl
      );

      setOptimizedImage({
        url: optimizedUrl,
        mode: optimizationId,
        source:
          generatedVariation?.url
            ? 'AI Variation'
            : 'Original Image',
      });

    } catch (error) {
      setOptimizationError(
        error?.message ||
          'Unable to optimize the image.'
      );

    } finally {
      setOptimizingImage(false);
    }
  }


  /* ================================================= */
  /* OPTIMIZE AI VARIATION                            */
  /* ================================================= */

  function handleOptimizeVariation() {
    handleOptimizeImage(
      selectedOptimization
    );
  }


  /* ================================================= */
  /* GENERATE CREATIVE FORMAT                         */
  /* ================================================= */

  async function handleGenerateCreative(
    format
  ) {
    const sourceUrl =
      generatedVariation?.url ||
      optimizedImage?.url ||
      result?.secure_url;

    if (!sourceUrl) {
      setCreativeError(
        'No image is available for this format.'
      );

      return;
    }

    setGeneratingCreative(true);

    setCreativeError('');

    setGeneratedCreative(null);

    try {
      const creativeUrl =
        createCreativeFormatUrl(
          sourceUrl,
          format.width,
          format.height
        );

      if (!creativeUrl) {
        throw new Error(
          'Could not create the social media format.'
        );
      }

      await waitForOptimizedImage(
        creativeUrl
      );

      setGeneratedCreative({
        url: creativeUrl,
        name: format.name,
        description: format.description,
        size: format.size,
        width: format.width,
        height: format.height,
      });

    } catch (error) {
      setCreativeError(
        error?.message ||
          'Unable to generate the selected format.'
      );

    } finally {
      setGeneratingCreative(false);
    }
  }


  /* ================================================= */
  /* OPTIMIZED DOWNLOAD URL                            */
  /* ================================================= */

  const optimizedDownloadUrl =
    optimizedImage?.url
      ? createDownloadUrl(
          optimizedImage.url
        )
      : null;


  /* ================================================= */
  /* UI                                                */
  /* ================================================= */

  return (
    <section className="result-card">

      {/* ================================================= */}
      {/* HEADER                                            */}
      {/* ================================================= */}

      <header className="result-card__header">

        <div>

          <h3>
            Upload Complete
          </h3>

          <p className="result-card__subtitle">
            Your media was uploaded successfully
            to Cloudinary.
          </p>

        </div>

        <StatusBadge tone="success">
          UPLOADED
        </StatusBadge>

      </header>


      {/* ================================================= */}
      {/* CLOUDINARY INFORMATION                            */}
      {/* ================================================= */}

      {rows.length > 0 && (
        <dl className="result-card__rows">

          {rows.map(
            ([label, value]) => (
              <div
                className="result-card__row"
                key={label}
              >

                <dt>
                  {label}
                </dt>

                <dd>

                  {label === 'Secure URL' ? (
                    <a
                      href={String(value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-card__link"
                    >
                      Open Media
                    </a>
                  ) : (
                    String(value)
                  )}

                </dd>

              </div>
            )
          )}

        </dl>
      )}


      {/* ================================================= */}
      {/* BACKGROUND REMOVAL                                */}
      {/* ================================================= */}

      {result?.resource_type === 'image' && (
        <section className="ai-results">

          <div className="ai-results__header">

            <div>

              <h4>
                Background Removal
              </h4>

              <p>
                Remove the background from your
                product image using Cloudinary AI.
              </p>

            </div>

            <StatusBadge
              tone={
                backgroundRemoved
                  ? 'success'
                  : 'processing'
              }
            >
              {backgroundRemoved
                ? 'BACKGROUND REMOVED'
                : 'AI TOOL'}
            </StatusBadge>

          </div>


          {!backgroundRemoved && (
            <button
              type="button"
              className="button button--primary"
              onClick={
                handleRemoveBackground
              }
              disabled={
                removingBackground
              }
            >
              {removingBackground
                ? 'Removing Background...'
                : 'Remove Background'}
            </button>
          )}


          {backgroundError && (
            <div className="notice notice--warning">

              <strong>
                Background Removal Failed
              </strong>

              <p>
                {backgroundError}
              </p>

              <button
                type="button"
                className="button button--ghost"
                onClick={
                  handleRemoveBackground
                }
                disabled={
                  removingBackground
                }
              >
                Try Again
              </button>

            </div>
          )}


          {backgroundRemoved && (
            <div className="background-removal-result">

              <div className="notice notice--info">

                <strong>
                  Background removed successfully.
                </strong>

                <p>
                  Cloudinary generated a new image
                  with a transparent background.
                </p>

              </div>


              <div className="background-preview">

                <div className="background-preview__item">

                  <h5>
                    Original Image
                  </h5>

                  <img
                    src={result.secure_url}
                    alt="Original uploaded media"
                    loading="lazy"
                  />

                </div>


                <div className="background-preview__item">

                  <h5>
                    Background Removed
                  </h5>

                  <img
                    src={backgroundRemovedUrl}
                    alt="Background removed product"
                    loading="lazy"
                  />

                </div>

              </div>


              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '16px',
                }}
              >

                <a
                  href={backgroundRemovedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--primary"
                >
                  Open Background Removed Image
                </a>

                <a
                  href={createDownloadUrl(
                    backgroundRemovedUrl
                  )}
                  className="button button--ghost"
                >
                  Download PNG
                </a>

              </div>

            </div>
          )}

        </section>
      )}


      {/* ================================================= */}
      {/* GENERATE PRODUCT VARIATIONS                       */}
      {/* ================================================= */}

      {result?.resource_type === 'image' && (
        <section className="ai-results">

          <div className="ai-results__header">

            <div>

              <h4>
                Generate Product Variations
              </h4>

              <p>
                Create professional AI-generated
                backgrounds for your product image.
              </p>

            </div>

            <StatusBadge
              tone={
                generatedVariation
                  ? 'success'
                  : 'processing'
              }
            >
              {generatedVariation
                ? 'VARIATION READY'
                : 'GENERATIVE AI'}
            </StatusBadge>

          </div>


          {/* PRESETS */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '16px',
            }}
          >

            {BACKGROUND_PRESETS.map(
              (preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="button button--ghost"
                  onClick={() =>
                    handlePresetClick(
                      preset
                    )
                  }
                  disabled={
                    generatingVariation
                  }
                  style={{
                    minHeight: '52px',
                  }}
                >

                  {generatingVariation &&
                  selectedPreset ===
                    preset.id
                    ? 'Generating...'
                    : preset.name}

                </button>
              )
            )}

          </div>


          {/* CUSTOM PROMPT */}

          <div
            style={{
              marginTop: '20px',
            }}
          >

            <label
              htmlFor={
                `custom-background-${result?.public_id}`
              }
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 600,
              }}
            >
              Custom Background
            </label>


            <textarea
              id={
                `custom-background-${result?.public_id}`
              }
              value={customPrompt}
              onChange={(event) => {

                setCustomPrompt(
                  event.target.value
                );

                setSelectedPreset(
                  'custom'
                );

                setVariationError('');

              }}
              placeholder={
                'Example: luxury marble table near a large window with soft morning sunlight'
              }
              rows={4}
              disabled={
                generatingVariation
              }
              style={{
                width: '100%',
                resize: 'vertical',
                padding: '12px',
                borderRadius: '10px',
                border:
                  '1px solid rgba(255,255,255,0.15)',
                background:
                  'rgba(255,255,255,0.04)',
                color: 'inherit',
                font: 'inherit',
                boxSizing: 'border-box',
              }}
            />

          </div>


          {/* CUSTOM GENERATE */}

          <div
            style={{
              marginTop: '12px',
            }}
          >

            <button
              type="button"
              className="button button--primary"
              onClick={
                handleCustomGenerate
              }
              disabled={
                generatingVariation ||
                !customPrompt.trim()
              }
            >

              {generatingVariation &&
              selectedPreset ===
                'custom'
                ? 'Generating AI Variation...'
                : 'Generate Custom Variation'}

            </button>

          </div>


          {/* VARIATION ERROR */}

          {variationError && (
            <div
              className="notice notice--warning"
              style={{
                marginTop: '16px',
              }}
            >

              <strong>
                AI Variation Failed
              </strong>

              <p>
                {variationError}
              </p>

              <button
                type="button"
                className="button button--ghost"
                onClick={
                  handleRetryVariation
                }
                disabled={
                  generatingVariation
                }
              >
                Try Again
              </button>

            </div>
          )}


          {/* GENERATED RESULT */}

          {generatedVariation && (
            <div
              className="background-removal-result"
              style={{
                marginTop: '24px',
              }}
            >

              <div className="notice notice--info">

                <strong>
                  AI variation generated successfully.
                </strong>

                <p>
                  Cloudinary created a new product
                  background from your prompt.
                </p>

              </div>


              {/* IMAGE COMPARISON */}

              <div className="background-preview">

                <div className="background-preview__item">

                  <h5>
                    Original Product
                  </h5>

                  <img
                    src={result.secure_url}
                    alt="Original product"
                    loading="lazy"
                  />

                </div>


                <div className="background-preview__item">

                  <h5>
                    AI Generated Variation
                  </h5>

                  <img
                    src={
                      generatedVariation.url
                    }
                    alt="AI generated product variation"
                    loading="lazy"
                  />

                </div>

              </div>


              {/* PROMPT */}

              <div
                className="notice notice--info"
                style={{
                  marginTop: '16px',
                }}
              >

                <strong>
                  Generation Prompt
                </strong>

                <p>
                  {
                    generatedVariation.prompt
                  }
                </p>

              </div>


              {/* ACTIONS */}

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '16px',
                }}
              >

                <a
                  href={
                    generatedVariation.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--primary"
                >
                  Open Generated Image
                </a>


                <a
                  href={createDownloadUrl(
                    generatedVariation.url
                  )}
                  className="button button--ghost"
                >
                  Download AI Image
                </a>

              </div>

            </div>
          )}

        </section>
      )}


      {/* ================================================= */}
      {/* IMAGE OPTIMIZATION                               */}
      {/* ================================================= */}

      {result?.resource_type === 'image' && (
        <section className="ai-results">

          <div className="ai-results__header">

            <div>

              <h4>
                Image Optimization
              </h4>

              <p>
                Optimize your product image for
                faster websites, ecommerce and
                social media delivery.
              </p>

            </div>

            <StatusBadge
              tone={
                optimizedImage
                  ? 'success'
                  : 'processing'
              }
            >
              {optimizedImage
                ? 'OPTIMIZED'
                : 'CLOUDINARY OPTIMIZATION'}
            </StatusBadge>

          </div>


          {/* OPTIMIZATION OPTIONS */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginTop: '18px',
            }}
          >

            {OPTIMIZATION_OPTIONS.map(
              (option) => (
                <button
                  key={option.id}
                  type="button"
                  className="button button--ghost"
                  onClick={() =>
                    setSelectedOptimization(
                      option.id
                    )
                  }
                  disabled={
                    optimizingImage
                  }
                  style={{
                    minHeight: '76px',
                    textAlign: 'left',
                    padding: '14px',
                    border:
                      selectedOptimization ===
                      option.id
                        ? '1px solid rgba(255,255,255,0.45)'
                        : undefined,
                  }}
                >

                  <strong
                    style={{
                      display: 'block',
                      marginBottom: '5px',
                    }}
                  >
                    {option.name}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      opacity: 0.7,
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                    }}
                  >
                    {option.description}
                  </span>

                </button>
              )
            )}

          </div>


          {/* OPTIMIZE BUTTON */}

          <div
            style={{
              marginTop: '16px',
            }}
          >

            <button
              type="button"
              className="button button--primary"
              onClick={
                handleOptimizeVariation
              }
              disabled={
                optimizingImage
              }
            >

              {optimizingImage
                ? 'Optimizing Image...'
                : generatedVariation
                  ? 'Optimize AI Variation'
                  : 'Optimize Image'}

            </button>

          </div>


          {/* OPTIMIZATION ERROR */}

          {optimizationError && (
            <div
              className="notice notice--warning"
              style={{
                marginTop: '16px',
              }}
            >

              <strong>
                Optimization Failed
              </strong>

              <p>
                {optimizationError}
              </p>

              <button
                type="button"
                className="button button--ghost"
                onClick={() =>
                  handleOptimizeImage(
                    selectedOptimization
                  )
                }
                disabled={
                  optimizingImage
                }
              >
                Try Again
              </button>

            </div>
          )}


          {/* OPTIMIZED RESULT */}

          {optimizedImage && (
            <div
              className="background-removal-result"
              style={{
                marginTop: '24px',
              }}
            >

              <div className="notice notice--info">

                <strong>
                  Image optimized successfully.
                </strong>

                <p>
                  Cloudinary generated an optimized
                  delivery version of your image.
                </p>

              </div>


              {/* BEFORE / AFTER */}

              <div className="background-preview">

                <div className="background-preview__item">

                  <h5>
                    {optimizedImage.source}
                  </h5>

                  <img
                    src={
                      optimizedImage.source ===
                      'AI Variation'
                        ? generatedVariation.url
                        : result.secure_url
                    }
                    alt="Source product"
                    loading="lazy"
                  />

                </div>


                <div className="background-preview__item">

                  <h5>
                    Optimized Image
                  </h5>

                  <img
                    src={
                      optimizedImage.url
                    }
                    alt="Optimized product"
                    loading="lazy"
                  />

                </div>

              </div>


              {/* OPTIMIZATION INFORMATION */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  marginTop: '16px',
                }}
              >

                <div className="notice notice--info">

                  <strong>
                    Delivery
                  </strong>

                  <p>
                    Cloudinary CDN
                  </p>

                </div>


                <div className="notice notice--info">

                  <strong>
                    Optimization
                  </strong>

                  <p>
                    {optimizedImage.mode ===
                    'webp'
                      ? 'WebP + Auto Quality'
                      : 'Auto Format + Auto Quality'}
                  </p>

                </div>


                <div className="notice notice--info">

                  <strong>
                    Source
                  </strong>

                  <p>
                    {optimizedImage.source}
                  </p>

                </div>

              </div>


              {/* DOWNLOAD / OPEN */}

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '16px',
                }}
              >

                <a
                  href={
                    optimizedImage.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--primary"
                >
                  Open Optimized Image
                </a>


                <a
                  href={
                    optimizedDownloadUrl
                  }
                  className="button button--ghost"
                >
                  Download Optimized Image
                </a>

              </div>

            </div>
          )}

        </section>
      )}


      {/* ================================================= */}
      {/* SOCIAL MEDIA / CREATIVE FORMATS                   */}
      {/* ================================================= */}

      {result?.resource_type === 'image' && (
        <section className="ai-results">

          <div className="ai-results__header">

            <div>

              <h4>
                Creative Formats
              </h4>

              <p>
                Generate ready-to-use product
                creatives for social media,
                advertising and ecommerce.
              </p>

            </div>

            <StatusBadge
              tone={
                generatedCreative
                  ? 'success'
                  : 'processing'
              }
            >
              {generatedCreative
                ? 'FORMAT READY'
                : 'CREATIVE STUDIO'}
            </StatusBadge>

          </div>


          {/* FORMAT OPTIONS */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '12px',
              marginTop: '18px',
            }}
          >

            {CREATIVE_FORMATS.map(
              (format) => (
                <button
                  key={format.id}
                  type="button"
                  className="button button--ghost"
                  onClick={() =>
                    handleGenerateCreative(
                      format
                    )
                  }
                  disabled={
                    generatingCreative
                  }
                  style={{
                    minHeight: '105px',
                    textAlign: 'left',
                    padding: '15px',
                  }}
                >

                  <strong
                    style={{
                      display: 'block',
                      marginBottom: '7px',
                    }}
                  >
                    {format.name}
                  </strong>

                  <span
                    style={{
                      display: 'block',
                      opacity: 0.75,
                      fontSize: '0.82rem',
                      lineHeight: 1.4,
                      marginBottom: '8px',
                    }}
                  >
                    {format.description}
                  </span>

                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      opacity: 0.9,
                    }}
                  >
                    {generatingCreative
                      ? 'Generating...'
                      : format.size}
                  </span>

                </button>
              )
            )}

          </div>


          {/* CREATIVE ERROR */}

          {creativeError && (
            <div
              className="notice notice--warning"
              style={{
                marginTop: '16px',
              }}
            >

              <strong>
                Creative Generation Failed
              </strong>

              <p>
                {creativeError}
              </p>

              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setCreativeError('');
                }}
                disabled={
                  generatingCreative
                }
              >
                Dismiss
              </button>

            </div>
          )}


          {/* GENERATED CREATIVE */}

          {generatedCreative && (
            <div
              className="background-removal-result"
              style={{
                marginTop: '24px',
              }}
            >

              <div className="notice notice--info">

                <strong>
                  {generatedCreative.name}
                  {' '}generated successfully.
                </strong>

                <p>
                  Your product image is ready in
                  {' '}
                  {generatedCreative.size}
                  {' '}format.
                </p>

              </div>


              {/* CREATIVE PREVIEW */}

              <div className="background-preview">

                <div className="background-preview__item">

                  <h5>
                    Source Image
                  </h5>

                  <img
                    src={
                      generatedVariation?.url ||
                      optimizedImage?.url ||
                      result.secure_url
                    }
                    alt="Source product"
                    loading="lazy"
                  />

                </div>


                <div className="background-preview__item">

                  <h5>
                    {generatedCreative.name}
                  </h5>

                  <img
                    src={
                      generatedCreative.url
                    }
                    alt={
                      `${generatedCreative.name} product creative`
                    }
                    loading="lazy"
                  />

                </div>

              </div>


              {/* CREATIVE INFORMATION */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '10px',
                  marginTop: '16px',
                }}
              >

                <div className="notice notice--info">

                  <strong>
                    Format
                  </strong>

                  <p>
                    {generatedCreative.name}
                  </p>

                </div>


                <div className="notice notice--info">

                  <strong>
                    Resolution
                  </strong>

                  <p>
                    {generatedCreative.size}
                  </p>

                </div>


                <div className="notice notice--info">

                  <strong>
                    Delivery
                  </strong>

                  <p>
                    Cloudinary CDN
                  </p>

                </div>

              </div>


              {/* CREATIVE ACTIONS */}

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '16px',
                }}
              >

                <a
                  href={
                    generatedCreative.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button button--primary"
                >
                  Open Creative
                </a>


                <a
                  href={
                    createDownloadUrl(
                      generatedCreative.url
                    )
                  }
                  className="button button--ghost"
                >
                  Download Creative
                </a>

              </div>

            </div>
          )}

        </section>
      )}


      {/* ================================================= */}
      {/* AI ANALYSIS ERROR                                 */}
      {/* ================================================= */}

      {analysisError && (
        <div className="notice notice--warning">

          <strong>
            AI Analysis Failed
          </strong>

          <p>
            The media was uploaded successfully,
            but AI analysis could not be completed.
          </p>

          <small>
            {String(analysisError)}
          </small>

        </div>
      )}


      {/* ================================================= */}
      {/* AI TAGS                                           */}
      {/* ================================================= */}

      {tags.length > 0 && (
        <section className="ai-results">

          <div className="ai-results__header">

            <div>

              <h4>
                AI Detected Tags
              </h4>

              <p>
                Objects and concepts detected in
                the uploaded media.
              </p>

            </div>

            <StatusBadge tone="processing">
              AI ANALYSIS
            </StatusBadge>

          </div>


          <div className="ai-tags">

            {tags.map(
              (tag, index) => (
                <span
                  className="ai-tag"
                  key={`${String(tag)}-${index}`}
                >
                  {formatTag(tag)}
                </span>
              )
            )}

          </div>

        </section>
      )}


      {/* ================================================= */}
      {/* AI CONFIDENCE                                     */}
      {/* ================================================= */}

      {rekognition.length > 0 && (
        <section className="ai-confidence">

          <div className="ai-results__header">

            <div>

              <h4>
                AI Confidence
              </h4>

              <p>
                Confidence scores returned by
                Amazon Rekognition.
              </p>

            </div>

          </div>


          <div className="confidence-list">

            {rekognition
              .slice(0, 12)
              .map(
                (item, index) => {

                  const confidence =
                    Number(
                      item?.confidence
                    ) || 0;


                  const percentage =
                    confidence <= 1
                      ? confidence * 100
                      : confidence;


                  const safePercentage =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        percentage
                      )
                    );


                  return (
                    <div
                      className="confidence-item"
                      key={
                        `${
                          item?.tag ||
                          'tag'
                        }-${index}`
                      }
                    >

                      <div className="confidence-item__top">

                        <span className="confidence-item__name">
                          {formatTag(
                            item?.tag
                          )}
                        </span>

                        <strong>
                          {
                            safePercentage.toFixed(
                              1
                            )
                          }%
                        </strong>

                      </div>


                      <div className="confidence-bar">

                        <div
                          className="confidence-bar__fill"
                          style={{
                            width:
                              `${safePercentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

          </div>

        </section>
      )}


      {/* ================================================= */}
      {/* NO AI RESULT                                      */}
      {/* ================================================= */}

      {!analysisError &&
        tags.length === 0 &&
        rekognition.length === 0 && (
          <div className="notice notice--info">

            <span>
              Media uploaded successfully,
              but no AI tags were returned.
            </span>

          </div>
        )}

    </section>
  );
}


/* ================================================= */
/* CLOUDINARY BACKGROUND REMOVAL URL                 */
/* ================================================= */

function createBackgroundRemovalUrl(
  secureUrl,
  publicId
) {
  if (
    !secureUrl ||
    !publicId
  ) {
    return null;
  }

  try {

    const uploadMarker =
      '/upload/';

    const uploadIndex =
      secureUrl.indexOf(
        uploadMarker
      );

    if (uploadIndex === -1) {
      return null;
    }

    const beforeUpload =
      secureUrl.slice(
        0,
        uploadIndex +
          uploadMarker.length
      );

    const afterUpload =
      secureUrl.slice(
        uploadIndex +
          uploadMarker.length
      );

    return (
      `${beforeUpload}` +
      `e_background_removal:fineedges_y/` +
      `${afterUpload}`
    );

  } catch {
    return null;
  }
}


/* ================================================= */
/* CLOUDINARY AI BACKGROUND VARIATION URL            */
/* ================================================= */

function createBackgroundVariationUrl(
  secureUrl,
  prompt
) {
  if (
    !secureUrl ||
    !prompt
  ) {
    return null;
  }

  try {

    const uploadMarker =
      '/upload/';

    const uploadIndex =
      secureUrl.indexOf(
        uploadMarker
      );

    if (uploadIndex === -1) {
      return null;
    }

    const beforeUpload =
      secureUrl.slice(
        0,
        uploadIndex +
          uploadMarker.length
      );

    const afterUpload =
      secureUrl.slice(
        uploadIndex +
          uploadMarker.length
      );

    const encodedPrompt =
      encodeURIComponent(
        String(prompt).trim()
      );

    const transformation =
      `e_gen_background_replace:` +
      `prompt_${encodedPrompt}`;

    return (
      `${beforeUpload}` +
      `${transformation}/` +
      `${afterUpload}`
    );

  } catch {
    return null;
  }
}


/* ================================================= */
/* CLOUDINARY OPTIMIZATION URL                      */
/* ================================================= */

function createOptimizationUrl(
  secureUrl,
  optimizationId
) {
  if (!secureUrl) {
    return null;
  }

  try {

    const uploadMarker =
      '/upload/';

    const uploadIndex =
      secureUrl.indexOf(
        uploadMarker
      );

    if (uploadIndex === -1) {
      return null;
    }

    const beforeUpload =
      secureUrl.slice(
        0,
        uploadIndex +
          uploadMarker.length
      );

    const afterUpload =
      secureUrl.slice(
        uploadIndex +
          uploadMarker.length
      );

    const transformation =
      optimizationId === 'webp'
        ? 'f_webp,q_auto'
        : 'f_auto,q_auto';

    return (
      `${beforeUpload}` +
      `${transformation}/` +
      `${afterUpload}`
    );

  } catch {
    return null;
  }
}


/* ================================================= */
/* CLOUDINARY CREATIVE FORMAT URL                   */
/* ================================================= */

function createCreativeFormatUrl(
  secureUrl,
  width,
  height
) {
  if (
    !secureUrl ||
    !width ||
    !height
  ) {
    return null;
  }

  try {

    const uploadMarker =
      '/upload/';

    const uploadIndex =
      secureUrl.indexOf(
        uploadMarker
      );

    if (uploadIndex === -1) {
      return null;
    }

    const beforeUpload =
      secureUrl.slice(
        0,
        uploadIndex +
          uploadMarker.length
      );

    const afterUpload =
      secureUrl.slice(
        uploadIndex +
          uploadMarker.length
      );

    /*
     * c_fill
     * Exact output dimensions.
     *
     * g_auto
     * Cloudinary automatically chooses
     * the important area while cropping.
     *
     * f_auto
     * Automatic delivery format.
     *
     * q_auto
     * Automatic quality optimization.
     */

    const transformation =
      `c_fill,w_${width},h_${height},g_auto,f_auto,q_auto`;

    return (
      `${beforeUpload}` +
      `${transformation}/` +
      `${afterUpload}`
    );

  } catch {
    return null;
  }
}


/* ================================================= */
/* CLOUDINARY DOWNLOAD URL                           */
/* ================================================= */

function createDownloadUrl(
  secureUrl
) {
  if (!secureUrl) {
    return null;
  }

  try {

    const uploadMarker =
      '/upload/';

    const uploadIndex =
      secureUrl.indexOf(
        uploadMarker
      );

    if (uploadIndex === -1) {
      return secureUrl;
    }

    const beforeUpload =
      secureUrl.slice(
        0,
        uploadIndex +
          uploadMarker.length
      );

    const afterUpload =
      secureUrl.slice(
        uploadIndex +
          uploadMarker.length
      );

    return (
      `${beforeUpload}` +
      `fl_attachment/` +
      `${afterUpload}`
    );

  } catch {
    return secureUrl;
  }
}


/* ================================================= */
/* WAIT FOR BACKGROUND REMOVAL                       */
/* ================================================= */

async function waitForBackgroundRemoval(
  imageUrl,
  maxAttempts = 10,
  delayMs = 3000
) {

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {

    try {

      const response =
        await fetch(
          imageUrl,
          {
            method: 'HEAD',
            cache: 'no-store',
          }
        );

      if (response.ok) {
        return true;
      }

      if (
        response.status === 423
      ) {

        if (
          attempt <
          maxAttempts
        ) {

          await sleep(
            delayMs
          );

          continue;
        }

        throw new Error(
          'Cloudinary is taking longer than expected to process the background removal. Please try again.'
        );
      }

      throw new Error(
        `Background removal failed (HTTP ${response.status}).`
      );

    } catch (error) {

      const message =
        String(
          error?.message || ''
        );

      if (
        attempt <
          maxAttempts &&
        !message.includes(
          'Background removal failed'
        )
      ) {

        await sleep(
          delayMs
        );

        continue;
      }

      throw error;
    }
  }

  throw new Error(
    'Background removal could not be completed.'
  );
}


/* ================================================= */
/* WAIT FOR GENERATED AI IMAGE                      */
/* ================================================= */

async function waitForGeneratedImage(
  imageUrl,
  maxAttempts = 12,
  delayMs = 3000
) {

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {

    try {

      const response =
        await fetch(
          imageUrl,
          {
            method: 'HEAD',
            cache: 'no-store',
          }
        );

      if (response.ok) {
        return true;
      }

      if (
        response.status === 423
      ) {

        if (
          attempt <
          maxAttempts
        ) {

          await sleep(
            delayMs
          );

          continue;
        }

        throw new Error(
          'Cloudinary is still generating the AI image. Please try again in a moment.'
        );
      }

      if (
        response.status === 404
      ) {

        if (
          attempt <
          maxAttempts
        ) {

          await sleep(
            delayMs
          );

          continue;
        }

        throw new Error(
          'The generated AI image could not be found.'
        );
      }

      throw new Error(
        `AI background generation failed (HTTP ${response.status}).`
      );

    } catch (error) {

      const message =
        String(
          error?.message || ''
        );

      if (
        attempt <
          maxAttempts &&
        !message.includes(
          'AI background generation failed'
        ) &&
        !message.includes(
          'could not be found'
        )
      ) {

        await sleep(
          delayMs
        );

        continue;
      }

      throw error;
    }
  }

  throw new Error(
    'AI background generation could not be completed.'
  );
}


/* ================================================= */
/* WAIT FOR OPTIMIZED IMAGE                          */
/* ================================================= */

async function waitForOptimizedImage(
  imageUrl,
  maxAttempts = 5,
  delayMs = 1200
) {

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {

    try {

      const response =
        await fetch(
          imageUrl,
          {
            method: 'HEAD',
            cache: 'no-store',
          }
        );

      if (response.ok) {
        return true;
      }

      if (
        response.status === 423 ||
        response.status === 404
      ) {

        if (
          attempt <
          maxAttempts
        ) {

          await sleep(
            delayMs
          );

          continue;
        }
      }

      throw new Error(
        `Image transformation failed (HTTP ${response.status}).`
      );

    } catch (error) {

      const message =
        String(
          error?.message || ''
        );

      if (
        attempt <
          maxAttempts
      ) {

        await sleep(
          delayMs
        );

        continue;
      }

      throw new Error(
        message ||
          'Image transformation failed.'
      );
    }
  }

  throw new Error(
    'Image transformation could not be completed.'
  );
}


/* ================================================= */
/* SLEEP                                             */
/* ================================================= */

function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        ms
      )
  );
}


/* ================================================= */
/* FORMAT TAG                                        */
/* ================================================= */

function formatTag(value) {

  if (!value) {
    return 'Unknown';
  }

  return String(value)
    .replace(
      /[-_]+/g,
      ' '
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


/* ================================================= */
/* FORMAT FILE SIZE                                  */
/* ================================================= */

function formatBytes(bytes) {

  if (bytes == null) {
    return null;
  }

  const size =
    Number(bytes);

  if (!Number.isFinite(size)) {
    return null;
  }

  if (
    size <
    1024
  ) {
    return `${size} B`;
  }

  if (
    size <
    1024 * 1024
  ) {
    return `${
      (
        size / 1024
      ).toFixed(1)
    } KB`;
  }

  if (
    size <
    1024 *
      1024 *
      1024
  ) {
    return `${
      (
        size /
        (1024 * 1024)
      ).toFixed(2)
    } MB`;
  }

  return `${
    (
      size /
      (1024 *
        1024 *
        1024)
    ).toFixed(2)
  } GB`;
}