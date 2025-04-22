"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Clock, Brain, Zap, Lightbulb, BarChart2, Repeat, Workflow } from "lucide-react"

export default function ProductivityTipsPage() {
  const [activeTab, setActiveTab] = useState("time-management")

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Productivity Tips & Techniques</h1>
        <p className="text-muted-foreground">
          Science-backed strategies to boost your productivity and achieve more with less effort.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-7 h-auto">
          <TabsTrigger value="time-management" className="flex flex-col py-2 h-auto">
            <Clock className="h-4 w-4 mb-1" />
            <span className="text-xs">Time</span>
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex flex-col py-2 h-auto">
            <Brain className="h-4 w-4 mb-1" />
            <span className="text-xs">Focus</span>
          </TabsTrigger>
          <TabsTrigger value="energy" className="flex flex-col py-2 h-auto">
            <Zap className="h-4 w-4 mb-1" />
            <span className="text-xs">Energy</span>
          </TabsTrigger>
          <TabsTrigger value="decision-making" className="flex flex-col py-2 h-auto">
            <Lightbulb className="h-4 w-4 mb-1" />
            <span className="text-xs">Decisions</span>
          </TabsTrigger>
          <TabsTrigger value="systems" className="flex flex-col py-2 h-auto">
            <BarChart2 className="h-4 w-4 mb-1" />
            <span className="text-xs">Systems</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex flex-col py-2 h-auto">
            <Repeat className="h-4 w-4 mb-1" />
            <span className="text-xs">Habits</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex flex-col py-2 h-auto">
            <Workflow className="h-4 w-4 mb-1" />
            <span className="text-xs">Automation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="time-management">
          <Card>
            <CardHeader>
              <CardTitle>Time Management Techniques</CardTitle>
              <CardDescription>
                Optimize how you allocate your time to maximize productivity and minimize waste.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="pomodoro">
                  <AccordionTrigger>The Pomodoro Technique</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late
                        1980s. It uses a timer to break work into intervals, traditionally 25 minutes in length,
                        separated by short breaks.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Choose a task to be accomplished</li>
                        <li>Set the Pomodoro timer (traditionally to 25 minutes)</li>
                        <li>Work on the task until the timer rings</li>
                        <li>Take a short break (5 minutes)</li>
                        <li>After four pomodoros, take a longer break (15-30 minutes)</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Research shows that regular breaks improve mental agility. The technique leverages our natural
                        attention spans and provides a structured approach to deep work while preventing burnout.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="timeblocking">
                  <AccordionTrigger>Time Blocking</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Time blocking is a time management method that involves dividing your day into blocks of time,
                        each dedicated to accomplishing a specific task or group of tasks.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Start by identifying your most important tasks</li>
                        <li>Estimate how long each task will take</li>
                        <li>Schedule specific time blocks in your calendar</li>
                        <li>Include buffer time between blocks for unexpected issues</li>
                        <li>Review and adjust your time blocks regularly</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Time blocking helps combat Parkinson's Law (work expands to fill the time available) and reduces
                        context switching, which research shows can reduce productivity by up to 40%.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="eisenhower">
                  <AccordionTrigger>Eisenhower Matrix</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        The Eisenhower Matrix, also known as the Urgent-Important Matrix, helps you prioritize tasks
                        based on their urgency and importance.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>
                          Divide tasks into four quadrants:
                          <ul className="list-disc list-inside ml-5">
                            <li>Urgent & Important: Do immediately</li>
                            <li>Important but Not Urgent: Schedule time</li>
                            <li>Urgent but Not Important: Delegate</li>
                            <li>Neither Urgent nor Important: Eliminate</li>
                          </ul>
                        </li>
                        <li>Focus most of your energy on the "Important but Not Urgent" quadrant</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        This method helps combat urgency bias, where we tend to prioritize urgent tasks over important
                        ones, even when the important tasks contribute more to long-term goals and success.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus">
          <Card>
            <CardHeader>
              <CardTitle>Focus Enhancement Strategies</CardTitle>
              <CardDescription>
                Techniques to improve concentration and maintain deep focus during work sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="deepwork">
                  <AccordionTrigger>Deep Work Protocol</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Deep Work, coined by Cal Newport, is the ability to focus without distraction on a cognitively
                        demanding task. It's the state where you produce your highest quality and most valuable work.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Schedule deep work sessions in advance</li>
                        <li>Create a distraction-free environment</li>
                        <li>Set clear objectives for each session</li>
                        <li>Start with 1-hour blocks and gradually increase</li>
                        <li>Develop rituals to transition into deep work mode</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Neurologically, deep work engages the prefrontal cortex in a state of flow. Research shows that
                        it takes about 23 minutes to refocus after a distraction, making uninterrupted time crucial.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="mindfulness">
                  <AccordionTrigger>Mindfulness Practices</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Mindfulness involves bringing your attention to the present moment, which can significantly
                        improve focus and reduce stress.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Start with short (5-10 minute) daily meditation sessions</li>
                        <li>Practice focused attention on your breath or a specific object</li>
                        <li>When your mind wanders, gently bring it back</li>
                        <li>Incorporate mindful moments throughout your workday</li>
                        <li>Use apps like Headspace or Calm for guided sessions</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Studies show that regular mindfulness practice can physically change brain structure, increasing
                        gray matter in areas associated with focus, emotional regulation, and learning.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="singletasking">
                  <AccordionTrigger>Single-Tasking Method</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Single-tasking is the practice of focusing on one task at a time, as opposed to multitasking,
                        which has been shown to reduce productivity.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Choose one task to focus on</li>
                        <li>Close all unrelated applications and tabs</li>
                        <li>Set a specific timeframe for working on just that task</li>
                        <li>Use physical cues to signal focus time to others</li>
                        <li>Take breaks between different tasks, not during them</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Neuroscience research confirms that the brain cannot effectively perform two cognitively
                        demanding tasks simultaneously. What we call "multitasking" is actually rapid task-switching,
                        which depletes neural resources.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy">
          <Card>
            <CardHeader>
              <CardTitle>Energy Management</CardTitle>
              <CardDescription>
                Strategies to optimize your physical and mental energy throughout the day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="ultradian">
                  <AccordionTrigger>Ultradian Rhythms</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Ultradian rhythms are natural cycles that occur throughout the day, typically lasting 90-120
                        minutes, followed by a 20-30 minute period of lower energy.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Work in 90-minute focused sessions</li>
                        <li>Take a 20-30 minute break after each session</li>
                        <li>Schedule demanding tasks during your peak energy periods</li>
                        <li>Use breaks for movement, hydration, and mental rest</li>
                        <li>Track your energy levels to identify your personal patterns</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Research on ultradian rhythms shows that our brains naturally cycle between higher and lower
                        alertness. Working with these cycles rather than against them can significantly improve
                        productivity and reduce fatigue.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="exercise">
                  <AccordionTrigger>Strategic Exercise</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Physical activity has been shown to significantly boost cognitive function, focus, and energy
                        levels.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Incorporate 20-30 minutes of moderate exercise daily</li>
                        <li>Use short movement breaks (5-10 minutes) between work sessions</li>
                        <li>Try morning exercise to boost alertness throughout the day</li>
                        <li>Consider walking meetings for low-intensity movement</li>
                        <li>Use exercise strategically before challenging mental tasks</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Exercise increases blood flow to the brain, promotes the release of BDNF (brain-derived
                        neurotrophic factor), and triggers the release of endorphins, all of which enhance cognitive
                        function and energy levels.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="nutrition">
                  <AccordionTrigger>Cognitive Nutrition</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        What you eat directly impacts your energy levels, focus, and cognitive performance throughout
                        the day.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Eat smaller, more frequent meals to maintain stable blood sugar</li>
                        <li>Include protein with each meal to improve alertness</li>
                        <li>Stay hydrated (even mild dehydration impairs cognitive function)</li>
                        <li>Limit high-glycemic carbohydrates that cause energy crashes</li>
                        <li>Consider strategic caffeine consumption (200mg, 30 minutes before focused work)</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Research shows that blood glucose fluctuations affect cognitive performance, while certain
                        nutrients (omega-3 fatty acids, antioxidants, and B vitamins) support optimal brain function and
                        energy metabolism.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decision-making">
          <Card>
            <CardHeader>
              <CardTitle>Decision-Making Frameworks</CardTitle>
              <CardDescription>
                Techniques to make better decisions with less mental effort and cognitive load.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="twominute">
                  <AccordionTrigger>The Two-Minute Rule</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        The Two-Minute Rule states that if a task will take less than two minutes to complete, you
                        should do it immediately rather than scheduling it for later.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>When you encounter a new task, quickly estimate if it will take less than two minutes</li>
                        <li>If yes, do it immediately without adding it to your task list</li>
                        <li>If no, schedule it appropriately or delegate it</li>
                        <li>Apply this rule to emails, messages, and small administrative tasks</li>
                        <li>Adjust the time threshold based on your workflow (some prefer a 5-minute rule)</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        This rule reduces decision fatigue and the cognitive load of tracking small tasks. It also
                        prevents the accumulation of "small but important" tasks that can create mental clutter.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="regretminimization">
                  <AccordionTrigger>Regret Minimization Framework</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        This framework, popularized by Jeff Bezos, involves projecting yourself to age 80 and
                        considering which decision would minimize your regrets looking back on your life.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Identify the decision you need to make</li>
                        <li>Imagine yourself at age 80, looking back on this moment</li>
                        <li>Ask: "Will I regret not taking this opportunity?"</li>
                        <li>Consider both action and inaction regrets</li>
                        <li>Choose the path that minimizes potential future regret</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Research on end-of-life regrets shows people more often regret things they didn't do rather than
                        things they did. This framework leverages temporal distance to reduce short-term bias in
                        decision-making.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="decisionjournal">
                  <AccordionTrigger>Decision Journal</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        A decision journal is a systematic way to record important decisions, your reasoning, expected
                        outcomes, and later review the actual results.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Create a template with: decision, date, current mental/physical state</li>
                        <li>Record the situation, your options, and your decision</li>
                        <li>Document your reasoning and expected outcomes</li>
                        <li>Set a future date to review the actual outcome</li>
                        <li>Regularly review past decisions to identify patterns and improve your process</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Decision journals combat hindsight bias (the tendency to believe we predicted outcomes better
                        than we actually did) and help identify systematic errors in our decision-making process.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Systems</CardTitle>
              <CardDescription>
                Comprehensive frameworks to organize your work and manage your tasks effectively.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="gtd">
                  <AccordionTrigger>Getting Things Done (GTD)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        GTD is a productivity methodology created by David Allen that focuses on capturing all tasks and
                        commitments out of your mind and into a reliable system.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Capture everything that has your attention in a trusted system</li>
                        <li>Clarify what each item means and what action is required</li>
                        <li>Organize actions into appropriate categories</li>
                        <li>Reflect regularly to keep your system current</li>
                        <li>Engage with your tasks based on context, time available, energy, and priority</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        GTD leverages the psychological principle of the "Zeigarnik effect" - the tendency for
                        uncompleted tasks to occupy our mental bandwidth. By capturing tasks externally, we free up
                        cognitive resources.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bullet">
                  <AccordionTrigger>Bullet Journal Method</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        The Bullet Journal (BuJo) is an analog organization system created by Ryder Carroll that
                        combines planning, journaling, and task management in a customizable notebook format.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Create an index to locate content easily</li>
                        <li>Set up future, monthly, and daily logs</li>
                        <li>Use rapid logging with bullets for tasks, events, and notes</li>
                        <li>Implement migration to move unfinished tasks forward</li>
                        <li>Add custom collections for specific projects or areas of focus</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Research shows that handwriting engages different neural pathways than typing, potentially
                        improving retention and processing. The act of migration also forces regular review and
                        prioritization.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="zettelkasten">
                  <AccordionTrigger>Zettelkasten Method</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        The Zettelkasten (slip-box) is a knowledge management system developed by Niklas Luhmann that
                        focuses on connecting ideas rather than categorizing them.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Create atomic notes (one idea per note)</li>
                        <li>Give each note a unique identifier</li>
                        <li>Link notes to related ideas</li>
                        <li>Add entry points through an index or structure notes</li>
                        <li>Regularly review and connect new information to existing notes</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        The Zettelkasten method mirrors how our brains create neural connections, leveraging associative
                        thinking rather than hierarchical organization, which can lead to unexpected insights and
                        creativity.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits">
          <Card>
            <CardHeader>
              <CardTitle>Habit Formation</CardTitle>
              <CardDescription>Strategies to build consistent productive behaviors and routines.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="habitstacking">
                  <AccordionTrigger>Habit Stacking</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Habit stacking involves linking a new habit you want to form with an existing habit you already
                        do consistently.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Identify a current habit that you perform consistently</li>
                        <li>Choose a new habit you want to develop that takes less than 2 minutes</li>
                        <li>Create an implementation intention: "After [current habit], I will [new habit]"</li>
                        <li>Start small and gradually increase complexity</li>
                        <li>Use visual reminders at the location of the existing habit</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Habit stacking leverages the neural networks of existing habits, using them as triggers for new
                        behaviors. This reduces the activation energy needed to start a new habit and increases
                        consistency.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="temptationbundling">
                  <AccordionTrigger>Temptation Bundling</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Temptation bundling, coined by Katherine Milkman, involves pairing an activity you need to do
                        but may avoid with an activity you enjoy and look forward to.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Identify tasks you tend to procrastinate on</li>
                        <li>List activities, treats, or indulgences you enjoy</li>
                        <li>Create pairs: "Only [enjoyable activity] while [necessary task]"</li>
                        <li>Set clear rules about when you can access the reward</li>
                        <li>Start with high-value rewards for difficult habits</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        This technique leverages immediate rewards to overcome present bias (our tendency to value
                        immediate rewards over future benefits), making it easier to engage in behaviors with delayed
                        gratification.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="habittracking">
                  <AccordionTrigger>Habit Tracking</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Habit tracking involves recording each successful completion of a habit, creating a visual chain
                        of progress.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Choose a simple tracking method (app, journal, calendar)</li>
                        <li>Mark each day you complete your habit</li>
                        <li>Focus on maintaining your streak ("Don't break the chain")</li>
                        <li>Track only 1-3 habits at a time to avoid overwhelm</li>
                        <li>Include a recovery protocol for when you miss a day</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Habit tracking provides visual progress feedback, leverages the endowed progress effect (we're
                        more motivated when we can see progress), and creates accountability through measurement.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automation Strategies</CardTitle>
              <CardDescription>Techniques to automate repetitive tasks and streamline your workflow.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="batching">
                  <AccordionTrigger>Task Batching</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Task batching involves grouping similar tasks together and completing them in a dedicated time
                        block to reduce context switching and improve efficiency.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Identify tasks that require similar tools, mental states, or environments</li>
                        <li>Group these tasks together in your schedule</li>
                        <li>Allocate specific time blocks for each batch</li>
                        <li>Process batches when your energy aligns with the task requirements</li>
                        <li>Minimize interruptions during batching sessions</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Research shows that context switching can cost up to 40% of productive time. Batching reduces
                        the cognitive load of task-switching and leverages the benefits of focused attention.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="templates">
                  <AccordionTrigger>Templating Systems</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Templating involves creating standardized formats for recurring tasks, communications, or
                        documents to reduce decision fatigue and ensure consistency.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Identify recurring tasks or communications in your workflow</li>
                        <li>Create standardized templates with placeholders for variable information</li>
                        <li>Store templates in an easily accessible location</li>
                        <li>Refine templates based on feedback and results</li>
                        <li>Consider using text expansion tools for quick template insertion</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Templates reduce cognitive load by eliminating the need to recreate structure for recurring
                        tasks. This frees up mental resources for the unique aspects of each task that require
                        creativity or critical thinking.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="workflows">
                  <AccordionTrigger>Automated Workflows</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>
                        Automated workflows use technology to connect apps and services, triggering actions
                        automatically when certain conditions are met.
                      </p>
                      <h4 className="font-medium">How to implement:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Identify repetitive processes in your work</li>
                        <li>Break down each process into trigger events and resulting actions</li>
                        <li>Use automation tools (Zapier, IFTTT, Power Automate) to connect services</li>
                        <li>Start with simple automations and gradually increase complexity</li>
                        <li>Regularly audit your automations to ensure they're still relevant</li>
                      </ol>
                      <h4 className="font-medium">Science behind it:</h4>
                      <p>
                        Automation eliminates decision points and manual interventions, reducing both the cognitive load
                        of task management and the potential for human error in repetitive processes.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
