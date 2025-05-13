import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

export default function NewAnalysisModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    analysisType: "",
    dateRange: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose(); 
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start New Analysis</DialogTitle>
          <DialogDescription>
            Choose the type and date range for your new trade analysis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="analysisType" className="text-right">
              Analysis Type
            </Label>
            <Select
              value={formData.analysisType}
              onValueChange={(val) => handleChange("analysisType", val)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="route-optimization">Route Optimization</SelectItem>
                <SelectItem value="market-forecast">Market Forecast</SelectItem>
                <SelectItem value="cost-breakdown">Cost Breakdown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateRange" className="text-right">
              Date Range
            </Label>
            <Input
              type="date"
              id="dateRange"
              value={formData.dateRange}
              onChange={(e) => handleChange("dateRange", e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Run Analysis</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
