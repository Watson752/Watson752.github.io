"use client";

import { useCallback, useMemo, useState } from "react";
import { matchFromGraphNode, matchQuery } from "@/lib/match-query";
import {
  getQuerySuggestionLabels,
  rankProjectsForMatch,
  resolveActiveGraphNodeIds,
} from "@/lib/portfolio";
import type {
  PortfolioSelectionSource,
  QueryMatch,
  RankedProject,
} from "@/types/portfolio";

const THINK_MS_QUERY = 280;
const THINK_MS_GRAPH = 180;

export function usePortfolioIntelligence() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [match, setMatch] = useState<QueryMatch | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] =
    useState<PortfolioSelectionSource>(null);
  const [isThinking, setIsThinking] = useState(false);

  const applyMatch = useCallback(
    (
      next: QueryMatch,
      meta: { displayQuery: string; source: PortfolioSelectionSource },
    ) => {
      setMatch(next);
      setSubmittedQuery(meta.displayQuery);
      setSelectionSource(meta.source);
    },
    [],
  );

  const runQuery = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setQuery(trimmed);
      setSelectedNodeId(null);
      setSelectionSource("query");
      setIsThinking(true);

      window.setTimeout(() => {
        applyMatch(matchQuery(trimmed), {
          displayQuery: trimmed,
          source: "query",
        });
        setIsThinking(false);
      }, THINK_MS_QUERY);
    },
    [applyMatch],
  );

  const selectGraphNode = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      setSelectionSource("graph");
      setIsThinking(true);

      window.setTimeout(() => {
        const next = matchFromGraphNode(nodeId);
        setQuery(next.query);
        applyMatch(next, {
          displayQuery: next.query,
          source: "graph",
        });
        setIsThinking(false);
      }, THINK_MS_GRAPH);
    },
    [applyMatch],
  );

  const handleSubmit = useCallback(() => {
    runQuery(query);
  }, [query, runQuery]);

  const handleSuggestionSelect = useCallback(
    (label: string) => {
      setQuery(label);
      runQuery(label);
    },
    [runQuery],
  );

  const suggestions = useMemo(() => getQuerySuggestionLabels(), []);

  const rankedProjects: RankedProject[] = useMemo(
    () => rankProjectsForMatch(match),
    [match],
  );

  const activeGraphNodeIds = useMemo(
    () => resolveActiveGraphNodeIds(match, selectedNodeId),
    [match, selectedNodeId],
  );

  const hasSelection =
    !isThinking &&
    match != null &&
    (submittedQuery.trim().length > 0 || selectionSource === "graph");

  const responseKey =
    match?.presetId ?? match?.query ?? submittedQuery ?? "idle";

  return {
    query,
    setQuery,
    submittedQuery,
    match,
    selectedNodeId,
    selectionSource,
    isThinking,
    hasSelection,
    responseKey,
    suggestions,
    rankedProjects,
    activeGraphNodeIds,
    runQuery,
    selectGraphNode,
    handleSubmit,
    handleSuggestionSelect,
  };
}
