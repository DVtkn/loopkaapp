import React from 'react';
import { CoupleRatingWidget } from './CoupleRatingWidget';

interface RelationshipTemperatureProps {
  onNavigateToTests?: () => void;
  onNavigateToDates?: () => void;
  onNavigateToChat?: () => void;
  className?: string;
}

export const RelationshipTemperature: React.FC<RelationshipTemperatureProps> = (props) => {
  return <CoupleRatingWidget {...props} />;
};

export default CoupleRatingWidget;
