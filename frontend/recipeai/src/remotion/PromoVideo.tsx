import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  SCENE_STEP_IN_FRAMES,
  type PromoScene,
} from "./promoData";

export type HomepagePromoProps = {
  scenes: readonly PromoScene[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const shellStyle: CSSProperties = {
  background:
    "linear-gradient(150deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))",
  border: "1px solid rgba(17,17,17,0.08)",
  boxShadow: "0 24px 70px rgba(17,17,17,0.12)",
  backdropFilter: "blur(18px)",
};

const PhoneScene = ({
  scene,
  index,
  localFrame,
}: {
  scene: PromoScene;
  index: number;
  localFrame: number;
}) => {
  const enterProgress = interpolate(localFrame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const enterY = interpolate(enterProgress, [0, 1], [42, 0]);
  const enterX = interpolate(
    enterProgress,
    [0, 1],
    [index % 2 === 0 ? 12 : -12, 0],
  );
  const enterScale = interpolate(enterProgress, [0, 1], [0.985, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${enterX}px, ${enterY}px) scale(${enterScale})`,
      }}
    >
      <Img
        src={staticFile(scene.screenshot)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </AbsoluteFill>
  );
};

const SceneOverlay = ({
  scene,
  index,
  activeIndex,
}: {
  scene: PromoScene;
  index: number;
  activeIndex: number;
}) => {
  const isActive = index === activeIndex;
  const isPast = index < activeIndex;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: isPast ? 0.6 : 1,
      }}
    >
      <div
        style={{
          width: isActive ? 24 : 16,
          height: isActive ? 24 : 16,
          borderRadius: 999,
          background: isPast || isActive ? scene.accent : "rgba(17,17,17,0.14)",
          boxShadow: isActive ? `0 0 0 8px ${scene.accent}22` : "none",
          transition: "none",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div
          style={{
            color: "rgba(17,17,17,0.54)",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {scene.step}
        </div>
        <div
          style={{
            color: isActive ? "#111111" : "rgba(17,17,17,0.78)",
            fontSize: 28,
            fontWeight: isActive ? 800 : 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
          }}
        >
          {scene.title}
        </div>
      </div>
    </div>
  );
};

export const HomepagePromo = ({ scenes }: HomepagePromoProps) => {
  const frame = useCurrentFrame();
  const activeIndex = clamp(
    Math.floor(frame / SCENE_STEP_IN_FRAMES),
    0,
    scenes.length - 1,
  );
  const activeScene = scenes[activeIndex];
  const activeSceneFrame = frame - activeIndex * SCENE_STEP_IN_FRAMES;
  const bottomCardLift = interpolate(
    frame % SCENE_STEP_IN_FRAMES,
    [0, 20, SCENE_STEP_IN_FRAMES],
    [18, 0, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );
  const ambientDriftX = Math.sin(frame / 45) * 18;
  const ambientDriftY = Math.cos(frame / 60) * 30;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #fff8df 0%, #fff1b9 42%, #fffaf0 100%)",
        fontFamily:
          '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 12%, rgba(255,212,60,0.32), transparent 22%), radial-gradient(circle at 18% 34%, rgba(255,212,60,0.18), transparent 26%), radial-gradient(circle at 85% 26%, rgba(255,176,0,0.16), transparent 22%)",
          transform: `translate(${ambientDriftX}px, ${ambientDriftY}px)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 72,
          left: 72,
          right: 72,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            ...shellStyle,
            alignSelf: "flex-start",
            borderRadius: 999,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Img
            src={staticFile("dish-genie-simple-icon.png")}
            style={{ width: 44, height: 44, objectFit: "contain" }}
          />
          <div
            style={{
              color: "#111111",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            DishGenie journey
          </div>
        </div>

        <div
          style={{
            color: "rgba(17,17,17,0.74)",
            fontSize: 26,
            lineHeight: 1.35,
            maxWidth: 760,
          }}
        >
          From what’s in your kitchen to a ready-to-shop plan.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
      top: 268,
      left: 72,
      right: 72,
      display: "grid",
      gridTemplateColumns: "1fr",
          gap: 18,
        }}
      >
        {scenes.map((scene, index) => (
          <SceneOverlay
            key={scene.screenshot}
            scene={scene}
            index={index}
            activeIndex={activeIndex}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          right: 72,
          top: 470,
          width: 520,
          height: 1128,
          borderRadius: 68,
          background: "#111111",
          padding: 18,
          boxShadow: "0 46px 120px rgba(17,17,17,0.34)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            width: 150,
            height: 30,
            transform: "translateX(-50%)",
            borderRadius: 999,
            background: "#111111",
            zIndex: 5,
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: 50,
            background: "#ffffff",
          }}
        >
          <PhoneScene
            scene={activeScene}
            index={activeIndex}
            localFrame={activeSceneFrame}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 48,
          right: 48,
          bottom: 64,
          ...shellStyle,
          borderRadius: 42,
          padding: "28px 30px 32px",
          transform: `translateY(${bottomCardLift}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              color: activeScene.accent,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {activeScene.step}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            {scenes.map((scene, index) => (
              <div
                key={scene.title}
                style={{
                  width: index === activeIndex ? 58 : 18,
                  height: 10,
                  borderRadius: 999,
                  background:
                    index <= activeIndex ? scene.accent : "rgba(17,17,17,0.1)",
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            color: "#111111",
            fontSize: 46,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: "-0.05em",
            marginBottom: 12,
          }}
        >
          {activeScene.title}
        </div>

        <div
          style={{
            color: "rgba(17,17,17,0.7)",
            fontSize: 28,
            lineHeight: 1.3,
          }}
        >
          {activeScene.caption}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 108,
          top: 344,
          width: 4,
          height: 368,
          borderRadius: 999,
          background: "rgba(17,17,17,0.08)",
        }}
      />
    </AbsoluteFill>
  );
};
