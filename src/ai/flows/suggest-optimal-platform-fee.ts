'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting an optimal platform fee percentage.
 *
 * The flow takes into account current product pricing, sales trends, and competitor data to
 * maximize revenue for artisans while maintaining platform profitability.
 *
 * @interface SuggestOptimalPlatformFeeInput - Input type for the suggestOptimalPlatformFee function.
 * @interface SuggestOptimalPlatformFeeOutput - Output type for the suggestOptimalPlatformFee function.
 * @function suggestOptimalPlatformFee - The main function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalPlatformFeeInputSchema = z.object({
  currentProductPricing: z
    .string()
    .describe('The current pricing of products on the platform.'),
  salesTrends: z.string().describe('Recent sales trends on the platform.'),
  competitorData: z.string().describe('Data about competitor pricing and fees.'),
});
export type SuggestOptimalPlatformFeeInput = z.infer<typeof SuggestOptimalPlatformFeeInputSchema>;

const SuggestOptimalPlatformFeeOutputSchema = z.object({
  suggestedPlatformFeePercentage: z
    .number()
    .describe(
      'The suggested platform fee percentage, as a decimal (e.g., 0.10 for 10%).'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested platform fee percentage.'),
});
export type SuggestOptimalPlatformFeeOutput = z.infer<typeof SuggestOptimalPlatformFeeOutputSchema>;

export async function suggestOptimalPlatformFee(
  input: SuggestOptimalPlatformFeeInput
): Promise<SuggestOptimalPlatformFeeOutput> {
  return suggestOptimalPlatformFeeFlow(input);
}

const suggestOptimalPlatformFeePrompt = ai.definePrompt({
  name: 'suggestOptimalPlatformFeePrompt',
  input: {schema: SuggestOptimalPlatformFeeInputSchema},
  output: {schema: SuggestOptimalPlatformFeeOutputSchema},
  prompt: `You are an expert in marketplace revenue optimization.

  Based on the following information, suggest an optimal platform fee percentage to maximize revenue for artisans while maintaining platform profitability.

  Current Product Pricing: {{{currentProductPricing}}}
  Sales Trends: {{{salesTrends}}}
  Competitor Data: {{{competitorData}}}

  Consider factors such as price elasticity of demand, competitor fees, and the need to provide a fair return to artisans.

  Respond with a JSON object that follows the schema, including your reasoning for the suggested fee percentage:
  {{ zodToJsonOutputSchema }}`,
});

const suggestOptimalPlatformFeeFlow = ai.defineFlow(
  {
    name: 'suggestOptimalPlatformFeeFlow',
    inputSchema: SuggestOptimalPlatformFeeInputSchema,
    outputSchema: SuggestOptimalPlatformFeeOutputSchema,
  },
  async input => {
    const {output} = await suggestOptimalPlatformFeePrompt(input);
    return output!;
  }
);
