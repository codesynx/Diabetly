import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface RecommendationsAccordionProps {
  recommendations: Record<string, string>;
}

/**
 * Component that displays recommendations in an accordion format
 */
const RecommendationsAccordion: React.FC<RecommendationsAccordionProps> = ({ recommendations }) => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {Object.entries(recommendations).map(([header, content], index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left font-medium hover:text-diabetly-blue transition-colors">
            {header}
          </AccordionTrigger>
          <AccordionContent className="text-gray-700">
            {content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default RecommendationsAccordion; 