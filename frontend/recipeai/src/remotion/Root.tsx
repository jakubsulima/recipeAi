import { Composition, Folder } from "remotion";
import { HomepagePromo, type HomepagePromoProps } from "./PromoVideo";
import {
  DishGenieLandingHeroDemo,
  DishGenieShortLoop,
  DishGenieTikTokPromo,
  LANDING_DURATION_IN_FRAMES,
  LOOP_DURATION_IN_FRAMES,
  TIKTOK_DURATION_IN_FRAMES,
} from "./EditedPromos";
import {
  PROMO_DURATION_IN_FRAMES,
  PROMO_FPS,
  PROMO_HEIGHT,
  PROMO_WIDTH,
  promoScenes,
} from "./promoData";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="Existing">
        <Composition
          id="HomepagePromo"
          component={HomepagePromo}
          durationInFrames={PROMO_DURATION_IN_FRAMES}
          fps={PROMO_FPS}
          width={PROMO_WIDTH}
          height={PROMO_HEIGHT}
          defaultProps={
            {
              scenes: promoScenes,
            } satisfies HomepagePromoProps
          }
        />
      </Folder>

      <Folder name="EditedPromos">
        <Composition
          id="DishGenieTikTokPromo"
          component={DishGenieTikTokPromo}
          durationInFrames={TIKTOK_DURATION_IN_FRAMES}
          fps={PROMO_FPS}
          width={1080}
          height={1920}
        />
        <Composition
          id="DishGenieLandingHeroDemo"
          component={DishGenieLandingHeroDemo}
          durationInFrames={LANDING_DURATION_IN_FRAMES}
          fps={PROMO_FPS}
          width={1920}
          height={1080}
        />
        <Composition
          id="DishGenieShortLoop"
          component={DishGenieShortLoop}
          durationInFrames={LOOP_DURATION_IN_FRAMES}
          fps={PROMO_FPS}
          width={1080}
          height={1080}
        />
      </Folder>
    </>
  );
};
