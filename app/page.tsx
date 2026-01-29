"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Save, X, Trash2, Edit2, Pin } from "lucide-react";
import { getCategoryColor } from "@/lib/categories";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

interface JournalEntry {
  filename: string;
  date: string;
  title: string;
  text: string;
  timestamp: number;
  categories: string[];
  pinned: boolean;
}

export default function JournalApp() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    text: "",
    categories: [] as string[],
  });
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const creationMessages = [
    "Nice writing!",
    "Cool journal!",
    "Nicely said!",
    "Love this entry!",
    "Great reflection!",
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
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true">{emoji}</span>
      {boldText && <span className="font-semibold">{boldText}</span>}
      {trailingText && <span>{trailingText}</span>}
    </span>
  );

  const fetchEntries = async () => {
    const res = await fetch("/api/journals");
    const data = await res.json();
    const fetchedEntries = data.entries || [];
    setEntries(fetchedEntries);

    // Collect all unique categories
    const categoriesSet = new Set<string>();
    fetchedEntries.forEach((entry: JournalEntry) => {
      entry.categories?.forEach((cat: string) => categoriesSet.add(cat));
    });
    setAllCategories(Array.from(categoriesSet).sort());
  };

  useEffect(() => {
    fetchEntries();
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

  const handleUpdate = async (filename: string) => {
    const updatedTitle = formData.title.trim() || "Untitled journal";
    const original = entries.find((e) => e.filename === filename);

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
      body: JSON.stringify({ filename, ...formData }),
    });

    toast(renderToast("✏️", updatedTitle, "edited."));

    setEditingEntry(null);
    fetchEntries();
  };

  const handleDelete = async (filename: string) => {
    if (!confirm("Delete this entry?")) return;

    const entry = entries.find((e) => e.filename === filename);
    const entryTitle = entry?.title?.trim() || "Untitled journal";

    await fetch("/api/journals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });

    toast(renderToast("🗑️", entryTitle, "deleted."));

    fetchEntries();
  };

  const handleTogglePin = async (filename: string) => {
    const entry = entries.find((e) => e.filename === filename);
    if (!entry) return;

    const isPinning = !entry.pinned;
    let topBefore: number | null = null;
    let scrollBefore: number | null = null;

    if (isPinning && typeof window !== "undefined") {
      const node = entryRefs.current[filename];
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
      body: JSON.stringify({ filename }),
    });

    await fetchEntries();

    if (isPinning && topBefore !== null && scrollBefore !== null && typeof window !== "undefined") {
      // Read updated position and adjust scroll so the user stays anchored where the pin action happened.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const updatedNode = entryRefs.current[filename];
          if (!updatedNode) return;
          const topAfter = updatedNode.getBoundingClientRect().top;
          const delta = topAfter - topBefore!;
          window.scrollTo({ top: scrollBefore! + delta });
        });
      });
    }
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingEntry(entry.filename);
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
              <Textarea
                placeholder="Text"
                rows={5}
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
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
              return b.timestamp - a.timestamp;
            });

            return (
              <AnimatePresence initial={false}>
                {sortedEntries.map((entry) => (
                  <motion.div
                    key={entry.filename}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    layout
                    ref={(el) => {
                      entryRefs.current[entry.filename] = el;
                    }}
                  >
                    <Card className={entry.pinned ? "border-primary/20 bg-primary/5 transition-all duration-300 ease-in-out" : "transition-all duration-300 ease-in-out"}>
                      {editingEntry === entry.filename ? (
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
                          <Textarea
                            placeholder="Text"
                            rows={5}
                            value={formData.text}
                            onChange={(e) =>
                              setFormData({ ...formData, text: e.target.value })
                            }
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
                              onClick={() => handleUpdate(entry.filename)}
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
                                    const d = new Date(entry.timestamp);
                                    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
                                  })()}
                                </p>
                                <p className="text-sm text-foreground">
                                  {(() => {
                                    const d = new Date(entry.timestamp);
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
                                  onClick={() => handleTogglePin(entry.filename)}
                                  className={entry.pinned ? "text-primary" : ""}
                                >
                                  <Pin className="h-4 w-4" />
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
                                  onClick={() => handleDelete(entry.filename)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="whitespace-pre-wrap text-base leading-relaxed">
                              {entry.text}
                            </p>
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
    </main>
  );
}
