import { Router } from 'express';
import { store } from '../store';
import { computeRecommendations } from '../recommendation';

const router = Router();

router.post('/match', (req, res) => {
  const {
    occasion,
    styleMood,
    size,
    maxBudget,
    city,
    eventDate,
    userMeasurements
  } = req.body;

  const allProducts = store.getProducts({ city: city || 'Chennai' });
  const matches = computeRecommendations(allProducts, {
    occasion,
    styleMood,
    size,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    city,
    eventDate,
    userMeasurements
  });

  res.json({
    success: true,
    totalMatches: matches.length,
    criteria: {
      occasion,
      styleMood,
      size,
      maxBudget,
      city,
      eventDate
    },
    bestMatch: matches.length > 0 ? matches[0] : null,
    matches
  });
});

export default router;
