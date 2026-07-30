"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

type Category = { id: string; name: string; slug: string };
type CategoryEdits = Record<string, { name: string; slug: string }>;

export const AdminCategoriesClient = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [edits, setEdits] = useState<CategoryEdits>({});
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/categories");
    const data = await response.json();
    const categories = data.categories ?? [];
    setItems(categories);
    setEdits(
      Object.fromEntries(
        categories.map((item: Category) => [
          item.id,
          { name: item.name, slug: item.slug },
        ]),
      ),
    );
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (active) {
        const categories = data.categories ?? [];
        setItems(categories);
        setEdits(
          Object.fromEntries(
            categories.map((item: Category) => [
              item.id,
              { name: item.name, slug: item.slug },
            ]),
          ),
        );
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const createCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });

    if (response.ok) {
      setName("");
      setSlug("");
      setMessage("Category created");
      load();
    } else {
      setMessage("Category creation failed");
    }
  };

  const removeCategory = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    load();
  };

  const saveCategory = async (id: string) => {
    const payload = edits[id];
    if (!payload) return;

    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setMessage(response.ok ? "Category updated" : "Category update failed");
    load();
  };

  return (
    <Stack spacing={3}>
      {message ? <Alert severity="info">{message}</Alert> : null}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Category
          </Typography>
          <Box
            component="form"
            onSubmit={createCategory}
            sx={{ display: "grid", gap: 2 }}
          >
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <Button type="submit" variant="contained">
              Create
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Existing Categories
          </Typography>
          <Stack spacing={1.25}>
            {items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  sx={{ flexGrow: 1 }}
                >
                  <TextField
                    size="small"
                    label="Name"
                    value={edits[item.id]?.name ?? item.name}
                    onChange={(event) =>
                      setEdits((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...(prev[item.id] ?? {
                            name: item.name,
                            slug: item.slug,
                          }),
                          name: event.target.value,
                        },
                      }))
                    }
                  />
                  <TextField
                    size="small"
                    label="Slug"
                    value={edits[item.id]?.slug ?? item.slug}
                    onChange={(event) =>
                      setEdits((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...(prev[item.id] ?? {
                            name: item.name,
                            slug: item.slug,
                          }),
                          slug: event.target.value,
                        },
                      }))
                    }
                  />
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => saveCategory(item.id)}
                >
                  Save
                </Button>
                <IconButton
                  color="error"
                  onClick={() => removeCategory(item.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
