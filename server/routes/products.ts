import { Router } from 'express';
import { store } from '../store';
import { calculateFit } from '../fitEngine';

const router = Router();

// GET all products with filtering
router.get('/', (req, res) => {
  const { category, occasion, styleMood, size, maxBudget, city, search, premiumOnly, sellerId } = req.query;

  const products = store.getProducts({
    category: category ? String(category) : undefined,
    occasion: occasion ? String(occasion) : undefined,
    styleMood: styleMood ? String(styleMood) : undefined,
    size: size ? String(size) : undefined,
    maxBudget: maxBudget ? Number(maxBudget) : undefined,
    city: city ? String(city) : undefined,
    search: search ? String(search) : undefined,
    premiumOnly: premiumOnly === 'true',
    sellerId: sellerId ? String(sellerId) : undefined
  });

  res.json({ products, total: products.length });
});

// GET single product
router.get('/:id', (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

// POST check fit for product
router.post('/:id/fit-check', (req, res) => {
  const product = store.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { bust, waist, hip, height, preferredFit } = req.body;
  const userMeasurements = {
    bust: Number(bust) || 36,
    waist: Number(waist) || 28,
    hip: Number(hip) || 38,
    height: Number(height) || 165,
    preferredFit: preferredFit || 'regular'
  };

  const fitResult = calculateFit(product.measurements, userMeasurements);
  res.json({ success: true, fitResult, productMeasurements: product.measurements });
});

// POST create listing
router.post('/', (req, res) => {
  const body = req.body;
  if (!body.title || !body.category || !body.rentalPrice3Days) {
    return res.status(400).json({ error: 'Missing mandatory listing fields' });
  }

  const product = store.createProduct({
    productCode: body.productCode || `REW-${Math.floor(1000 + Math.random() * 9000)}`,
    title: body.title,
    category: body.category,
    brand: body.brand || 'Local Boutique',
    colour: body.colour || 'Classic',
    fabric: body.fabric || 'Premium Blend',
    sizeLabel: body.sizeLabel || 'M',
    rentalPricePerDay: Number(body.rentalPricePerDay) || Math.round(Number(body.rentalPrice3Days) / 3),
    rentalPrice3Days: Number(body.rentalPrice3Days),
    purchasePrice: body.purchasePrice ? Number(body.purchasePrice) : undefined,
    retailValue: Number(body.retailValue) || Number(body.rentalPrice3Days) * 10,
    refundableDeposit: Number(body.refundableDeposit) || Number(body.rentalPrice3Days) * 1.5,
    condition: body.condition || 'Excellent',
    lifecycleStatus: 'AVAILABLE',
    city: body.city || 'Chennai',
    locality: body.locality || 'T. Nagar',
    approxDistanceKm: Number(body.approxDistanceKm) || 2.5,
    premiumTier: body.premiumTier || 'STANDARD',
    sellerId: body.sellerId || 'usr_kavita_b2c',
    sellerName: body.sellerName || 'Verified Wardrobe',
    sellerRating: 5.0,
    sellerVerified: true,
    images: body.images && body.images.length > 0 ? body.images : [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'
    ],
    description: body.description || 'Pre-loved designer occasionwear in pristine condition.',
    occasion: Array.isArray(body.occasion) ? body.occasion : ['Party', 'Farewell'],
    styleMood: Array.isArray(body.styleMood) ? body.styleMood : ['Glam', 'Elegant'],
    measurements: body.measurements || {
      bust: 36,
      waist: 28,
      hip: 38,
      shoulder: 14.5,
      length: 50,
      stretchLevel: 'Low'
    },
    fitNotes: body.fitNotes || 'Standard true to size cut.',
    protectionAvailable: body.protectionAvailable ?? true,
    protectionPrice: body.protectionPrice ? Number(body.protectionPrice) : 79,
    pickupAvailable: body.pickupAvailable ?? true,
    deliveryAvailable: body.deliveryAvailable ?? true,
    deliveryCharge: body.deliveryCharge ? Number(body.deliveryCharge) : 100
  });

  res.status(201).json({ success: true, product });
});

// POST retire listing
router.post('/:id/retire', (req, res) => {
  const { reason, actorId } = req.body;
  const product = store.retireProduct(req.params.id, actorId || 'SYSTEM', reason || 'Retired after lifecycle threshold');
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, product });
});

// POST AI Smart Listing Assistant
router.post('/ai-suggest', (req, res) => {
  const { title, category, description, retailValue } = req.body;

  // Smart algorithmic heuristics to assist seller
  const estRetail = Number(retailValue) || 12000;
  const suggested3DayRental = Math.round(estRetail * 0.08); // 8% of retail for 3 days
  const suggestedPerDay = Math.round(suggested3DayRental / 2.8);
  const suggestedDeposit = Math.round(suggested3DayRental * 1.5);
  const suggestedProtection = Math.round(suggested3DayRental * 0.12);

  res.json({
    suggested3DayRental,
    suggestedPerDay,
    suggestedDeposit,
    suggestedProtection,
    suggestedOccasions: ['Farewell', 'Wedding', 'Cocktail Party', 'Photoshoot'],
    suggestedStyleMood: ['Glam', 'Modern Traditional', 'Couture'],
    descriptionSummary: description ? `${description.slice(0, 100)}...` : 'Luxury occasion piece in immaculate condition.'
  });
});

export default router;
