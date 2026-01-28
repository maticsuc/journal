"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Save, X, Trash2, Edit2, Pin } from "lucide-react";
import { getCategoryColor } from "@/lib/categories";

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

    await fetch("/api/journals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

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
    await fetch("/api/journals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, ...formData }),
    });

    setEditingEntry(null);
    fetchEntries();
  };

  const handleDelete = async (filename: string) => {
    if (!confirm("Delete this entry?")) return;

    await fetch("/api/journals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });

    fetchEntries();
  };

  const handleTogglePin = async (filename: string) => {
    await fetch("/api/journals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });

    fetchEntries();
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

          {/* Pinned Entries */}
          {entries
            .filter((e) => e.pinned)
            .map((entry) => (
              <Card
                key={entry.filename}
                className="border-primary/20 bg-primary/5 transition-all duration-300 ease-in-out"
              >
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
                          <div className="flex items-center gap-2">
                            <Pin className="h-4 w-4 text-primary" />
                            <p className="text-xs text-muted-foreground">
                              {(() => {
                                const d = new Date(entry.timestamp);
                                return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
                              })()}
                            </p>
                          </div>
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
                            className="text-primary"
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
            ))}

          {/* Unpinned Entries */}
          {entries
            .filter((e) => !e.pinned)
            .map((entry) => (
              <Card
                key={entry.filename}
                className="transition-all duration-300 ease-in-out"
              >
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
            ))}
        </div>
      </div>
    </main>
  );
}
