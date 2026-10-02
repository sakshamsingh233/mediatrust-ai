# MediaTrust AI

### AI-Powered Media Optimization and Creative Generation Platform

**Team:** Stack Raiders  
**Track:** Your Media-Savvy Startup  
**Hackathon:** HackIndia × Cloudinary

MediaTrust AI is an AI-powered media platform that helps businesses and content creators turn a single product image into optimized, analysis-ready and social-media-ready creative assets.

Instead of manually editing the same product image for different platforms, MediaTrust AI combines AI analysis with Cloudinary's media infrastructure to upload, transform, optimize, generate and deliver media from one workflow.

---

## Problem

Small businesses, sellers and content creators often need multiple versions of the same product image.

They may need:

- Background removal
- Different backgrounds
- Optimized images for faster loading
- Instagram posts
- Instagram stories
- Facebook advertisements
- Product images in different sizes

Doing this manually takes time and often requires multiple tools.

MediaTrust AI brings these steps together into one workflow.

---

## Solution

MediaTrust AI allows a user to upload a product image and process it through a complete media workflow.

### Workflow

Upload Image  
↓  
Cloudinary Upload  
↓  
AI Media Analysis  
↓  
Background Removal  
↓  
AI Background Generation  
↓  
Image Optimization  
↓  
Social Media Creative Formats  
↓  
Preview and Download

---

## Key Features

### 1. Cloudinary Media Upload

Images are uploaded directly to Cloudinary using an unsigned upload preset.

The application retrieves the Cloudinary resource information after upload.

### 2. AI Media Analysis

The uploaded image is analyzed and relevant visual tags are detected.

The application displays:

- Detected objects
- Categories
- Confidence scores
- Image information
- Cloudinary resource details

### 3. Background Removal

Users can generate a version of the uploaded image with the background removed using Cloudinary transformations.

### 4. AI Background Generation

MediaTrust AI can generate different background variations for the product image.

Example styles include:

- Luxury Studio
- Minimal White
- Lifestyle Home
- Instagram Premium

### 5. Image Optimization

The platform generates optimized versions using Cloudinary delivery transformations.

Supported optimization includes:

- Automatic format selection
- Automatic quality optimization
- WebP delivery

### 6. Social Media Creative Formats

The same media can be transformed into platform-ready formats.

Supported formats include:

| Format | Resolution |
|---|---|
| Instagram Post | 1080 × 1080 |
| Instagram Story | 1080 × 1920 |
| Facebook Ad | 1200 × 628 |
| Product Square | 1600 × 1600 |

### 7. Preview and Download

Users can preview generated media, open the transformed asset and download the final creative.

---

# Cloudinary Integration

Cloudinary is a core part of MediaTrust AI and is used throughout the media workflow.

Cloudinary is used for:

- Media upload
- Media storage
- Image delivery
- Image transformations
- Background removal
- Generative background replacement
- Automatic format optimization
- Quality optimization
- Social media transformations
- Final media delivery

The project does not use Cloudinary only as static image storage. Cloudinary actively processes and delivers the media used by the application.

---

# Example Cloudinary Workflow

A typical user workflow is:

1. User selects a product image.
2. Image is uploaded to Cloudinary.
3. Cloudinary returns the public resource information.
4. MediaTrust AI analyzes the image.
5. User can remove the background.
6. User can generate a new AI background.
7. User can optimize the image.
8. User can generate social-media-specific formats.
9. User previews the result.
10. User opens or downloads the final asset.

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript
- CSS

## Backend

- Node.js
- Express.js

## Media Infrastructure

- Cloudinary

## AI

- AI-powered image analysis
- Cloudinary generative image transformations

---

# Project Structure

```text
MediaTrust AI/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── cloudinary.js
│   │   │
│   │   ├── routes/
│   │   │   ├── analysisRoutes.js
│   │   │   ├── cloudinaryRoutes.js
│   │   │   └── healthRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── cloudinaryAnalysis.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md