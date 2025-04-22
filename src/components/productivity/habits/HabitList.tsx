
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";
import { useHabits } from "@/hooks/use-habits";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Habit } from "@/types/habit";

const HabitList: React.FC = () => {
  const { habits, toggleHabitCompletion, removeHabit } = useHabits();

  if (habits.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-6 text-muted-foreground">
            <p>You haven't created any habits yet.</p>
            <p className="text-sm mt-1">Create your first habit to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Habits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitItem 
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabitCompletion(habit.id)}
              onRemove={() => removeHabit(habit.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface HabitItemProps {
  habit: Habit;
  onToggle: () => void;
  onRemove: () => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, onToggle, onRemove }) => {
  const isCompletedToday = habit.lastCompleted ? 
    new Date(habit.lastCompleted).toDateString() === new Date().toDateString() : false;

  return (
    <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
      <div className="flex items-center gap-3">
        <button onClick={onToggle} className="focus:outline-none">
          {isCompletedToday ? (
            <CheckCircle className="h-6 w-6 text-primary" />
          ) : (
            <Circle className="h-6 w-6 text-muted-foreground" />
          )}
        </button>
        <div>
          <p className={cn(
            "font-medium",
            isCompletedToday && "line-through text-muted-foreground"
          )}>
            {habit.name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
              {habit.frequency}
            </span>
            {habit.streak > 0 && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                🔥 {habit.streak} day{habit.streak !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        Remove
      </Button>
    </div>
  );
};

export default HabitList;
