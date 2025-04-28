import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarketOpportunity } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useState } from 'react';

interface MarketOpportunitiesProps {
  opportunities?: MarketOpportunity[];
}

export default function MarketOpportunities({ opportunities }: MarketOpportunitiesProps) {
  const queryClient = useQueryClient();
  const [bookmarkStates, setBookmarkStates] = useState<Record<number, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/market-opportunities"] });
    setIsRefreshing(false);
  };
  
  // Mutation for toggling bookmark status
  const bookmarkMutation = useMutation({
    mutationFn: async ({ id, isBookmarked }: { id: number, isBookmarked: boolean }) => {
      const res = await apiRequest("PUT", `/api/market-opportunities/${id}`, { isBookmarked });
      return await res.json();
    },
    onMutate: async ({ id, isBookmarked }) => {
      // Optimistically update UI
      setBookmarkStates(prev => ({ ...prev, [id]: isBookmarked }));
    },
    onSuccess: () => {
      // Invalidate and refetch 
      queryClient.invalidateQueries({ queryKey: ["/api/market-opportunities"] });
    }
  });
  
  const handleBookmarkToggle = (id: number, currentStatus: boolean) => {
    bookmarkMutation.mutate({ id, isBookmarked: !currentStatus });
  };

  // If no opportunities provided
  if (!opportunities || opportunities.length === 0) {
    return (
      <Card className="border-neutral-100">
        <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <CardTitle className="text-base font-semibold">Market Opportunities</CardTitle>
          <Button variant="outline" size="sm">Refresh</Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8 text-neutral-500">
            No market opportunities found. Check back later for new opportunities.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-neutral-100">
      <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <CardTitle className="text-base font-semibold">Market Opportunities</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <span className="material-icons animate-spin">refresh</span>
          ) : (
            'Refresh'
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opportunity) => {
            // Get the current bookmark state, either from our local state or from the original data
            const isBookmarked = bookmarkStates[opportunity.id] !== undefined 
              ? bookmarkStates[opportunity.id] 
              : opportunity.isBookmarked;
            
            return (
              <div 
                key={opportunity.id} 
                className="border border-neutral-100 rounded-lg p-4 hover:border-primary-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-1 ${
                      opportunity.potentialLevel === 'High' ? 'bg-success bg-opacity-10 text-success' :
                      opportunity.potentialLevel === 'Medium' ? 'bg-warning bg-opacity-10 text-warning' :
                      'bg-neutral-100 text-neutral-600'
                    } text-xs rounded-full`}>
                      {opportunity.potentialLevel} Potential
                    </span>
                    <h3 className="mt-2 font-medium text-neutral-800">{opportunity.title}</h3>
                  </div>
                  <button 
                    className="text-neutral-400 hover:text-neutral-600"
                    onClick={() => handleBookmarkToggle(opportunity.id, isBookmarked)}
                    disabled={bookmarkMutation.isPending}
                  >
                    <span className="material-icons">
                      {isBookmarked ? 'bookmark' : 'bookmark_border'}
                    </span>
                  </button>
                </div>
                <p className="mt-2 text-sm text-neutral-600">{opportunity.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="material-icons text-accent mr-1">trending_up</span>
                    <span className="text-sm font-medium text-accent">
                      +{opportunity.profitMargin}% Margin
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">Analyze</Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
