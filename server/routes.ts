import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStreamerApplicationSchema, insertPageViewSchema, insertChatbotInteractionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Submit streamer application
  app.post("/api/streamer-application", async (req, res) => {
    try {
      const validatedData = insertStreamerApplicationSchema.parse(req.body);
      const application = await storage.createStreamerApplication(validatedData);
      res.json({ success: true, application });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation failed", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Internal server error" 
        });
      }
    }
  });

  // Get all applications (for admin/debugging)
  app.get("/api/streamer-applications", async (req, res) => {
    try {
      const applications = await storage.getAllStreamerApplications();
      res.json({ success: true, applications });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Track page views
  app.post("/api/analytics/page-view", async (req, res) => {
    try {
      const pageViewData = insertPageViewSchema.parse({
        path: req.body.path || "/",
        userAgent: req.get("User-Agent"),
        ip: req.ip || req.connection.remoteAddress,
      });
      
      await storage.trackPageView(pageViewData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Get analytics data (admin endpoint)
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  // Simple chatbot response endpoint
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ 
          success: false, 
          message: "Message is required" 
        });
      }

      // Simple chatbot responses based on keywords
      let response = "Thanks for your message! Our team will get back to you soon. In the meantime, check out our FAQ section for common questions.";
      
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
        response = "I'm here to help! You can ask me about streaming tips, technical issues, or how to grow your audience. What specific area would you like assistance with?";
      } else if (lowerMessage.includes("stream") || lowerMessage.includes("streaming")) {
        response = "Great question about streaming! For the best streaming experience, make sure you have a stable internet connection, good lighting, and engaging content. What aspect of streaming would you like to know more about?";
      } else if (lowerMessage.includes("grow") || lowerMessage.includes("audience")) {
        response = "Growing your audience takes time and consistency! Focus on creating quality content, engaging with your viewers, and maintaining a regular schedule. The Hype UP community is here to support your journey!";
      } else if (lowerMessage.includes("technical") || lowerMessage.includes("problem")) {
        response = "Technical issues can be frustrating! Common solutions include checking your internet connection, updating your streaming software, and adjusting your stream settings. If the problem persists, our technical team can provide more specific help.";
      }

      // Track the chatbot interaction
      await storage.trackChatbotInteraction({
        userMessage: message,
        botResponse: response,
      });

      res.json({ 
        success: true, 
        response 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
