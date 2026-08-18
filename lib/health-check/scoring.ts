import {
  HEALTH_CATEGORY_LABELS,
  HEALTH_CHECK_QUESTIONS,
  type HealthCheckCategory,
} from "@/lib/health-check/questions";

export type HealthCheckAnswers = Record<
  string,
  number
>;

export type HealthCategoryResult = {
  category: HealthCheckCategory;
  label: string;
  score: number;
  status: string;
};

export type HealthCheckResult = {
  score: number;
  status: string;
  summary: string;
  categories: HealthCategoryResult[];
  recommendations: string[];
};

function clampScore(value: number) {
  return Math.max(
    0,
    Math.min(100, Math.round(value))
  );
}

export function getHealthScoreStatus(score: number) {
  if (score >= 85) {
    return "Excellent";
  }

  if (score >= 70) {
    return "Good";
  }

  if (score >= 50) {
    return "Needs attention";
  }

  return "At risk";
}

function getSummary(score: number) {
  if (score >= 85) {
    return "Your home technology is well organized and prepared. A few refinements can make your records even easier to maintain.";
  }

  if (score >= 70) {
    return "You have a solid foundation, but a few gaps could make troubleshooting, replacements, or warranty claims harder than they need to be.";
  }

  if (score >= 50) {
    return "Some important information is organized, but several gaps could create unnecessary work when technology breaks or needs support.";
  }

  return "Important home technology information is currently scattered or difficult to recover. Creating one dependable system would significantly improve your readiness.";
}

export function calculateHealthCheck(
  answers: HealthCheckAnswers
): HealthCheckResult {
  const scoredQuestions =
    HEALTH_CHECK_QUESTIONS.map((question) => ({
      ...question,
      value: answers[question.id] ?? 0,
    }));

  const total = scoredQuestions.reduce(
    (sum, question) => sum + question.value,
    0
  );

  const maximum =
    HEALTH_CHECK_QUESTIONS.length * 10;

  const score = clampScore(
    (total / maximum) * 100
  );

  const categories = (
    Object.keys(
      HEALTH_CATEGORY_LABELS
    ) as HealthCheckCategory[]
  ).map((category) => {
    const questions =
      scoredQuestions.filter(
        (question) =>
          question.category === category
      );

    const categoryMaximum =
      questions.length * 10;

    const categoryTotal =
      questions.reduce(
        (sum, question) =>
          sum + question.value,
        0
      );

    const categoryScore =
      categoryMaximum > 0
        ? clampScore(
            (categoryTotal /
              categoryMaximum) *
              100
          )
        : 0;

    return {
      category,
      label:
        HEALTH_CATEGORY_LABELS[
          category
        ],
      score: categoryScore,
      status:
        getHealthScoreStatus(
          categoryScore
        ),
    };
  });

  const recommendations =
    scoredQuestions
      .filter(
        (question) =>
          question.value < 10
      )
      .sort(
        (left, right) =>
          left.value - right.value
      )
      .slice(0, 3)
      .map(
        (question) =>
          question.recommendation
      );

  if (
    recommendations.length < 3
  ) {
    const extras = [
      "Keep your home technology inventory current whenever you add or replace a device.",
      "Review your technology records a few times each year.",
      "Keep important receipts, warranties, manuals, and network details together.",
    ];

    for (const extra of extras) {
      if (
        recommendations.length >= 3
      ) {
        break;
      }

      if (
        !recommendations.includes(
          extra
        )
      ) {
        recommendations.push(extra);
      }
    }
  }

  return {
    score,
    status:
      getHealthScoreStatus(score),
    summary: getSummary(score),
    categories,
    recommendations,
  };
}
