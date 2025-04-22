"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { MessageSquare, User, FileText } from "lucide-react"

// Import components
import { MentorCard } from "@/components/dropshipping/mentor-card"
import { ChatInterface } from "@/components/dropshipping/chat-interface"
import { MentorSelection } from "@/components/dropshipping/mentor-selection"
import { ResourceSection } from "@/components/dropshipping/resource-section"
import { ResourceViewer } from "@/components/dropshipping/resource-viewer"
import { SelectedMentorCard } from "@/components/dropshipping/selected-mentor-card"

// Import types
import type { Mentor, ChatMessage, Resource } from "@/components/dropshipping/types"

export default function DropshippingTool() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("chat")
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [showMentorDialog, setShowMentorDialog] = useState(false)
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [showResourceViewer, setShowResourceViewer] = useState(false)

  // Get the selected mentor object
  const selectedMentor = mentors.find((m) => m.id === selectedMentorId) || null

  // Load saved data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const selectedMentorData = localStorage.getItem("dropshipping_selected_mentor")
        if (selectedMentorData) {
          setSelectedMentorId(selectedMentorData)
        }

        const chatHistoryData = localStorage.getItem("dropshipping_chat_history")
        if (chatHistoryData) {
          setChatHistory(JSON.parse(chatHistoryData))
        }
      } catch (error) {
        console.error("Error loading saved data:", error)
      }
    }

    loadSavedData()
  }, [])

  // Save data to localStorage when it changes
  useEffect(() => {
    if (selectedMentorId) {
      localStorage.setItem("dropshipping_selected_mentor", selectedMentorId)
    }
  }, [selectedMentorId])

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("dropshipping_chat_history", JSON.stringify(chatHistory))
    }
  }, [chatHistory])

  // Handle mentor selection
  const handleSelectMentor = (mentorId: string) => {
    setSelectedMentorId(mentorId)
    setShowMentorDialog(false)

    toast({
      title: "Mentor Selected",
      description: `You're now learning from ${mentors.find((m) => m.id === mentorId)?.name || ""}`,
    })

    // Add system message to chat if it's empty
    const mentor = mentors.find((m) => m.id === mentorId)
    if (mentor && chatHistory.length === 0) {
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "system",
        content: `You're now chatting with an AI assistant trained on ${mentor.name}'s dropshipping strategies. Ask anything about ${mentor.specialty} or general dropshipping questions.`,
        timestamp: new Date().toISOString(),
      }
      setChatHistory([systemMessage])
    }
  }

  // Handle viewing a resource
  const handleViewResource = (resourceId: string) => {
    const resource = [...beginnerResources, ...advancedResources].find((r) => r.id === resourceId) || null
    setSelectedResource(resource)
    setShowResourceViewer(true)
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-2">Dropshipping AI Assistant</h1>
      <p className="text-muted-foreground mb-6">Learn and implement strategies from top dropshipping experts</p>

      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="mentor">
            <User className="h-4 w-4 mr-2" />
            Mentors
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <ChatInterface
                selectedMentor={selectedMentor}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
                isLoadingChat={isLoadingChat}
                setIsLoadingChat={setIsLoadingChat}
              />
            </div>
            <div>
              <SelectedMentorCard selectedMentor={selectedMentor} onChangeMentor={() => setShowMentorDialog(true)} />
            </div>
          </div>
        </TabsContent>

        {/* Mentors Tab */}
        <TabsContent value="mentor">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                isSelected={selectedMentorId === mentor.id}
                onSelect={handleSelectMentor}
              />
            ))}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <ResourceSection
            beginnerResources={beginnerResources}
            advancedResources={advancedResources}
            onViewResource={handleViewResource}
          />
        </TabsContent>
      </Tabs>

      {/* Mentor Selection Dialog */}
      <MentorSelection
        mentors={mentors}
        selectedMentor={selectedMentorId}
        showMentorDialog={showMentorDialog}
        setShowMentorDialog={setShowMentorDialog}
        handleSelectMentor={handleSelectMentor}
      />

      {/* Resource Viewer Dialog */}
      <ResourceViewer
        resource={selectedResource}
        isOpen={showResourceViewer}
        onClose={() => setShowResourceViewer(false)}
      />
    </div>
  )
}

// Sample data - Mentors
const mentors: Mentor[] = [
  {
    id: "sebastian",
    name: "Sebastian Ghiorghiu",
    specialty: "TikTok Dropshipping",
    image: "/placeholder.svg?height=100&width=100",
    description: "Specializes in TikTok marketing and one-product stores with a focus on high-ticket items.",
    expertise: ["TikTok Marketing", "High-Ticket Products", "One-Product Stores", "Video Ads"],
  },
  {
    id: "jordan",
    name: "Jordan Welch",
    specialty: "Branded Dropshipping",
    image: "/placeholder.svg?height=100&width=100",
    description: "Focuses on building long-term branded stores with multiple products and strong customer retention.",
    expertise: ["Brand Building", "Customer Retention", "Email Marketing", "Multiple Product Stores"],
  },
  {
    id: "biaheza",
    name: "Biaheza",
    specialty: "Facebook Ads",
    image: "/placeholder.svg?height=100&width=100",
    description: "Known for Facebook ad strategies and finding winning products through trend analysis.",
    expertise: ["Facebook Ads", "Trend Analysis", "Product Research", "Ad Creative Testing"],
  },
  {
    id: "ecomking",
    name: "Ecom King",
    specialty: "Influencer Marketing",
    image: "/placeholder.svg?height=100&width=100",
    description: "Specializes in leveraging influencer marketing and UGC content for product promotion.",
    expertise: ["Influencer Outreach", "UGC Content", "Instagram Marketing", "Social Proof"],
  },
  {
    id: "sarah",
    name: "Sarah Davidson",
    specialty: "Shopify Optimization",
    image: "/placeholder.svg?height=100&width=100",
    description: "Expert in conversion rate optimization and Shopify store design for maximum sales.",
    expertise: ["Conversion Optimization", "Store Design", "A/B Testing", "Customer Experience"],
  },
  {
    id: "alex",
    name: "Alex Chen",
    specialty: "Supply Chain Management",
    image: "/placeholder.svg?height=100&width=100",
    description: "Focuses on building reliable supply chains and efficient fulfillment processes.",
    expertise: ["Supplier Relations", "Shipping Optimization", "Inventory Management", "Quality Control"],
  },
]

// Sample data - Resources
const beginnerResources: Resource[] = [
  {
    id: "finding-products",
    title: "Finding Your First Product",
    description: "Learn how to research and select profitable products for your store",
    category: "beginner",
    content: [
      {
        heading: "Introduction to Product Research",
        paragraphs: [
          "Finding the right product is the foundation of any successful dropshipping business. This guide will walk you through proven methods to identify profitable products with high demand and reasonable competition.",
          "The goal is to find products that solve a specific problem, have a 'wow factor', and can generate impulse purchases. These characteristics increase your chances of success in the competitive dropshipping landscape.",
        ],
      },
      {
        heading: "Key Product Selection Criteria",
        paragraphs: ["When evaluating potential products, consider these important factors:"],
        bullets: [
          "Profit margin of at least 40-70% after all costs",
          "Selling price between $20-$70 (sweet spot for impulse purchases)",
          "Lightweight and small for easier shipping",
          "Not readily available in local stores",
          "Solves a specific problem or fulfills a passionate need",
          "Has potential for engaging video content",
        ],
      },
      {
        heading: "Research Methods and Tools",
        paragraphs: ["Use these platforms and methods to find trending products:"],
        bullets: [
          "TikTok Shop and TikTok search for trending items",
          "Facebook Ad Library to see what competitors are promoting",
          "Amazon Best Sellers and 'Customers also bought' sections",
          "AliExpress and CJ Dropshipping trending products",
          "Google Trends to verify sustained or growing interest",
          "Competitor store analysis using tools like Koala Inspector",
        ],
      },
      {
        heading: "Validating Your Product Ideas",
        paragraphs: [
          "Before investing heavily in a product, validate your ideas with these steps:",
          "Order samples to verify quality and take your own photos/videos",
          "Run small test campaigns on TikTok or Facebook to gauge interest",
          "Check competition levels using Google and social media searches",
          "Calculate all costs including product, shipping, ads, and returns to ensure profitability",
        ],
      },
    ],
  },
  {
    id: "store-setup",
    title: "Setting Up Your Store",
    description: "Step-by-step instructions for creating a professional Shopify store",
    category: "beginner",
    content: [
      {
        heading: "Choosing the Right Platform",
        paragraphs: [
          "While there are several e-commerce platforms available, Shopify remains the top choice for dropshipping due to its ease of use, reliability, and extensive app ecosystem.",
          "This guide focuses on setting up a Shopify store, but many principles apply to other platforms as well.",
        ],
      },
      {
        heading: "Essential Store Elements",
        paragraphs: ["A professional dropshipping store should include these key elements:"],
        bullets: [
          "Clean, mobile-responsive design with fast loading times",
          "Professional logo and consistent branding",
          "High-quality product images and videos",
          "Detailed product descriptions focusing on benefits",
          "Trust badges, reviews, and social proof",
          "Clear shipping policies and return information",
          "About Us page that builds credibility",
          "Easy checkout process with multiple payment options",
        ],
      },
      {
        heading: "Step-by-Step Setup Process",
        paragraphs: ["Follow these steps to set up your Shopify store:"],
        bullets: [
          "Sign up for Shopify and choose a plan",
          "Select a theme (free or premium) that matches your niche",
          "Customize your theme colors, fonts, and layout",
          "Add essential pages (About, Contact, Shipping, Returns, Privacy Policy)",
          "Set up payment gateways (Shopify Payments, PayPal, etc.)",
          "Configure shipping zones and rates",
          "Install essential apps (reviews, upsell, analytics)",
          "Add your products with optimized descriptions and images",
          "Set up tracking for Facebook Pixel and Google Analytics",
        ],
      },
      {
        heading: "Optimizing for Conversions",
        paragraphs: [
          "Implement these conversion-boosting elements:",
          "Use scarcity and urgency (limited stock, time-limited offers)",
          "Add product reviews and testimonials",
          "Implement exit-intent popups with discounts",
          "Create a seamless mobile shopping experience",
          "Optimize product page layout with clear call-to-action buttons",
          "Add trust signals throughout the checkout process",
        ],
      },
    ],
  },
  {
    id: "marketing-basics",
    title: "Marketing Fundamentals",
    description: "Essential marketing strategies for new dropshipping stores",
    category: "beginner",
    content: [
      {
        heading: "Understanding the Marketing Funnel",
        paragraphs: [
          "Successful dropshipping marketing follows a funnel approach: Awareness → Interest → Desire → Action. Each stage requires different strategies and content types.",
          "This guide covers the fundamental marketing approaches for new dropshipping stores, with a focus on paid advertising and organic methods.",
        ],
      },
      {
        heading: "Choosing Your Primary Marketing Platform",
        paragraphs: ["For most dropshipping stores, these platforms offer the best return on investment:"],
        bullets: [
          "TikTok Ads: Best for trendy, visual products targeting younger audiences",
          "Facebook/Instagram Ads: Great for detailed targeting and retargeting",
          "Google Ads: Effective for products with clear search intent",
          "Influencer Marketing: Powerful for social proof and reaching niche audiences",
        ],
      },
      {
        heading: "Creating Effective Ad Content",
        paragraphs: ["Your ad creative is the most important factor in dropshipping success. Focus on these elements:"],
        bullets: [
          "Hook viewers in the first 3 seconds with a problem or curiosity",
          "Demonstrate the product solving a real problem",
          "Show before/after results when applicable",
          "Include user testimonials and social proof",
          "End with a clear call-to-action",
          "Test multiple creative approaches with small budgets",
        ],
      },
      {
        heading: "Testing and Optimization Strategy",
        paragraphs: [
          "Follow this testing framework for new products:",
          "Start with a small daily budget ($10-20) spread across 3-5 ad creatives",
          "Run ads for at least 3 days before making decisions",
          "Scale winning ads gradually by increasing budget 20-30% every 2-3 days",
          "Implement retargeting campaigns for visitors who didn't convert",
          "Continuously test new creatives even when you find winners",
        ],
      },
    ],
  },
]

const advancedResources: Resource[] = [
  {
    id: "scaling-ads",
    title: "Scaling Your Ad Campaigns",
    description: "Advanced techniques for scaling profitable ad campaigns",
    category: "advanced",
    content: [
      {
        heading: "When and How to Scale",
        paragraphs: [
          "Scaling is the process of increasing your ad spend on winning campaigns to generate more sales. This guide covers both vertical scaling (increasing budget) and horizontal scaling (expanding to new audiences and platforms).",
          "You should only scale campaigns that have proven profitable with a ROAS (Return on Ad Spend) of at least 1.5-2x over a 3-7 day period.",
        ],
      },
      {
        heading: "Vertical Scaling Strategies",
        paragraphs: ["Use these methods to increase spend on winning campaigns:"],
        bullets: [
          "Gradual Budget Increases: Raise budget by 20-30% every 2-3 days",
          "Duplicate Campaign Method: Create copies of winning ad sets with higher budgets",
          "Campaign Budget Optimization (CBO): Let Facebook allocate budget across multiple ad sets",
          "Bid Cap Strategy: Use bid caps to control costs while scaling",
          "Dayparting: Allocate more budget during high-converting hours",
        ],
      },
      {
        heading: "Horizontal Scaling Approaches",
        paragraphs: ["Expand your reach with these horizontal scaling tactics:"],
        bullets: [
          "Lookalike Audiences: Create 1%, 2%, and 3-5% lookalikes from purchasers",
          "Interest Expansion: Test related interests and broader audiences",
          "Geographic Expansion: Target new countries with proven products",
          "Platform Expansion: Add new channels like Google, TikTok, or Pinterest",
          "Creative Expansion: Test new angles, formats, and messaging",
        ],
      },
      {
        heading: "Managing Scaling Challenges",
        paragraphs: [
          "Be prepared for these common scaling issues:",
          "Ad fatigue: Refresh creatives regularly and rotate angles",
          "Diminishing returns: Accept lower ROAS as you scale (but maintain profitability)",
          "Cash flow constraints: Reinvest profits and consider inventory financing",
          "Supply chain pressure: Communicate with suppliers about increased volume",
          "Customer service load: Implement systems to handle increased inquiries",
        ],
      },
    ],
  },
  {
    id: "building-brand",
    title: "Building a Brand",
    description: "Transform your dropshipping store into a recognized brand",
    category: "advanced",
    content: [
      {
        heading: "The Brand Advantage",
        paragraphs: [
          "Building a brand transforms your dropshipping business from a one-time transaction model to a sustainable business with repeat customers, higher margins, and greater business value.",
          "This guide covers the essential elements of transforming a dropshipping store into a recognized brand.",
        ],
      },
      {
        heading: "Brand Foundation Elements",
        paragraphs: ["Establish these core brand components:"],
        bullets: [
          "Brand Story: Create a compelling narrative about why your brand exists",
          "Mission and Values: Define what your brand stands for beyond making sales",
          "Visual Identity: Develop consistent logo, colors, typography, and imagery",
          "Voice and Tone: Establish how your brand communicates across all channels",
          "Customer Persona: Define exactly who your brand serves and their needs",
          "Unique Selling Proposition: Clarify what makes your brand different",
        ],
      },
      {
        heading: "Implementation Strategies",
        paragraphs: ["Apply your brand through these channels and methods:"],
        bullets: [
          "Custom Packaging: Add branded inserts, custom boxes, or packaging tape",
          "Product Customization: Work with suppliers to add your logo to products",
          "Content Marketing: Create valuable blog posts, videos, or social content",
          "Email Marketing: Build relationships through regular, valuable communication",
          "Social Media Presence: Develop a consistent posting strategy across platforms",
          "Community Building: Create Facebook groups or other spaces for customers",
        ],
      },
      {
        heading: "Measuring Brand Growth",
        paragraphs: [
          "Track these metrics to measure brand development:",
          "Repeat purchase rate: Percentage of customers who buy again",
          "Customer lifetime value (CLV): Average revenue per customer over time",
          "Direct/branded traffic: Visitors who search for your brand specifically",
          "Social media engagement: Growth in followers and interaction rates",
          "Net Promoter Score (NPS): How likely customers are to recommend you",
          "Customer acquisition cost (CAC): Should decrease as brand recognition grows",
        ],
      },
    ],
  },
  {
    id: "conversion-optimization",
    title: "Optimizing for Conversions",
    description: "Increase your conversion rate and average order value",
    category: "advanced",
    content: [
      {
        heading: "Conversion Rate Fundamentals",
        paragraphs: [
          "Conversion rate optimization (CRO) is the process of increasing the percentage of visitors who take desired actions on your site. Even small improvements can significantly impact profitability.",
          "This guide covers proven strategies to optimize your store for higher conversion rates and increased average order value.",
        ],
      },
      {
        heading: "Product Page Optimization",
        paragraphs: ["Enhance your product pages with these elements:"],
        bullets: [
          "High-quality images from multiple angles and in-context use",
          "Video demonstrations showing the product in action",
          "Benefit-focused descriptions addressing pain points",
          "Clear pricing with any discounts prominently displayed",
          "Trust indicators (guarantees, reviews, security badges)",
          "FAQ section addressing common objections",
          "Mobile-optimized layout with easy-to-tap buttons",
        ],
      },
      {
        heading: "Checkout Optimization",
        paragraphs: ["Reduce cart abandonment with these tactics:"],
        bullets: [
          "Simplified checkout process with minimal steps",
          "Guest checkout option (no forced account creation)",
          "Multiple payment options including digital wallets",
          "Clear shipping costs and delivery timeframes",
          "Order bumps and one-click upsells",
          "Exit-intent popups with special offers",
          "Abandoned cart email sequences",
        ],
      },
      {
        heading: "Testing and Implementation Framework",
        paragraphs: [
          "Follow this process for continuous improvement:",
          "Analyze data to identify conversion bottlenecks (using Google Analytics and heatmaps)",
          "Prioritize tests based on potential impact and implementation effort",
          "Run A/B tests for at least 100 conversions per variation",
          "Implement winning changes and document learnings",
          "Continuously test new elements based on customer feedback and behavior",
          "Consider seasonal factors and traffic sources when analyzing results",
        ],
      },
    ],
  },
  {
    id: "supplier-management",
    title: "Advanced Supplier Management",
    description: "Build reliable supply chains and improve fulfillment",
    category: "advanced",
    content: [
      {
        heading: "Beyond Basic Dropshipping",
        paragraphs: [
          "As your business grows, moving beyond standard dropshipping arrangements can significantly improve margins, delivery times, and product quality.",
          "This guide covers advanced supplier relationships and fulfillment strategies for established dropshipping businesses.",
        ],
      },
      {
        heading: "Supplier Relationship Development",
        paragraphs: ["Enhance your supplier relationships with these approaches:"],
        bullets: [
          "Direct communication: Establish direct contact with manufacturers",
          "Volume negotiation: Secure better rates based on consistent order volume",
          "Exclusivity agreements: Negotiate exclusive rights to certain products",
          "Quality control standards: Establish specific requirements and inspection processes",
          "Custom packaging: Arrange for branded packaging and inserts",
          "Product customization: Make minor modifications to differentiate your offerings",
        ],
      },
      {
        heading: "Fulfillment Optimization Strategies",
        paragraphs: ["Improve fulfillment with these methods:"],
        bullets: [
          "Private agents: Work with dedicated agents who manage your orders",
          "Warehousing: Use services like CJ Dropshipping for bulk storage",
          "Multiple suppliers: Establish relationships with backup suppliers",
          "Hybrid model: Stock bestsellers while dropshipping newer products",
          "Fulfillment centers: Use 3PL services in key markets for faster delivery",
          "Shipping method optimization: Balance cost and speed for different products",
        ],
      },
      {
        heading: "Supply Chain Risk Management",
        paragraphs: [
          "Protect your business with these risk mitigation strategies:",
          "Diversify suppliers across different regions to reduce geographic risks",
          "Maintain safety stock of bestselling products during high-demand periods",
          "Develop contingency plans for shipping delays and supplier issues",
          "Monitor global events that could impact manufacturing or shipping",
          "Create clear communication protocols for supply chain disruptions",
          "Implement inventory forecasting to anticipate needs and prevent stockouts",
        ],
      },
    ],
  },
  {
    id: "customer-retention",
    title: "Customer Retention Strategies",
    description: "Turn one-time buyers into loyal repeat customers",
    category: "advanced",
    content: [
      {
        heading: "The Value of Retention",
        paragraphs: [
          "Acquiring a new customer costs 5-25 times more than retaining an existing one. Focusing on retention can dramatically increase profitability and create a sustainable business.",
          "This guide covers proven strategies to increase customer lifetime value through effective retention tactics.",
        ],
      },
      {
        heading: "Email Marketing Sequences",
        paragraphs: ["Implement these essential email flows:"],
        bullets: [
          "Post-purchase sequence: Thank you, shipping updates, usage tips",
          "Review request: Timed to arrive after product delivery",
          "Win-back campaign: Special offers for customers who haven't purchased recently",
          "Cross-sell sequence: Recommendations based on previous purchases",
          "Birthday/anniversary emails: Special offers on significant dates",
          "Educational content: Value-adding information related to your products",
        ],
      },
      {
        heading: "Loyalty and Referral Programs",
        paragraphs: ["Create systems that reward repeat business and referrals:"],
        bullets: [
          "Points-based loyalty program with tiered rewards",
          "Referral incentives for both the referrer and new customer",
          "VIP club with exclusive benefits for top customers",
          "Early access to new products for existing customers",
          "Subscription options for consumable products",
          "Bundle deals that encourage larger purchases",
        ],
      },
      {
        heading: "Customer Experience Enhancement",
        paragraphs: [
          "Elevate the experience to build emotional connections:",
          "Personalized packaging and thank you notes",
          "Surprise upgrades or free gifts for repeat customers",
          "Proactive customer service that anticipates needs",
          "Community building through social media groups or forums",
          "User-generated content campaigns that showcase customers",
          "Consistent follow-up to ensure satisfaction with purchases",
        ],
      },
    ],
  },
]
