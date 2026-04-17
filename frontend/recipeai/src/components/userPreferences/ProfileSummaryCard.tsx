interface ProfileSummaryCardProps {
  accountPlan: string;
  activeDiet: string;
  recipeUsageLabel: string;
  dislikedIngredientsCount: number;
}

const ProfileSummaryCard = ({
  accountPlan,
  activeDiet,
  recipeUsageLabel,
  dislikedIngredientsCount,
}: ProfileSummaryCardProps) => {
  return (
    <div className="mobile-card-enter ambient-gradient-card mb-8 overflow-hidden rounded-3xl border border-accent/35 bg-secondary p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-text sm:text-4xl">My Profile</h1>
      <p className="mt-2 max-w-2xl text-text/70">
        One place to tune your diet and ingredient dislikes.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-background">
          Plan: {accountPlan}
        </span>
        <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-text">
          Diet: {activeDiet}
        </span>
        <span className="rounded-full border border-accent/35 bg-background px-3 py-1.5 text-sm text-text/75">
          Requests: {recipeUsageLabel}
        </span>
        <span className="rounded-full border border-accent/35 bg-background px-3 py-1.5 text-sm text-text/75">
          {dislikedIngredientsCount} disliked ingredient
          {dislikedIngredientsCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
};

export default ProfileSummaryCard;
