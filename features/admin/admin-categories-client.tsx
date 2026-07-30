"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { categoryService } from "@/services/categories/category.service";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_visible?: boolean;
  sort_order?: number;
};
type CategoryEdits = Record<
  string,
  {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    visible: boolean;
    sortOrder: number;
  }
>;

export const AdminCategoriesClient = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [edits, setEdits] = useState<CategoryEdits>({});
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [visible, setVisible] = useState(true);
  const [sortOrder, setSortOrder] = useState(100);
  const [message, setMessage] = useState("");

  const load = async () => {
    const categories = (await categoryService.listAdminCategories()) as Category[];
    setItems(categories);
    setEdits(
      Object.fromEntries(
        categories.map((item: Category) => [
          item.id,
            {
              name: item.name,
              slug: item.slug,
              description: item.description ?? "",
              imageUrl: item.image_url ?? "",
              visible: item.is_visible ?? true,
              sortOrder: item.sort_order ?? 100,
            },
        ]),
      ),
    );
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      const data = await categoryService.listAdminCategories();
      if (active) {
        const categories = data as Category[];
        setItems(categories);
        setEdits(
          Object.fromEntries(
            categories.map((item: Category) => [
              item.id,
              {
                name: item.name,
                slug: item.slug,
                description: item.description ?? "",
                imageUrl: item.image_url ?? "",
                visible: item.is_visible ?? true,
                sortOrder: item.sort_order ?? 100,
              },
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
    try {
      await categoryService.createCategory({
        name,
        slug,
        description,
        imageUrl,
        visible,
        sortOrder,
      });
      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
      setVisible(true);
      setSortOrder(100);
      setMessage("Category created");
      load();
    } catch {
      setMessage("Category creation failed");
    }
  };

  const removeCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      load();
    } catch {
      setMessage("Category deletion failed");
    }
  };

  const saveCategory = async (id: string) => {
    const payload = edits[id];
    if (!payload) return;

    try {
      await categoryService.updateCategory(id, payload);
      setMessage("Category updated");
      load();
    } catch {
      setMessage("Category update failed");
    }
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
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              minRows={2}
            />
            <TextField
              label="Category Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <TextField
              label="Sort Order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Checkbox checked={visible} onChange={(e) => setVisible(e.target.checked)} />
              <Typography>Visible</Typography>
            </Stack>
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
                            description: item.description ?? "",
                            imageUrl: item.image_url ?? "",
                            visible: item.is_visible ?? true,
                            sortOrder: item.sort_order ?? 100,
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
                            description: item.description ?? "",
                            imageUrl: item.image_url ?? "",
                            visible: item.is_visible ?? true,
                            sortOrder: item.sort_order ?? 100,
                          }),
                          slug: event.target.value,
                        },
                      }))
                    }
                  />
                  <TextField
                    size="small"
                    label="Description"
                    value={edits[item.id]?.description ?? item.description ?? ""}
                    onChange={(event) =>
                      setEdits((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...(prev[item.id] ?? {
                            name: item.name,
                            slug: item.slug,
                            description: item.description ?? "",
                            imageUrl: item.image_url ?? "",
                            visible: item.is_visible ?? true,
                            sortOrder: item.sort_order ?? 100,
                          }),
                          description: event.target.value,
                        },
                      }))
                    }
                  />
                  <TextField
                    size="small"
                    label="Image URL"
                    value={edits[item.id]?.imageUrl ?? item.image_url ?? ""}
                    onChange={(event) =>
                      setEdits((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...(prev[item.id] ?? {
                            name: item.name,
                            slug: item.slug,
                            description: item.description ?? "",
                            imageUrl: item.image_url ?? "",
                            visible: item.is_visible ?? true,
                            sortOrder: item.sort_order ?? 100,
                          }),
                          imageUrl: event.target.value,
                        },
                      }))
                    }
                  />
                  <TextField
                    size="small"
                    label="Sort"
                    type="number"
                    value={edits[item.id]?.sortOrder ?? item.sort_order ?? 100}
                    onChange={(event) =>
                      setEdits((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...(prev[item.id] ?? {
                            name: item.name,
                            slug: item.slug,
                            description: item.description ?? "",
                            imageUrl: item.image_url ?? "",
                            visible: item.is_visible ?? true,
                            sortOrder: item.sort_order ?? 100,
                          }),
                          sortOrder: Number(event.target.value),
                        },
                      }))
                    }
                  />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Checkbox
                      checked={edits[item.id]?.visible ?? item.is_visible ?? true}
                      onChange={(event) =>
                        setEdits((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...(prev[item.id] ?? {
                              name: item.name,
                              slug: item.slug,
                              description: item.description ?? "",
                              imageUrl: item.image_url ?? "",
                              visible: item.is_visible ?? true,
                              sortOrder: item.sort_order ?? 100,
                            }),
                            visible: event.target.checked,
                          },
                        }))
                      }
                    />
                    <Typography variant="caption">Visible</Typography>
                  </Stack>
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
