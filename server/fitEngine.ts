import { GarmentMeasurements, UserMeasurements, FitMode } from './types';

export interface FitCalculationResult {
  fitMode: FitMode;
  fitConfidencePercent: number;
  comfortScore: number; // 0 to 100
  bustEase: number;
  waistEase: number;
  hipEase: number;
  isRecommended: boolean;
  recommendationNote: string;
  comparisonDetails: {
    bustStatus: string;
    waistStatus: string;
    hipStatus: string;
  };
}

export function calculateFit(
  garment: GarmentMeasurements,
  user: UserMeasurements
): FitCalculationResult {
  const bustEase = Number((garment.bust - user.bust).toFixed(1));
  const waistEase = Number((garment.waist - user.waist).toFixed(1));
  const hipEase = Number((garment.hip - user.hip).toFixed(1));

  // Minimum allowed ease depending on stretch
  let minAllowedEase = 0.5;
  if (garment.stretchLevel === 'High') minAllowedEase = -2.0;
  else if (garment.stretchLevel === 'Medium') minAllowedEase = -1.0;
  else if (garment.stretchLevel === 'Low') minAllowedEase = 0.0;
  else minAllowedEase = 0.5; // None

  // Check if unwearable (too small)
  if (bustEase < minAllowedEase || waistEase < minAllowedEase) {
    return {
      fitMode: 'NOT_RECOMMENDED',
      fitConfidencePercent: 35,
      comfortScore: 28,
      bustEase,
      waistEase,
      hipEase,
      isRecommended: false,
      recommendationNote: 'Garment measurements are smaller than body measurements for this size. We recommend sizing up.',
      comparisonDetails: {
        bustStatus: bustEase < minAllowedEase ? 'Too tight' : 'Fits',
        waistStatus: waistEase < minAllowedEase ? 'Too tight' : 'Fits',
        hipStatus: hipEase < minAllowedEase ? 'Too tight' : 'Fits'
      }
    };
  }

  // Calculate fit mode
  let fitMode: FitMode = 'REGULAR';
  let comfortScore = 92;
  let fitConfidence = 94;

  const avgEase = (bustEase + waistEase + hipEase) / 3;

  if (avgEase <= 0.8) {
    fitMode = 'SNUG';
    comfortScore = 82;
    fitConfidence = 88;
  } else if (avgEase <= 1.8) {
    fitMode = 'FITTED';
    comfortScore = 90;
    fitConfidence = 96;
  } else if (avgEase <= 3.2) {
    fitMode = 'REGULAR';
    comfortScore = 96;
    fitConfidence = 95;
  } else if (avgEase <= 5.0) {
    fitMode = 'RELAXED';
    comfortScore = 91;
    fitConfidence = 89;
  } else {
    fitMode = 'OVERSIZED';
    comfortScore = 80;
    fitConfidence = 82;
  }

  const recommendationNote = `This piece provides ${bustEase > 0 ? `+${bustEase}"` : `${bustEase}"`} ease around the bust and ${waistEase > 0 ? `+${waistEase}"` : `${waistEase}"`} at the waist, delivering a flattering ${fitMode.toLowerCase()} silhouette.`;

  return {
    fitMode,
    fitConfidencePercent: fitConfidence,
    comfortScore,
    bustEase,
    waistEase,
    hipEase,
    isRecommended: true,
    recommendationNote,
    comparisonDetails: {
      bustStatus: `${bustEase > 0 ? '+' : ''}${bustEase}" ease (${bustEase >= 1 ? 'Optimal drape' : 'Close fit'})`,
      waistStatus: `${waistEase > 0 ? '+' : ''}${waistEase}" ease (${waistEase >= 1 ? 'Comfortable' : 'Fitted band'})`,
      hipStatus: `${hipEase > 0 ? '+' : ''}${hipEase}" ease (Fluid flow)`
    }
  };
}
