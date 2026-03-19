"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { RichMarkdownEditor } from "@/components/rich-markdown-editor";
import { Plus, Save, X, Trash2, Edit2, Pin, RefreshCw, Share2 } from "lucide-react";
import { getCategoryColor } from "@/lib/categories";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
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

export default function JournalApp() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [agentReflections, setAgentReflections] = useState<Record<string, Record<string, { name: string; reflection: string }>>>({});
  const [reflecting, setReflecting] = useState<Record<string, boolean>>({});
  const [selectedAgent, setSelectedAgent] = useState<Record<number, string>>({});
  const [agentOptions, setAgentOptions] = useState<{ value: string; label: string }[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogEntryId, setShareDialogEntryId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    text: "",
    categories: [] as string[],
  });
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const entryRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const creationMessages = [
    "Zelo lepo napisano! 🖋️",
    "Zanimivo! 🤔",
    "Hvala, ker deliš! 🙏",
    "Lepo je videti tvoje misli zapisane. 🌟",
    "Vsaka beseda šteje! 📝",
    "Odlično delo! 👏"
  ];

  const getRandomCreationMessage = () => {
    const index = Math.floor(Math.random() * creationMessages.length);
    return creationMessages[index];
  };

  const areArraysEqual = (a: string[] = [], b: string[] = []) => {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
  };

  const renderToast = (emoji: string, boldText?: string, trailingText?: string) => (
    <div className="flex items-center gap-1.5 text-sm">
      <span aria-hidden="true" className="shrink-0">{emoji}</span>
      <span className="flex flex-wrap items-center gap-1">
        {boldText && <span className="font-semibold">{boldText}</span>}
        {trailingText && <span>{trailingText}</span>}
      </span>
    </div>
  );

  const fetchEntries = async () => {
    const res = await fetch("/api/journals");
    const data = await res.json();
    const fetchedEntries = data.entries || [];
    setEntries(fetchedEntries);

    const categoriesSet = new Set<string>();
    fetchedEntries.forEach((entry: JournalEntry) => {
      entry.categories?.forEach((cat: string) => categoriesSet.add(cat));
    });
    setAllCategories(Array.from(categoriesSet).sort());
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

  useEffect(() => {
    fetchEntries();
    fetchAgents();
  }, []);

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    const message = getRandomCreationMessage();

    await fetch("/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    toast(renderToast("📝", undefined, message));

    setFormData({
      date: new Date().toISOString().split("T")[0],
      title: "",
      text: "",
      categories: [],
    });
    setNewCategoryInput("");
    setIsCreating(false);
    fetchEntries();
  };

  const handleUpdate = async (id: number) => {
    const updatedTitle = formData.title.trim() || "Untitled journal";
    const original = entries.find((e) => e.id === id);

    if (
      original &&
      original.date === formData.date &&
      original.title === formData.title &&
      original.text === formData.text &&
      areArraysEqual(original.categories, formData.categories)
    ) {
      setEditingEntry(null);
      return;
    }

    await fetch("/api/journals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...formData }),
    });

    toast(renderToast("✏️", updatedTitle, "edited."));

    setEditingEntry(null);
    fetchEntries();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this entry?")) return;

    const entry = entries.find((e) => e.id === id);
    const entryTitle = entry?.title?.trim() || "Untitled journal";

    await fetch("/api/journals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    toast(renderToast("🗑️", entryTitle, "deleted."));

    fetchEntries();
  };

  const handleTogglePin = async (id: number) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    const isPinning = !entry.pinned;
    let topBefore: number | null = null;
    let scrollBefore: number | null = null;

    if (isPinning && typeof window !== "undefined") {
      const node = entryRefs.current[id];
      if (node) {
        const rect = node.getBoundingClientRect();
        topBefore = rect.top;
        scrollBefore = window.scrollY;
      }
    }

    const entryTitle = entry.title?.trim() || "Untitled journal";

    if (entry.pinned) {
      toast(renderToast("📌", entryTitle, "unpinned."));
    } else {
      toast(renderToast("📌", entryTitle, "pinned."));
    }

    await fetch("/api/journals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    await fetchEntries();

    if (isPinning && topBefore !== null && scrollBefore !== null && typeof window !== "undefined") {
      // Read updated position and adjust scroll so the user stays anchored where the pin action happened.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const updatedNode = entryRefs.current[id];
          if (!updatedNode) return;
          const topAfter = updatedNode.getBoundingClientRect().top;
          const delta = topAfter - topBefore!;
          window.scrollTo({ top: scrollBefore! + delta });
        });
      });
    }
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingEntry(String(entry.id));
    setFormData({
      date: entry.date,
      title: entry.title,
      text: entry.text,
      categories: entry.categories || [],
    });
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setIsCreating(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      title: "",
      text: "",
      categories: [],
    });
    setNewCategoryInput("");
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

  const handleAgentReflect = async (entry: JournalEntry, agentName?: string) => {
    const agent = agentName || selectedAgent[entry.id] || "marcus-aurelius";
    const agentLabel = agentOptions.find(a => a.value === agent)?.label || "Marcus Aurelius";
    setReflecting((prev) => ({ ...prev, [`${entry.id}_${agent}`]: true }));
    setAgentReflections((prev) => ({
      ...prev,
      [entry.id]: {
        ...(prev[entry.id] || {}),
        [agent]: { name: agentLabel, reflection: "" },
      },
    }));
    toast(renderToast("🤔", "Reflecting", `${agentLabel} pondering your thoughts...`));
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry: entry.text, agentName: agent }),
      });
      const data = await res.json();
      setAgentReflections((prev) => ({
        ...prev,
        [entry.id]: {
          ...(prev[entry.id] || {}),
          [agent]: { name: agentLabel, reflection: data.reflection },
        },
      }));
      toast(renderToast("✨", "Reflection complete", `${agentLabel} reflected on your journal.`));
    } catch (e) {
      toast(renderToast("🤖", "Agent error", "Failed to reflect on journal."));
    } finally {
      setReflecting((prev) => ({ ...prev, [`${entry.id}_${agent}`]: false }));
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Journal</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!isCreating && (
              <Button
                onClick={() => setIsCreating(true)}
                size="icon"
                className="rounded-full"
              >
                <Plus className="h-5 w-5" />
                <span className="sr-only">New Entry</span>
              </Button>
            )}
          </div>
        </header>

        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">What happened?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    <Plus className="h-4 w-4" />
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
                <Button onClick={handleSave} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {entries.length === 0 && !isCreating && (
            <p className="text-center text-muted-foreground py-12">
              No journals yet.
            </p>
          )}

          {(() => {
            const sortedEntries = [...entries].sort((a, b) => {
              if (a.pinned !== b.pinned) {
                return a.pinned ? -1 : 1;
              }
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            return (
              <AnimatePresence initial={false}>
                {sortedEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    layout
                    ref={(el) => {
                      entryRefs.current[entry.id] = el;
                    }}
                  >
                    <Card className={entry.pinned ? "border-primary/20 bg-primary/5 transition-all duration-300 ease-in-out" : "transition-all duration-300 ease-in-out"}>
                      {editingEntry === String(entry.id) ? (
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
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>

                            {allCategories.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {allCategories.map((category) => {
                                  const isSelected =
                                    formData.categories.includes(category);
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
                              onClick={() => handleUpdate(entry.id)}
                              className="flex-1"
                            >
                              <Save className="mr-2 h-4 w-4" />
                              Update
                            </Button>
                            <Button variant="outline" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
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
                                  onClick={() => handleTogglePin(entry.id)}
                                  className={entry.pinned ? "text-primary" : ""}
                                >
                                  <Pin className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setShareDialogEntryId(entry.id);
                                    setShareDialogOpen(true);
                                  }}
                                  title="Share this journal"
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => startEdit(entry)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(entry.id)}
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
                                const isReflecting = reflecting[`${entry.id}_${agent.value}`];
                                const isReflected = agentReflections[entry.id]?.[agent.value];
                                return !isReflecting && !isReflected;
                              }) && (
                                <p className="text-sm text-muted-foreground mb-3">Reflect on your journal with</p>
                              )}
                              <div className="flex items-center gap-2">
                              {agentOptions.map(agent => {
                                const isReflecting = reflecting[`${entry.id}_${agent.value}`];
                                const isReflected = agentReflections[entry.id]?.[agent.value];
                                if (isReflecting || isReflected) return null;
                                return (
                                  <Button
                                    key={agent.value}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAgent(prev => ({ ...prev, [entry.id]: agent.value }));
                                      handleAgentReflect(entry, agent.value);
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
                                const isReflecting = reflecting[`${entry.id}_${agent.value}`];
                                const reflection = agentReflections[entry.id]?.[agent.value];
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
                                          onClick={() => handleAgentReflect(entry, agent.value)}
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
                ))}
              </AnimatePresence>
            );
          })()}
        </div>
      </div>
      <ShareJournalDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        entryId={shareDialogEntryId || 0}
      />
    </main>
  );
}
