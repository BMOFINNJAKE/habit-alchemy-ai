
import React from "react";
import HabitForm from "./HabitForm";
import HabitList from "./HabitList";

const HabitDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Habit Alchemy</h1>
        <p className="mt-2 text-muted-foreground">
          Transform simple habits into powerful routines with AI guidance
        </p>
        <div className="mt-4 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-sm">
            <div className="bg-primary/5 p-2 rounded-md">
              <span className="font-semibold block">Make it Obvious</span>
              Clear implementation cues
            </div>
            <div className="bg-primary/5 p-2 rounded-md">
              <span className="font-semibold block">Make it Attractive</span>
              Identity-based motivation
            </div>
            <div className="bg-primary/5 p-2 rounded-md">
              <span className="font-semibold block">Make it Easy</span>
              Small, achievable steps
            </div>
            <div className="bg-primary/5 p-2 rounded-md">
              <span className="font-semibold block">Make it Satisfying</span>
              Track streaks, celebrate wins
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <HabitForm />
        </div>
        <div>
          <HabitList />
        </div>
      </div>
    </div>
  );
};

export default HabitDashboard;
