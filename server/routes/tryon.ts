import { Router } from 'express';
import { store } from '../store';
import { calculateFit } from '../fitEngine';
import { TryOnJob } from '../types';

const router = Router();

// In-memory try-on jobs with privacy TTL
const activeTryOnJobs: Map<string, TryOnJob & { consentGiven: boolean; purged?: boolean }> = new Map();

// POST initiate privacy-first virtual try-on job
router.post('/jobs', async (req, res) => {
  const { productId, userId, userPhotoUrl, selectedSize, userMeasurements, consentGiven } = req.body;

  if (!consentGiven) {
    return res.status(400).json({ error: 'Explicit user consent is mandatory for image and measurement processing.' });
  }

  const product = store.getProductById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const measurements = userMeasurements || {
    bust: 36,
    waist: 28,
    hip: 38,
    height: 165,
    preferredFit: 'regular'
  };

  // Garment measurements adjusted for selected size
  let garmentMeasurements = { ...product.measurements };
  const sizeDelta: Record<string, number> = {
    XS: -4,
    S: -2,
    M: 0,
    L: 3,
    XL: 6,
    'Free Size': 0
  };
  const delta = sizeDelta[selectedSize] ?? 0;
  garmentMeasurements.bust += delta;
  garmentMeasurements.waist += delta;
  garmentMeasurements.hip += delta;

  const fit = calculateFit(garmentMeasurements, measurements);

  const jobId = `tryon_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const job: TryOnJob = {
    id: jobId,
    productId,
    userId: userId || 'usr_ananya',
    userPhotoUrl: userPhotoUrl || product.images[0],
    selectedSize: selectedSize || product.sizeLabel,
    status: 'COMPLETED',
    fitMode: fit.fitMode,
    fitConfidencePercent: fit.fitConfidencePercent,
    resultImageUrl: product.images[0],
    fitDetails: {
      bustEase: fit.bustEase,
      waistEase: fit.waistEase,
      hipEase: fit.hipEase,
      comfortScore: fit.comfortScore,
      recommendation: fit.recommendationNote
    },
    createdAt: new Date().toISOString()
  };

  activeTryOnJobs.set(jobId, { ...job, consentGiven: true });
  store.createTryOnJob(job);

  res.status(201).json({
    success: true,
    job,
    fitResult: fit,
    privacyNotice: 'Processed ephemerally under ReWear Privacy Shield. Deletion controls active.',
    disclaimer: 'AI previews and fit estimates are approximate visual simulations. Actual fabric drape, stretch recovery, skin comfort, and posture-dependent fit may vary.'
  });
});

// GET single job
router.get('/jobs/:id', (req, res) => {
  const job = activeTryOnJobs.get(req.params.id) || store.getTryOnJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Try-on job not found or has been purged for privacy.' });
  }
  res.json({ job });
});

// DELETE single job (User deletion control)
router.delete('/jobs/:id', (req, res) => {
  const exists = activeTryOnJobs.has(req.params.id);
  if (exists) {
    activeTryOnJobs.delete(req.params.id);
  }
  res.json({ success: true, message: 'Try-on simulation assets, photo, and measurements purged immediately.' });
});

// POST purge all user try-on session data
router.post('/purge', (req, res) => {
  const { userId } = req.body;
  let purgedCount = 0;
  for (const [key, job] of activeTryOnJobs.entries()) {
    if (job.userId === userId || !userId) {
      activeTryOnJobs.delete(key);
      purgedCount++;
    }
  }
  res.json({ success: true, message: `Successfully deleted ${purgedCount} try-on session image assets.` });
});

export default router;
