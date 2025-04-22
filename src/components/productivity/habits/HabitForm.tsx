
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/use-habits";
import { generateHabitSuggestion } from "@/utils/habit-ai";

interface HabitFormProps {
  onSuccess?: () => void;
}

const HabitForm: React.FC<HabitFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { addHabit } = useHabits();

  const [isLoading, setIsLoading] = useState(false);
  const [habitInput, setHabitInput] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekdays" | "weekends" | "weekly">("daily");
  const [motivation, setMotivation] = useState("");
  const [identity, setIdentity] = useState("");
  const [enhancedHabit, setEnhancedHabit] = useState("");

  const handleGenerateSuggestion = async () => {
    if (!habitInput) {
      toast({
        title: "Habit name required",
        description: "Please enter a habit name to get a suggestion",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const suggestion = await generateHabitSuggestion(habitInput, frequency, motivation, identity);
      setEnhancedHabit(suggestion);
    } catch (error) {
      toast({
        title: "Error generating suggestion",
        description: "Could not generate a habit suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const habitToSave = enhancedHabit || habitInput;
    
    if (!habitToSave) {
      toast({
        title: "Habit required",
        description: "Please enter a habit to continue",
        variant: "destructive",
      });
      return;
    }

    addHabit({
      name: habitToSave,
      frequency,
      motivation,
      identity,
      createdAt: new Date().toISOString(),
      streak: 0,
      lastCompleted: null,
    });

    toast({
      title: "Habit created",
      description: "Your new habit has been added successfully",
    });

    // Reset form
    setHabitInput("");
    setFrequency("daily");
    setMotivation("");
    setIdentity("");
    setEnhancedHabit("");

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create a New Habit</CardTitle>
        <CardDescription>
          Build identity-based habits with AI-powered suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="habit" className="text-sm font-medium">
              What habit do you want to build?
            </label>
            <Input
              id="habit"
              placeholder="e.g., meditate, read, exercise"
              value={habitInput}
              onChange={(e) => setHabitInput(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="frequency" className="text-sm font-medium">
              How often?
            </label>
            <Select 
              value={frequency} 
              onValueChange={(value: "daily" | "weekdays" | "weekends" | "weekly") => setFrequency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="motivation" className="text-sm font-medium">
              Why is this habit important to you?
            </label>
            <Textarea
              id="motivation"
              placeholder="This will help customize your habit"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="identity" className="text-sm font-medium">
              Who do you want to become? (Optional)
            </label>
            <Input
              id="identity"
              placeholder="e.g., a calm person, a healthy individual"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Identity-based habits are more likely to stick.
            </p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={handleGenerateSuggestion}
            disabled={isLoading || !habitInput}
          >
            {isLoading ? "Generating..." : "Get AI Suggestion"}
          </Button>
          
          {enhancedHabit && (
            <div className="p-4 bg-secondary/50 border border-secondary rounded-md">
              <p className="text-sm font-medium mb-1 text-primary">AI-Enhanced Habit:</p>
              <p className="text-sm font-medium">{enhancedHabit}</p>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                <div className="bg-primary/10 p-2 rounded">
                  <span className="block font-semibold">Obvious</span>
                  Clear trigger
                </div>
                <div className="bg-primary/10 p-2 rounded">
                  <span className="block font-semibold">Attractive</span>
                  Identity-based
                </div>
                <div className="bg-primary/10 p-2 rounded">
                  <span className="block font-semibold">Easy</span>
                  Small action
                </div>
                <div className="bg-primary/10 p-2 rounded">
                  <span className="block font-semibold">Satisfying</span>
                  Trackable
                </div>
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full">
            Create Habit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HabitForm;
