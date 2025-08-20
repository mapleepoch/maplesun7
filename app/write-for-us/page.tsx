"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ApplicationPage() {
  const [status, setStatus] = useState(""); // success | error | loading

  // Auto-hide success/error messages after 5 seconds
  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        setStatus("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    const form = e.target;
    const data = new FormData(form);

    const res = await fetch("https://formspree.io/f/xldlylvp", {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      setStatus("success");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Apply as a Contributor
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-2xl shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name *
              </label>
              <Input name="first_name" placeholder="Your first name" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name *
              </label>
              <Input name="last_name" placeholder="Your last name" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Areas of Expertise
            </label>
            <Input
              name="expertise"
              placeholder="e.g., Politics, Technology, Health, Sports"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Professional Background
            </label>
            <Textarea
              name="background"
              placeholder="Tell us about your journalism experience, education, and relevant background..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Writing Samples / Portfolio
            </label>
            <Textarea
              name="portfolio"
              placeholder="Provide links to published work or attach writing samples..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Story Ideas
            </label>
            <Textarea
              name="story_ideas"
              placeholder="Share some story ideas you'd like to write about..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Submitting..." : "Submit Application"}
          </Button>

          {status === "success" && (
            <p className="text-green-600 text-sm mt-2 text-center">
              ✅ Thank you! Your application has been submitted.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm mt-2 text-center">
              ❌ Oops! Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
