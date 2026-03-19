"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Pin, Edit2, Trash2, RefreshCw, Share2 } from "lucide-react";
import { getCategoryColor } from "@/lib/categories";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { RichMarkdownEditor } from "@/components/rich-markdown-editor";
import { Input } from "@/components/ui/input";
import { ShareJournalDialog } from "@/components/share-journal-dialog";

interface JournalEntry {
  id: number;
  date: string;
  title: string;
  text: string;
  created_at: string;
  categories: string[];
  pinned: boolean;
}

export default function JournalPage() {
  const params = useParams();
  const router = useRouter();
  const entryId = Number(params.id);
  
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editingEntry, setEditingEntry] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    text: "",
    categories: [] as string[],
  });
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [agentReflections, setAgentReflections] = useState<Record<string, { name: string; reflection: string }>>({});
  const [reflecting, setReflecting] = useState<Record<string, boolean>>({});
  const [agentOptions, setAgentOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("marcus-aurelius");
  const [reflectionsAvailable, setReflectionsAvailable] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const res = await fetch("/api/journals");
        const data = await res.json();
        const entries = data.entries || [];
        const found = entries.find((e: JournalEntry) => e.id === entryId);
        
        if (found) {
          setEntry(found);
          setFormData({
            date: found.date,
            title: found.title,
            text: found.text,
            categories: found.categories || [],
          });

          const categoriesSet = new Set<string>();
          entries.forEach((e: JournalEntry) => {
            e.categories?.forEach((cat: string) => categoriesSet.add(cat));
          });
          setAllCategories(Array.from(categoriesSet).sort());
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Failed to fetch entry:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchAgents = async () => {
      try {
        const res = await fetch("/api/agents");
        const data = await res.json();
        setAgentOptions(data.agents || []);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      }
    };

    const checkReflectionsAvailable = async () => {
      try {
        const res = await fetch("/api/reflect/health");
        const data = await res.json();
        setReflectionsAvailable(data.available === true);
        if (!data.available) {
          toast.error("⚠️ Reflections are currently unavailable");
        }
      } catch (error) {
        console.error("Failed to check reflections availability:", error);
        setReflectionsAvailable(false);
        toast.error("⚠️ Reflections are currently unavailable");
      }
    };

    fetchEntry();
    fetchAgents();
    checkReflectionsAvailable();
  }, [entryId]);

  const handleUpdate = async () => {
    const updatedTitle = formData.title.trim() || "Untitled journal";

    if (
      entry &&
      entry.date === formData.date &&
      entry.title === formData.title &&
      entry.text === formData.text &&
      JSON.stringify(entry.categories) === JSON.stringify(formData.categories)
    ) {
      setEditingEntry(false);
      return;
    }

    await fetch("/api/journals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId, ...formData }),
    });

    toast.success(`✏️ ${updatedTitle} edited.`);
    setEditingEntry(false);

    const res = await fetch("/api/journals");
    const data = await res.json();
    const entries = data.entries || [];
    const updated = entries.find((e: JournalEntry) => e.id === entryId);
    if (updated) {
      setEntry(updated);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry?")) return;

    const entryTitle = entry?.title?.trim() || "Untitled journal";

    await fetch("/api/journals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId }),
    });

    toast.success(`🗑️ ${entryTitle} deleted.`);
    router.push("/");
  };

  const handleTogglePin = async () => {
    if (!entry) return;

    const isPinning = !entry.pinned;
    const entryTitle = entry.title?.trim() || "Untitled journal";

    if (entry.pinned) {
      toast.success(`📌 ${entryTitle} unpinned.`);
    } else {
      toast.success(`📌 ${entryTitle} pinned.`);
    }

    await fetch("/api/journals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId }),
    });

    const res = await fetch("/api/journals");
    const data = await res.json();
    const entries = data.entries || [];
    const updated = entries.find((e: JournalEntry) => e.id === entryId);
    if (updated) {
      setEntry(updated);
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const addNewCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (trimmed && !allCategories.includes(trimmed)) {
      setAllCategories((prev) => [...prev, trimmed].sort());
    }
    if (trimmed && !formData.categories.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, trimmed],
      }));
    }
    setNewCategoryInput("");
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addNewCategory();
    }
  };

  const handleAgentReflect = async (agentName?: string) => {
    const agent = agentName || selectedAgent || "marcus-aurelius";
    const agentLabel = agentOptions.find(a => a.value === agent)?.label || "Marcus Aurelius";
    
    if (!entry) return;

    setReflecting((prev) => ({ ...prev, [agent]: true }));
    setAgentReflections((prev) => ({
      ...prev,
      [agent]: { name: agentLabel, reflection: "" },
    }));
    
    toast.success(`🤔 ${agentLabel} pondering your thoughts...`);
    
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry: entry.text, agentName: agent }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.includes("Cannot reach Ollama")) {
          setReflectionsAvailable(false);
          toast.error("⚠️ Reflections are currently unavailable");
        } else {
          toast.error("Agent error: Failed to reflect on journal.");
        }
        setAgentReflections((prev) => {
          const updated = { ...prev };
          delete updated[agent];
          return updated;
        });
      } else {
        setAgentReflections((prev) => ({
          ...prev,
          [agent]: { name: agentLabel, reflection: data.reflection },
        }));
        toast.success(`✨ ${agentLabel} reflected on your journal.`);
      }
    } catch (e) {
      toast.error("⚠️ Reflections are currently unavailable");
      setReflectionsAvailable(false);
      setAgentReflections((prev) => {
        const updated = { ...prev };
        delete updated[agent];
        return updated;
      });
    } finally {
      setReflecting((prev) => ({ ...prev, [agent]: false }));
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Journal</h1>
            <ThemeToggle />
          </header>
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">Journal entry not found.</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Back to all journals
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!entry) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Journal</h1>
          <ThemeToggle />
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={entry.pinned ? "border-primary/20 bg-primary/5 transition-all duration-300 ease-in-out" : "transition-all duration-300 ease-in-out"}>
            {editingEntry ? (
              <CardContent className="space-y-4 pt-6">
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <RichMarkdownEditor
                  value={formData.text}
                  onChange={(text) =>
                    setFormData({ ...formData, text })
                  }
                  placeholder="Write your thoughts..."
                />

                {/* Categories Section */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new category..."
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={handleCategoryKeyDown}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addNewCategory}
                      disabled={!newCategoryInput.trim()}
                    >
                      +
                    </Button>
                  </div>

                  {allCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {allCategories.map((category) => {
                        const isSelected = formData.categories.includes(category);
                        const color = getCategoryColor(category);
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => toggleCategory(category)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    className="flex-1"
                  >
                    Update
                  </Button>
                  <Button variant="outline" onClick={() => setEditingEntry(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            ) : (
              <>
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      {entry.pinned && (
                        <div className="flex items-center gap-2">
                          <Pin className="h-4 w-4 text-primary" />
                          <p className="text-xs text-muted-foreground">
                            Pinned
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const d = new Date(entry.created_at);
                          return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
                        })()}
                      </p>
                      <p className="text-sm text-foreground">
                        {(() => {
                          const d = new Date(entry.created_at);
                          const weekdays = [
                            "Nedelja",
                            "Ponedeljek",
                            "Torek",
                            "Sreda",
                            "Četrtek",
                            "Petek",
                            "Sobota",
                          ];
                          const weekday = weekdays[d.getDay()];
                          const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
                          return `${weekday}, ${time}`;
                        })()}
                      </p>
                      <CardTitle className="text-xl pt-1">
                        {entry.title}
                      </CardTitle>

                      {/* Display categories */}
                      {entry.categories && entry.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {entry.categories.map((category) => {
                            const color = getCategoryColor(category);
                            return (
                              <div
                                key={category}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-secondary/50"
                              >
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                {category}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleTogglePin}
                        className={entry.pinned ? "text-primary" : ""}
                      >
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShareDialogOpen(true);
                        }}
                        title="Share this journal"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingEntry(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-headings:mt-3 prose-headings:mb-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-hr:my-3"
                    dangerouslySetInnerHTML={{ __html: entry.text }}
                  />
                  <div className="mt-4">
                    {agentOptions.some(agent => {
                      const isReflecting = reflecting[agent.value];
                      const isReflected = agentReflections[agent.value];
                      return !isReflecting && !isReflected;
                    }) && (
                      <p className="text-sm text-muted-foreground mb-3">Reflect on your journal with</p>
                    )}
                    <div className="flex items-center gap-2">
                    {agentOptions.map(agent => {
                      const isReflecting = reflecting[agent.value];
                      const isReflected = agentReflections[agent.value];
                      if (isReflecting || isReflected) return null;
                      return (
                        <Button
                          key={agent.value}
                          variant="outline"
                          size="sm"
                          disabled={!reflectionsAvailable}
                          onClick={() => {
                            setSelectedAgent(agent.value);
                            handleAgentReflect(agent.value);
                          }}
                        >
                          {agent.label}
                        </Button>
                      );
                    })}
                    </div>
                  </div>
                  <>
                    {agentOptions.map(agent => {
                      const isReflecting = reflecting[agent.value];
                      const reflection = agentReflections[agent.value];
                      if (!isReflecting && !reflection) return null;
                      return (
                        <div className="mt-6" key={agent.value}>
                          <div className="rounded-xl border bg-card text-card-foreground p-4 relative">
                            <div className="mb-2 text-xs font-semibold text-muted-foreground">
                              {agent.label}
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed">
                              {isReflecting || !reflection ? (
                                <span className="animate-pulse text-muted-foreground">
                                  {agent.label} reflecting on your journal.
                                </span>
                              ) : (
                                reflection?.reflection
                              )}
                            </div>
                            {!isReflecting && reflection && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => handleAgentReflect(agent.value)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                </CardContent>
              </>
            )}
          </Card>
        </motion.div>

        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
          >
            Back to all journals
          </Button>
        </div>
      </div>

      <ShareJournalDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        entryId={entry.id}
      />
    </main>
  );
}
