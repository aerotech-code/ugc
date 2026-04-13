
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router, Request, Response } from 'express';
// import fetch from 'node-fetch';
import { ApiResponse } from '../types/index.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { validateRequired } from '../middleware/validation.middleware.js';

const router = Router();

// simple in-memory placeholder for notes data
// In production this would be backed by a database.
interface NoteRecord {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  isPublic?: boolean;
  tags?: string[];
  summary?: string;
  version?: number;
  updatedAt?: Date;
}

const NOTES_CONTENT: Record<string, NoteRecord> = {};

// Type guard helper to ensure id is a string
function ensureStringId(id: unknown): string {
  if (typeof id === 'string') {
    return id;
  }
  if (Array.isArray(id)) {
    return id[0] as string;
  }
  return String(id);
}

// basic CRUD endpoints for notes (in-memory)
router.get('/notes', asyncHandler(async (req: Request, res: Response) => {
  const list = Object.values(NOTES_CONTENT);
  return res.status(200).json(new ApiResponse(200, list, 'Notes fetched'));
}));

router.get('/notes/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const note = NOTES_CONTENT[id];
  if (!note) {
    return res.status(404).json(new ApiResponse(404, null, 'Note not found'));
  }
  return res.status(200).json(new ApiResponse(200, note, 'Note fetched'));
}));

router.post('/notes', asyncHandler(async (req: Request, res: Response) => {
  const { title = '', content = '' } = req.body as { title?: string; content?: string };
  const id = `note-${Date.now()}`;
  const newNote: NoteRecord = { id, title, content, version: 1, updatedAt: new Date() };
  NOTES_CONTENT[id] = newNote;
  return res.status(201).json(new ApiResponse(201, newNote, 'Note created'));
}));

router.put('/notes/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = ensureStringId(req.params.id);
  const existing = NOTES_CONTENT[id];
  if (!existing) {
    return res.status(404).json(new ApiResponse(404, null, 'Note not found'));
  }
  const update = req.body as Partial<NoteRecord>;
  const merged: NoteRecord = {
    ...existing,
    ...update,
    version: (existing.version || 0) + 1,
    updatedAt: new Date(),
  };
  NOTES_CONTENT[id] = merged;
  return res.status(200).json(new ApiResponse(200, merged, 'Note updated'));
}));

router.delete('/notes/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  delete NOTES_CONTENT[id];
  return res.status(200).json(new ApiResponse(200, null, 'Note deleted'));
}));

// Endpoint to summarize a note. Expects optional { content: string } in body.
router.post('/notes/:id/summarize', asyncHandler(async (req: Request, res: Response) => {
  const noteId = req.params.id as string;
  let { content } = req.body as { content?: string };

  // if client didn't supply content, look up any cached text
  if (!content) {
    content = NOTES_CONTENT[noteId]?.content || '';
  }

  validateRequired(content, 'Content');

  const GEMINI_API_URL = process.env.GEMINI_API_URL;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_URL || !GEMINI_API_KEY) {
    // fallback stub
    const summary = `Summary service not configured. Content length: ${content.length}`;
    return res.status(200).json(new ApiResponse(200, { summary }, 'Stub summary returned'));
  }

  // construct prompt for Gemini
  const prompt = `You are an assistant that reads a note and returns a concise summary.\n\nNote:\n"""\n${content}\n"""\n\nProvide a single paragraph summary.`;

  try {
    const apiResp = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
      },
      body: JSON.stringify({ prompt, max_tokens: 300, temperature: 0.3 }),
    });

    const text = await apiResp.text();
    let summary = text;
    // if JSON returned, try parse
    try {
      const json = JSON.parse(text);
      if (json.output || json.data) {
        summary = json.output || json.data;
      }
    } catch {
      // not json, keep raw
    }

    // cache summary locally too
    if (NOTES_CONTENT[noteId]) {
      NOTES_CONTENT[noteId].summary = summary;
    }

    return res.status(200).json(new ApiResponse(200, { summary }, 'Summary generated'));
  } catch (err: any) {
    console.error('LLM summarize error', err);
    const summary = `Failed to summarize note: ${err.message}`;
    return res.status(500).json(new ApiResponse(500, null, summary));
  }
}));
export default router;
