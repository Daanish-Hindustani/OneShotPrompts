ALTER TYPE "SubscriptionTier" RENAME TO "SubscriptionTier_old";

CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'BASIC', 'PRO');

ALTER TABLE "Subscription"
  ALTER COLUMN "tier" TYPE "SubscriptionTier"
  USING (
    CASE
      WHEN "tier"::text = 'TEAM' THEN 'PRO'::"SubscriptionTier"
      WHEN "tier"::text = 'BASIC' THEN 'BASIC'::"SubscriptionTier"
      WHEN "tier"::text = 'PRO' THEN 'PRO'::"SubscriptionTier"
      ELSE 'FREE'::"SubscriptionTier"
    END
  );

DROP TYPE "SubscriptionTier_old";
