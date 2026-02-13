import React from "react";
import { Input, Select, Button, Card } from "../ui";

export interface BlogFormValues {
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
}

interface BlogFormProps {
  form: BlogFormValues;
  loading: boolean;
  error: string | null;
  validationError?: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "technical", label: "Technical" },
  { value: "friendly", label: "Friendly" },
  { value: "marketing", label: "Marketing" },
  { value: "academic", label: "Academic" },
  { value: "conversational", label: "Conversational" },
];

export function BlogForm({ form, loading, error, validationError, onChange, onSubmit }: BlogFormProps) {
  return (
    <Card shadow="lg" rounded="xl" className="p-6 md:p-8">
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <Input
            id="topic"
            name="topic"
            type="text"
            label="Topic"
            value={form.topic}
            onChange={onChange}
            placeholder="e.g., The Future of AI in Content Creation"
            required
          />

          <Input
            id="keywords"
            name="keywords"
            type="text"
            label="Keywords"
            value={form.keywords}
            onChange={onChange}
            placeholder="e.g., AI, content marketing, automation"
            helperText="Separate keywords with commas"
            required
          />

          <Input
            id="audience"
            name="audience"
            type="text"
            label="Target Audience"
            value={form.audience}
            onChange={onChange}
            placeholder="e.g., Marketing professionals, business owners"
            required
          />

          <Select 
            id="tone" 
            name="tone" 
            label="Tone" 
            value={form.tone} 
            onChange={onChange} 
            options={toneOptions}
            required
          />

          {(error || validationError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {validationError || error}
            </div>
          )}

          <Button type="submit" variant="gradient" loading={loading} fullWidth size="lg">
            {loading ? "Generating..." : "Generate Blog Content"}
          </Button>
        </div>
      </form>
    </Card>
  );
}