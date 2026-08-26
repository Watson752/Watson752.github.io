"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { fetchAiAnswer } from "@/lib/chat-client";
import { COMMANDS, filterCommands, findCommand, parseSlashCommand } from "@/lib/commands";
import { matchFromGraphNode, matchQuery } from "@/lib/match-query";
import {
  getQuerySuggestionLabels,
  rankProjectsForMatch,
  resolveActiveGraphNodeIds,
} from "@/lib/portfolio";
import type {
  CommandResult,
  PortfolioSelectionSource,
  QueryMatch,
  RankedProject,
} from "@/types/portfolio";

const THINK_MS_GRAPH = 180;

export function usePortfolioIntelligence() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [match, setMatch] = useState<QueryMatch | null>(null);
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] =
    useState<PortfolioSelectionSource>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiRequestRef = useRef<AbortController | null>(null);

  const applyMatch = useCallback(
    (
      next: QueryMatch,
      meta: { displayQuery: string; source: PortfolioSelectionSource },
    ) => {
      setMatch(next);
      setCommandResult(null);
      setSubmittedQuery(meta.displayQuery);
      setSelectionSource(meta.source);
    },
    [],
  );

  const runCommand = useCallback((rawInput: string) => {
    const parsed = parseSlashCommand(rawInput);
    if (!parsed) return;

    aiRequestRef.current?.abort();

    const trimmed = rawInput.trim();
    setQuery(trimmed);
    setSelectedNodeId(null);
    setSelectionSource("query");
    setIsThinking(false);
    setAiError(null);
    setMatch(null);

    const command = findCommand(parsed.name);
    let lines: string[];

    if (!command) {
      lines = [`Unknown command: /${parsed.name}. Try /help.`];
    } else if (command.action.kind === "help") {
      lines = COMMANDS.map((c) => `/${c.name} — ${c.description}`);
    } else if (command.action.kind === "scroll") {
      document
        .querySelector(command.action.targetHref)
        ?.scrollIntoView({ behavior: "smooth" });
      lines = [`Jumped to ${command.action.targetHref}.`];
    } else if (command.action.kind === "open") {
      window.location.href = command.action.href;
      lines = [`Opening ${command.action.href}.`];
    } else {
      lines = [command.action.message];
    }

    setCommandResult({ kind: "command", commandName: parsed.name, lines });
    setSubmittedQuery(trimmed);
  }, []);

  const runQuery = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (trimmed.startsWith("/")) {
        runCommand(trimmed);
        return;
      }

      aiRequestRef.current?.abort();
      const controller = new AbortController();
      aiRequestRef.current = controller;

      setQuery(trimmed);
      setSelectedNodeId(null);
      setSelectionSource("query");
      setAiError(null);
      setIsThinking(true);

      applyMatch(matchQuery(trimmed), {
        displayQuery: trimmed,
        source: "query",
      });

      fetchAiAnswer(trimmed, controller.signal).then((result) => {
        if (controller.signal.aborted) return;

        if (result.ok) {
          setMatch((prev) =>
            prev && prev.query === trimmed ? { ...prev, response: result.reply, confidence: "ai" } : prev,
          );
        } else {
          setAiError(result.error);
        }
        setIsThinking(false);
      });
    },
    [applyMatch, runCommand],
  );

  const selectGraphNode = useCallback(
    (nodeId: string) => {
      aiRequestRef.current?.abort();
      setSelectedNodeId(nodeId);
      setSelectionSource("graph");
      setAiError(null);
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

  const handleCommandSelect = useCallback(
    (name: string) => {
      const text = `/${name}`;
      setQuery(text);
      runCommand(text);
    },
    [runCommand],
  );

  const suggestions = useMemo(() => getQuerySuggestionLabels(), []);

  const commandMatches = useMemo(() => {
    if (!query.startsWith("/")) return [];
    return filterCommands(query.slice(1));
  }, [query]);

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
    (match != null || commandResult != null) &&
    (submittedQuery.trim().length > 0 || selectionSource === "graph");

  const responseKey = commandResult
    ? `command:${commandResult.commandName}`
    : (match?.query ?? submittedQuery ?? "idle");

  return {
    query,
    setQuery,
    submittedQuery,
    match,
    commandResult,
    commandMatches,
    selectedNodeId,
    selectionSource,
    isThinking,
    aiError,
    hasSelection,
    responseKey,
    suggestions,
    rankedProjects,
    activeGraphNodeIds,
    runQuery,
    selectGraphNode,
    handleSubmit,
    handleSuggestionSelect,
    handleCommandSelect,
  };
}
