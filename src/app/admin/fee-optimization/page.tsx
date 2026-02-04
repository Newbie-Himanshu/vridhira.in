
"use client";

import { useState } from 'react';
import { suggestOptimalPlatformFee, SuggestOptimalPlatformFeeOutput } from '@/ai/flows/suggest-optimal-platform-fee';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, IndianRupee, Info, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function FeeOptimizationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SuggestOptimalPlatformFeeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    currentProductPricing: "Average basket size $45-$120. Artisans expect 85% return.",
    salesTrends: "Q1 growth was 15%. Luxury silk items saw a 30% surge in demand.",
    competitorData: "ArtisansHub charges 12%, CraftIndia charges 8.5% with higher monthly listing fees."
  });

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const output = await suggestOptimalPlatformFee(formData);
      setResult(output);
    } catch (err) {
      setError("Failed to generate suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold text-secondary flex items-center gap-2">
          <Wand2 className="h-8 w-8 text-primary" />
          AI Fee Optimizer
        </h1>
        <p className="text-muted-foreground">Maximize artisan revenue and platform sustainability using Generative AI market analysis.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Market Context</CardTitle>
            <CardDescription>Provide current market data to inform the AI model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pricing">Current Product Pricing</Label>
              <Textarea
                id="pricing"
                placeholder="Describe current price ranges..."
                value={formData.currentProductPricing}
                onChange={(e) => setFormData({ ...formData, currentProductPricing: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trends">Sales Trends</Label>
              <Textarea
                id="trends"
                placeholder="Describe recent sales performance..."
                value={formData.salesTrends}
                onChange={(e) => setFormData({ ...formData, salesTrends: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitors">Competitor Data</Label>
              <Textarea
                id="competitors"
                placeholder="Competitor fee structures and pricing..."
                value={formData.competitorData}
                onChange={(e) => setFormData({ ...formData, competitorData: e.target.value })}
                className="bg-background"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSuggest}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Market Data...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Optimization Suggestion
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card className="artisan-pattern bg-secondary text-secondary-foreground border-none shadow-xl animate-in fade-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                <TrendingUp className="h-6 w-6 text-primary" />
                Optimal Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-6 bg-white/10 rounded-xl">
                <span className="text-sm font-medium uppercase tracking-wider opacity-80">Suggested Platform Fee</span>
                <span className="text-6xl font-bold text-primary">{(result.suggestedPlatformFeePercentage * 100).toFixed(1)}%</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Info className="h-4 w-4 text-primary" />
                  Strategic Reasoning
                </div>
                <p className="text-secondary-foreground/90 leading-relaxed italic">
                  "{result.reasoning}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span>Fee competitive vs. market</span>
                  <span className="text-primary font-bold">Excellent</span>
                </div>
                <Progress value={85} className="h-2 bg-white/20" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full bg-white text-secondary hover:bg-white/90 border-none font-bold">
                Apply Fee Percentage
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
