import { z } from "zod";

export interface TestDefinition {
  id: string;
  title: string;
  sphere: "trust" | "closeness" | "communication" | "values" | "intimacy" | "lifestyle";
  totalQuestions: number;
}

/**
 * Единый реестр всех тестов — источник правды (SSOT).
 * Любой сервис, UI-элемент или расчёт обязан ссылаться ИСКЛЮЧИТЕЛЬНО на этот реестр.
 * Любые отличия ID тестов от перечисленных здесь запрещены.
 */
export const TESTS_REGISTRY: Record<string, TestDefinition> = {
  test_attachment_indiv: {
    id: "test_attachment_indiv",
    title: "Стили привязанности",
    sphere: "trust",
    totalQuestions: 18,
  },
  test_love_languages: {
    id: "test_love_languages",
    title: "Языки заботы",
    sphere: "closeness",
    totalQuestions: 15,
  },
  test_eft_cycles: {
    id: "test_eft_cycles",
    title: "Стили проживания ссор",
    sphere: "communication",
    totalQuestions: 16,
  },
  test_life_values: {
    id: "test_life_values",
    title: "Ценностный компас",
    sphere: "values",
    totalQuestions: 15,
  },
  test_intimacy_passion: {
    id: "test_intimacy_passion",
    title: "Интимность и контакт",
    sphere: "intimacy",
    totalQuestions: 12,
  },
  test_routine_lifestyle: {
    id: "test_routine_lifestyle",
    title: "Быт и жизнестойкость",
    sphere: "lifestyle",
    totalQuestions: 14,
  },
};

/** Маппинг testId -> sphere для быстрого доступа */
export function getSphereByTestId(testId: string): TestDefinition["sphere"] | undefined {
  return TESTS_REGISTRY[testId]?.sphere;
}

/**
 * Вспомогательный тип для удобного перебора в UI.
 */
export interface TestRegistryEntry {
  label: string;
  sphere: TestDefinition["sphere"];
  questionCount: TestDefinition["totalQuestions"];
}

/** Массив для перебора в компонентах (сортировка по сфере) */
export const TEST_REGISTRY_ENTRIES: TestRegistryEntry[] = [
  { label: "Стили привязанности", sphere: "trust", questionCount: 18 },
  { label: "Языки заботы", sphere: "closeness", questionCount: 15 },
  { label: "Стили проживания ссор", sphere: "communication", questionCount: 16 },
  { label: "Ценностный компас", sphere: "values", questionCount: 15 },
  { label: "Интимность и контакт", sphere: "intimacy", questionCount: 12 },
  { label: "Быт и жизнестойкость", sphere: "lifestyle", questionCount: 14 },
];