import { TextShimmer } from '@/components/ui/text-shimmer';

export function TextShimmerQuestion() {
  return (
    <TextShimmer
      duration={1.2}
      className='text-xl font-medium [--base-color:theme(colors.diabetly-blue)] [--base-gradient-color:theme(colors.diabetly-skyblue)] dark:[--base-color:theme(colors.diabetly-blue)] dark:[--base-gradient-color:theme(colors.blue.400)]'
    >
      Привет! Я ИИ-консультант Diabetly. Как я могу помочь вам с анализом?
    </TextShimmer>
  );
}

export function TextShimmerTip() {
  return (
    <TextShimmer
      duration={1.8}
      className='text-sm [--base-color:theme(colors.gray.500)] [--base-gradient-color:theme(colors.gray.300)] dark:[--base-color:theme(colors.gray.400)] dark:[--base-gradient-color:theme(colors.gray.200)]'
    >
      Используйте @ чтобы выбрать анализ и задать вопрос
    </TextShimmer>
  );
} 