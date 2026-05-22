import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const SOURCE_VIDEO = staticFile("promo/recipeai-homepage-promo.mp4");

type ClipConfig = {
  durationInFrames: number;
  sourceStart: number;
  sourceEnd: number;
  stageLabel?: string;
  caption?: string;
  subcaption?: string;
  kicker?: string;
  scaleFrom: number;
  scaleTo: number;
  xFrom: number;
  xTo: number;
  yFrom: number;
  yTo: number;
  captionTop?: number;
  captionBottom?: number;
  captionWidth?: number;
  showTealAccent?: boolean;
};

const sumDurations = (clips: readonly ClipConfig[]) =>
  clips.reduce((total, clip) => total + clip.durationInFrames, 0);

const clipStartAt = (clips: readonly ClipConfig[], index: number) =>
  clips.slice(0, index).reduce((total, clip) => total + clip.durationInFrames, 0);

const shellShadow = "0 24px 80px rgba(17, 17, 17, 0.14)";

const captionBoxStyle: CSSProperties = {
  background: "rgba(17, 17, 17, 0.78)",
  color: "#ffffff",
  borderRadius: 30,
  padding: "18px 24px",
  boxShadow: "0 18px 46px rgba(17, 17, 17, 0.22)",
};

const softCardStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.92)",
  border: "1px solid rgba(17,17,17,0.08)",
  boxShadow: "0 22px 60px rgba(17,17,17,0.12)",
  backdropFilter: "blur(18px)",
};

const BrandPill = ({ inverse = false }: { inverse?: boolean }) => (
  <div
    style={{
      position: "absolute",
      top: 44,
      left: 44,
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 18px",
      borderRadius: 999,
      background: inverse ? "rgba(17,17,17,0.82)" : "rgba(255,255,255,0.9)",
      color: inverse ? "#ffffff" : "#111111",
      boxShadow: inverse ? "0 18px 40px rgba(17,17,17,0.24)" : shellShadow,
      zIndex: 40,
    }}
  >
    <img
      src={staticFile("dish-genie-simple-icon.png")}
      style={{ width: 32, height: 32, objectFit: "contain" }}
    />
    <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em" }}>
      DishGenie
    </div>
  </div>
);

const SourceVerticalVideo = ({
  clip,
  localFrame,
  rounded = 0,
}: {
  clip: ClipConfig;
  localFrame: number;
  rounded?: number;
}) => {
  const progress = interpolate(
    localFrame,
    [0, Math.max(clip.durationInFrames - 1, 1)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    },
  );

  const intro = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scale = interpolate(progress, [0, 1], [clip.scaleFrom, clip.scaleTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(progress, [0, 1], [clip.xFrom, clip.xTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(progress, [0, 1], [clip.yFrom, clip.yTo], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rise = interpolate(intro, [0, 1], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settleScale = interpolate(intro, [0, 1], [0.985, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        borderRadius: rounded,
      }}
    >
      <OffthreadVideo
        src={SOURCE_VIDEO}
        trimBefore={clip.sourceStart}
        trimAfter={clip.sourceEnd}
        muted
        playbackRate={
          (clip.sourceEnd - clip.sourceStart) / clip.durationInFrames
        }
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translate(${x}px, ${y + rise}px) scale(${scale * settleScale})`,
        }}
      />
    </AbsoluteFill>
  );
};

const SocialCaption = ({
  clip,
  localFrame,
  finalCard,
}: {
  clip: ClipConfig;
  localFrame: number;
  finalCard?: ReactNode;
}) => {
  const entrance = interpolate(localFrame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const translateY = interpolate(entrance, [0, 1], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (finalCard) {
    return (
      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 72,
          opacity,
          transform: `translateY(${translateY}px)`,
          zIndex: 45,
        }}
      >
        {finalCard}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: clip.captionTop ?? 160,
        left: "50%",
        width: clip.captionWidth ?? 860,
        maxWidth: "calc(100% - 96px)",
        transform: `translateX(-50%) translateY(${translateY}px)`,
        opacity,
        zIndex: 45,
      }}
    >
      <div style={captionBoxStyle}>
        {clip.kicker ? (
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: clip.showTealAccent ? "#7ce4c8" : "#ffd43c",
              marginBottom: 8,
            }}
          >
            {clip.kicker}
          </div>
        ) : null}
        {clip.caption ? (
          <div
            style={{
              fontSize: 58,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: "-0.05em",
              textAlign: "center",
            }}
          >
            {clip.caption}
          </div>
        ) : null}
        {clip.subcaption ? (
          <div
            style={{
              marginTop: 10,
              fontSize: 25,
              lineHeight: 1.25,
              textAlign: "center",
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {clip.subcaption}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const HeroCaption = ({
  clip,
  localFrame,
  isFinal,
}: {
  clip: ClipConfig;
  localFrame: number;
  isFinal: boolean;
}) => {
  const entrance = interpolate(localFrame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const x = interpolate(entrance, [0, 1], [-18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 88,
        top: 180,
        width: 720,
        opacity,
        transform: `translateX(${x}px)`,
      }}
    >
      {clip.kicker ? (
        <div
          style={{
            display: "inline-flex",
            marginBottom: 18,
            padding: "10px 16px",
            borderRadius: 999,
            background: "rgba(255,212,60,0.16)",
            color: isFinal ? "#0a5f53" : "#9b6500",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 18,
          }}
        >
          {clip.kicker}
        </div>
      ) : null}

      {clip.caption ? (
        <div
          style={{
            color: "#111111",
            fontSize: isFinal ? 84 : 74,
            fontWeight: 900,
            lineHeight: 0.98,
            letterSpacing: "-0.05em",
            marginBottom: 18,
          }}
        >
          {clip.caption}
        </div>
      ) : null}

      {clip.subcaption ? (
        <div
          style={{
            color: "rgba(17,17,17,0.72)",
            fontSize: isFinal ? 30 : 28,
            lineHeight: 1.28,
            maxWidth: 640,
          }}
        >
          {clip.subcaption}
        </div>
      ) : null}
    </div>
  );
};

const StageProgress = ({
  total,
  index,
  bottom = 48,
}: {
  total: number;
  index: number;
  bottom?: number;
}) => (
  <div
    style={{
      position: "absolute",
      right: 48,
      bottom,
      display: "flex",
      gap: 10,
      zIndex: 40,
    }}
  >
    {Array.from({ length: total }).map((_, itemIndex) => (
      <div
        key={itemIndex}
        style={{
          width: itemIndex === index ? 54 : 18,
          height: 12,
          borderRadius: 999,
          background:
            itemIndex <= index ? "#ffd43c" : "rgba(255,255,255,0.34)",
        }}
      />
    ))}
  </div>
);

const tiktokClips: readonly ClipConfig[] = [
  {
    durationInFrames: 60,
    sourceStart: 6,
    sourceEnd: 54,
    kicker: "DishGenie",
    caption: "Food at home, but no dinner idea?",
    scaleFrom: 1.42,
    scaleTo: 1.48,
    xFrom: -280,
    xTo: -320,
    yFrom: -40,
    yTo: -90,
    captionTop: 170,
  },
  {
    durationInFrames: 60,
    sourceStart: 18,
    sourceEnd: 96,
    caption: "Add what's in your fridge",
    scaleFrom: 1.48,
    scaleTo: 1.56,
    xFrom: -300,
    xTo: -330,
    yFrom: -40,
    yTo: -110,
    captionTop: 165,
  },
  {
    durationInFrames: 60,
    sourceStart: 118,
    sourceEnd: 186,
    caption: "Choose your taste",
    scaleFrom: 1.46,
    scaleTo: 1.54,
    xFrom: -295,
    xTo: -330,
    yFrom: -10,
    yTo: -80,
    captionTop: 165,
  },
  {
    durationInFrames: 90,
    sourceStart: 224,
    sourceEnd: 316,
    caption: "AI creates recipe ideas",
    scaleFrom: 1.46,
    scaleTo: 1.62,
    xFrom: -300,
    xTo: -360,
    yFrom: -20,
    yTo: -170,
    captionTop: 155,
    showTealAccent: true,
  },
  {
    durationInFrames: 60,
    sourceStart: 336,
    sourceEnd: 410,
    caption: "Save your favorites",
    scaleFrom: 1.5,
    scaleTo: 1.58,
    xFrom: -315,
    xTo: -350,
    yFrom: -140,
    yTo: -220,
    captionTop: 165,
  },
  {
    durationInFrames: 60,
    sourceStart: 444,
    sourceEnd: 516,
    caption: "Build a shopping list",
    scaleFrom: 1.46,
    scaleTo: 1.54,
    xFrom: -305,
    xTo: -340,
    yFrom: -40,
    yTo: -100,
    captionTop: 165,
  },
  {
    durationInFrames: 60,
    sourceStart: 500,
    sourceEnd: 552,
    scaleFrom: 1.42,
    scaleTo: 1.5,
    xFrom: -290,
    xTo: -330,
    yFrom: -60,
    yTo: -120,
  },
];

const landingClips: readonly ClipConfig[] = [
  {
    durationInFrames: 72,
    sourceStart: 8,
    sourceEnd: 72,
    stageLabel: "Hook",
    kicker: "DishGenie",
    caption: "Food at home, but no dinner idea?",
    subcaption: "Your fridge probably has dinner in it already.",
    scaleFrom: 1.26,
    scaleTo: 1.31,
    xFrom: -220,
    xTo: -245,
    yFrom: -20,
    yTo: -50,
  },
  {
    durationInFrames: 72,
    sourceStart: 24,
    sourceEnd: 96,
    stageLabel: "Ingredients",
    kicker: "Step 1",
    caption: "Add what's in your fridge",
    subcaption: "Start with the ingredients you already have at home.",
    scaleFrom: 1.28,
    scaleTo: 1.34,
    xFrom: -225,
    xTo: -250,
    yFrom: -20,
    yTo: -70,
  },
  {
    durationInFrames: 66,
    sourceStart: 120,
    sourceEnd: 192,
    stageLabel: "Taste",
    kicker: "Step 2",
    caption: "Choose your taste",
    subcaption: "Diet preferences shape more useful recipe ideas.",
    scaleFrom: 1.28,
    scaleTo: 1.35,
    xFrom: -225,
    xTo: -255,
    yFrom: 10,
    yTo: -60,
  },
  {
    durationInFrames: 96,
    sourceStart: 220,
    sourceEnd: 318,
    stageLabel: "Recipe",
    kicker: "Step 3",
    caption: "AI creates recipe ideas",
    subcaption: "Turn ingredients into a personalized dinner in seconds.",
    scaleFrom: 1.3,
    scaleTo: 1.42,
    xFrom: -235,
    xTo: -285,
    yFrom: 0,
    yTo: -120,
  },
  {
    durationInFrames: 72,
    sourceStart: 340,
    sourceEnd: 414,
    stageLabel: "Saved",
    kicker: "Step 4",
    caption: "Save your favorites",
    subcaption: "Keep your winning recipes ready for next time.",
    scaleFrom: 1.32,
    scaleTo: 1.38,
    xFrom: -240,
    xTo: -270,
    yFrom: -90,
    yTo: -160,
  },
  {
    durationInFrames: 72,
    sourceStart: 440,
    sourceEnd: 520,
    kicker: "Step 5",
    caption: "Build a shopping list",
    subcaption: "Move straight from recipe to ingredients you can buy.",
    scaleFrom: 1.28,
    scaleTo: 1.34,
    xFrom: -225,
    xTo: -250,
    yFrom: -20,
    yTo: -90,
  },
  {
    durationInFrames: 90,
    sourceStart: 500,
    sourceEnd: 552,
    kicker: "DishGenie",
    caption: "Turn your fridge into dinner",
    subcaption: "Try DishGenie free\n dishgenie.app",
    scaleFrom: 1.24,
    scaleTo: 1.3,
    xFrom: -215,
    xTo: -245,
    yFrom: -30,
    yTo: -90,
  },
];

const loopClips: readonly ClipConfig[] = [
  {
    durationInFrames: 66,
    sourceStart: 20,
    sourceEnd: 92,
    scaleFrom: 1.56,
    scaleTo: 1.64,
    xFrom: -318,
    xTo: -350,
    yFrom: -40,
    yTo: -100,
  },
  {
    durationInFrames: 66,
    sourceStart: 226,
    sourceEnd: 300,
    scaleFrom: 1.54,
    scaleTo: 1.68,
    xFrom: -315,
    xTo: -380,
    yFrom: -20,
    yTo: -180,
  },
  {
    durationInFrames: 78,
    sourceStart: 258,
    sourceEnd: 334,
    scaleFrom: 1.68,
    scaleTo: 1.74,
    xFrom: -372,
    xTo: -410,
    yFrom: -170,
    yTo: -240,
  },
];

export const TIKTOK_DURATION_IN_FRAMES = sumDurations(tiktokClips);
export const LANDING_DURATION_IN_FRAMES = sumDurations(landingClips);
export const LOOP_DURATION_IN_FRAMES = sumDurations(loopClips);

export const DishGenieTikTokPromo = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #191919 0%, #101010 45%, #0a0a0a 100%)",
        fontFamily:
          '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 8%, rgba(255,212,60,0.18), transparent 24%), radial-gradient(circle at 86% 22%, rgba(33,171,150,0.16), transparent 22%)",
        }}
      />

      <BrandPill inverse />

      {tiktokClips.map((clip, index) => {
        const from = clipStartAt(tiktokClips, index);

        return (
          <Sequence
            key={`${clip.caption ?? "cta"}-${index}`}
            from={from}
            durationInFrames={clip.durationInFrames}
          >
            <AbsoluteFill>
              <SourceVerticalVideo clip={clip} localFrame={frame - from} />
              <AbsoluteFill
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.16) 28%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.08) 100%)",
                }}
              />
              <SocialCaption
                clip={clip}
                localFrame={frame - from}
                finalCard={
                  index === tiktokClips.length - 1 ? (
                    <div
                      style={{
                        ...captionBoxStyle,
                        padding: "22px 26px",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#7ce4c8",
                          marginBottom: 8,
                        }}
                      >
                        DishGenie
                      </div>
                      <div
                        style={{
                          fontSize: 56,
                          fontWeight: 900,
                          lineHeight: 1.02,
                          letterSpacing: "-0.05em",
                          marginBottom: 10,
                        }}
                      >
                        Turn your fridge into dinner
                      </div>
                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 800,
                          color: "#ffd43c",
                          marginBottom: 6,
                        }}
                      >
                        Try it free
                      </div>
                      <div
                        style={{
                          fontSize: 34,
                          fontWeight: 900,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        dishgenie.app
                      </div>
                    </div>
                  ) : undefined
                }
              />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const DishGenieLandingHeroDemo = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #fffaf0 0%, #fff2c9 42%, #fefefe 100%)",
        fontFamily:
          '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,212,60,0.22), transparent 24%), radial-gradient(circle at 82% 24%, rgba(20,160,140,0.1), transparent 20%), radial-gradient(circle at 78% 78%, rgba(255,176,0,0.12), transparent 20%)",
        }}
      />

      <BrandPill />

      {landingClips.map((clip, index) => {
        const from = clipStartAt(landingClips, index);
        const localFrame = frame - from;
        const isFinal = index === landingClips.length - 1;

        return (
          <Sequence
            key={`${clip.caption ?? "final"}-${index}`}
            from={from}
            durationInFrames={clip.durationInFrames}
          >
            <AbsoluteFill>
              <HeroCaption clip={clip} localFrame={localFrame} isFinal={isFinal} />

              <div
                style={{
                  position: "absolute",
                  right: 108,
                  top: 88,
                  width: 590,
                  height: 904,
                  borderRadius: 42,
                  padding: 18,
                  background: "#111111",
                  boxShadow: shellShadow,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    left: "50%",
                    width: 132,
                    height: 28,
                    borderRadius: 999,
                    background: "#111111",
                    transform: "translateX(-50%)",
                    zIndex: 10,
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    borderRadius: 28,
                    background: "#fff",
                  }}
                >
                  <SourceVerticalVideo clip={clip} localFrame={localFrame} rounded={28} />
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  left: 88,
                  bottom: 74,
                  display: "flex",
                  gap: 12,
                }}
              >
                {landingClips.slice(0, 5).map((stage, stageIndex) => (
                  <div
                    key={stage.stageLabel ?? `stage-${stageIndex}`}
                    style={{
                      ...softCardStyle,
                      borderRadius: 999,
                      padding: "12px 18px",
                      color:
                        stageIndex <= Math.min(index, 4)
                          ? "#111111"
                          : "rgba(17,17,17,0.54)",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {stage.stageLabel}
                  </div>
                ))}
              </div>

              <StageProgress total={landingClips.length} index={index} bottom={74} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const DishGenieShortLoop = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(160deg, #fff6da 0%, #ffe8a3 55%, #fffdf7 100%)",
        fontFamily:
          '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 18%, rgba(255,212,60,0.25), transparent 20%), radial-gradient(circle at 84% 20%, rgba(20,160,140,0.12), transparent 18%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          right: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 40,
        }}
      >
        <div
          style={{
            ...softCardStyle,
            borderRadius: 999,
            padding: "12px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <img
            src={staticFile("dish-genie-simple-icon.png")}
            style={{ width: 26, height: 26, objectFit: "contain" }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, color: "#111111" }}>
            DishGenie
          </div>
        </div>

        <div
          style={{
            ...softCardStyle,
            borderRadius: 999,
            padding: "10px 14px",
            fontSize: 16,
            fontWeight: 700,
            color: "#0a5f53",
          }}
        >
          From fridge ingredients to recipe ideas
        </div>
      </div>

      {loopClips.map((clip, index) => {
        const from = clipStartAt(loopClips, index);

        return (
          <Sequence
            key={`loop-${index}`}
            from={from}
            durationInFrames={clip.durationInFrames}
          >
            <AbsoluteFill
              style={{
                padding: 84,
              }}
            >
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  borderRadius: 40,
                  overflow: "hidden",
                  boxShadow: shellShadow,
                }}
              >
                <SourceVerticalVideo clip={clip} localFrame={frame - from} rounded={40} />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
