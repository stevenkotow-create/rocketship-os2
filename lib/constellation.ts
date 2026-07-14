// Shared community constellation · a living network graph everyone invited edits.
// Backed by two shared Supabase tables (constellation_nodes / constellation_edges)
// with community RLS: any authenticated user reads everything and adds their own.

import { supabase } from "./supabase";

export type NodeKind = "company" | "person" | "industry" | "role" | "other";

export interface CNode {
  id: string;
  label: string;
  kind: NodeKind;
  created_by: string | null;
}

export interface CEdge {
  id: string;
  source: string;
  target: string;
  label: string | null;
  created_by: string | null;
}

export const NODE_KINDS: { id: NodeKind; label: string }[] = [
  { id: "company", label: "Company" },
  { id: "person", label: "Person" },
  { id: "industry", label: "Industry" },
  { id: "role", label: "Role" },
  { id: "other", label: "Other" },
];

export async function fetchGraph(): Promise<{ nodes: CNode[]; edges: CEdge[]; ok: boolean }> {
  if (!supabase) return { nodes: [], edges: [], ok: false };
  try {
    const [n, e] = await Promise.all([
      supabase.from("constellation_nodes").select("id,label,kind,created_by").order("created_at", { ascending: true }),
      supabase.from("constellation_edges").select("id,source,target,label,created_by"),
    ]);
    if (n.error || e.error) return { nodes: [], edges: [], ok: false };
    return { nodes: (n.data as CNode[]) || [], edges: (e.data as CEdge[]) || [], ok: true };
  } catch {
    return { nodes: [], edges: [], ok: false };
  }
}

export async function addNode(label: string, kind: NodeKind): Promise<CNode | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("constellation_nodes")
    .insert({ label: label.trim(), kind })
    .select("id,label,kind,created_by")
    .single();
  if (error) return null;
  return (data as CNode) || null;
}

export async function addEdge(source: string, target: string, label?: string): Promise<CEdge | null> {
  if (!supabase || source === target) return null;
  const { data, error } = await supabase
    .from("constellation_edges")
    .insert({ source, target, label: label?.trim() || null })
    .select("id,source,target,label,created_by")
    .single();
  if (error) return null;
  return (data as CEdge) || null;
}

export async function removeNode(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from("constellation_nodes").delete().eq("id", id);
  return !error;
}

export async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}
