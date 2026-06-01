import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const policyUpdatedAt = "May 30, 2026";
const contactEmail = "support@dishgenie.app";
const contactEmailClassName = "font-semibold text-text hover:text-accent";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="border-t border-primary/10 pt-6">
    <h2 className="text-xl font-bold text-text">{title}</h2>
    <div className="mt-3 space-y-3 text-sm leading-6 text-text/70">
      {children}
    </div>
  </section>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-2 pl-5">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const ContactEmailLink = () => (
  <a className={contactEmailClassName} href={`mailto:${contactEmail}`}>
    {contactEmail}
  </a>
);

export const PrivacyPolicyPage = () => (
  <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
    <p className="text-sm font-semibold text-text/55">
      Last updated {policyUpdatedAt}
    </p>
    <h1 className="mt-3 text-3xl font-bold text-text md:text-4xl">
      Privacy Policy
    </h1>
    <p className="mt-4 text-base leading-7 text-text/70">
      Dish Genie uses account, recipe, fridge, shopping list, and analytics data
      to run the app, improve the product, and keep the service reliable. This
      policy explains what we collect, why we collect it, who may process it,
      and the choices you have.
    </p>

    <div className="mt-10 space-y-8">
      <Section title="Who We Are">
        <p>
          Dish Genie, also referred to as AI Kitchen in parts of the app, is a
          recipe planning and cooking assistant. For privacy questions or data
          requests, contact us at <ContactEmailLink />.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>
          We collect information you provide directly and information generated
          when you use the app.
        </p>
        <BulletList
          items={[
            "Account information, such as login identifiers and authentication data.",
            "Recipe prompts, generated recipe results, saved recipes, and public recipe activity.",
            "Recipes you save or publish may be visible to other users or visitors depending on app functionality, including the public latest-recipes browsing experience.",
            "Fridge items, ingredient names, shopping list items, and related cooking preferences.",
            "Analytics events, consent choices, device type, browser type, pages viewed, and approximate technical usage data.",
            "Security, error, and diagnostic logs used to protect and maintain the service.",
          ]}
        />
      </Section>

      <Section title="How We Use Information">
        <BulletList
          items={[
            "To create and secure user accounts.",
            "To generate recipe ideas from prompts, ingredients, preferences, and saved context.",
            "To save recipes, fridge items, shopping lists, and profile settings.",
            "To provide analytics, measure product usage, and improve features when analytics is enabled.",
            "To detect abuse, troubleshoot bugs, maintain security, and keep the service reliable.",
            "To respond to support, privacy, deletion, or account requests.",
            "Administrators may access account information and saved recipe content when needed to provide support, moderate abuse, investigate security issues, maintain the service, or comply with legal obligations.",
          ]}
        />
      </Section>

      <Section title="Legal Bases For Processing">
        <p>
          Depending on the feature, we process personal information to provide
          the service you request, to pursue legitimate interests such as
          security and product improvement, to comply with legal obligations,
          and, where required, based on your consent. Analytics consent remains
          separate from accepting these terms and can be changed from the app
          footer when analytics controls are available.
        </p>
      </Section>

      <Section title="AI Processing">
        <p>
          Dish Genie sends recipe prompts, ingredient context, and related
          cooking instructions to AI services, including Google Gemini or other
          model providers we may use to operate recipe generation. Do not enter
          sensitive personal information, medical information, or private data
          that is not needed for recipe suggestions.
        </p>
      </Section>

      <Section title="Analytics And Cookies">
        <p>
          Dish Genie may use cookies, local storage, or similar technologies for
          login, consent preferences, security, and analytics. Analytics is
          optional where the app shows analytics controls. You can change your
          analytics preference from the footer privacy settings button when
          analytics controls are available.
        </p>
      </Section>

      <Section title="Terms And Privacy Acknowledgement">
        <p>
          When you create an account, we record that you accepted the Terms of
          Service and acknowledged this Privacy Policy, along with the policy
          versions in effect at that time. This record helps us demonstrate what
          information was shown when the account was created.
        </p>
      </Section>

      <Section title="Third-Party Services">
        <p>
          We use third-party providers only as needed to operate the app. These
          providers may process information on our behalf.
        </p>
        <BulletList
          items={[
            "AI model providers for recipe generation, such as Google Gemini.",
            "Hosting, database, and infrastructure providers for running the application and storing user data.",
            "Authentication providers or identity services for login and account security.",
            "Analytics providers, such as PostHog, when analytics is available and enabled.",
            "Operational tools used for logs, errors, security, or customer support.",
          ]}
        />
      </Section>

      <Section title="When We Share Information">
        <p>
          We do not sell your personal information. We may share information
          with service providers that help run Dish Genie, when required by law,
          to protect the rights and security of users or the service, or as part
          of a business transfer such as a merger, acquisition, or sale of
          assets.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We keep account data, saved recipes, fridge items, shopping lists, and
          preferences while your account is active or as needed to provide the
          service. We may keep logs and diagnostic records for a limited period
          for security, debugging, abuse prevention, legal, and operational
          reasons. If you request deletion, we will delete or anonymize data
          unless we need to keep it for legitimate legal, security, or business
          reasons.
        </p>
      </Section>

      <Section title="International Processing">
        <p>
          Some service providers may process information in countries other than
          your own. Where required, we rely on appropriate safeguards or provider
          commitments for those transfers.
        </p>
      </Section>

      <Section title="Your Choices">
        <BulletList
          items={[
            "You can choose what prompts, recipes, fridge items, shopping list items, and preferences to save.",
            "You can change analytics consent where the app provides analytics controls.",
            "You can request access, correction, export, deletion, or help with your account by contacting us.",
            "You can stop using the service at any time.",
          ]}
        />
      </Section>

      <Section title="Children">
        <p>
          Dish Genie is not intended for children under 13. We do not knowingly
          collect personal information from children under 13. If you believe a
          child has provided personal information, contact us so we can review
          and delete it where appropriate.
        </p>
      </Section>

      <Section title="Security">
        <p>
          We use reasonable technical and organizational measures to protect the
          service and user data. No internet service can guarantee perfect
          security, so you should use a strong password, protect your login
          method, and avoid adding sensitive information that is not needed for
          recipes.
        </p>
      </Section>

      <Section title="Policy Updates">
        <p>
          We may update this Privacy Policy as Dish Genie changes. The updated
          date at the top of this page shows when the policy was last revised.
          Continued use of the app after an update means the new policy applies.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For privacy questions or data requests, email{" "}
          <ContactEmailLink />
          .
        </p>
      </Section>
    </div>

    <Link
      to="/terms"
      className="mt-10 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-accent/90"
    >
      View Terms of Service
    </Link>
  </article>
);

export const TermsOfServicePage = () => (
  <article className="mx-auto max-w-3xl px-5 py-12 md:px-8">
    <p className="text-sm font-semibold text-text/55">
      Last updated {policyUpdatedAt}
    </p>
    <h1 className="mt-3 text-3xl font-bold text-text md:text-4xl">
      Terms of Service
    </h1>
    <p className="mt-4 text-base leading-7 text-text/70">
      These terms describe the basic rules for using Dish Genie. By using the
      app, you agree to use it responsibly and understand that recipe and AI
      outputs require your own judgment.
    </p>

    <div className="mt-10 space-y-8">
      <Section title="Using Dish Genie">
        <p>
          Dish Genie helps users generate, browse, save, and organize recipe
          ideas. You are responsible for your account activity and for keeping
          your login details secure.
        </p>
        <p>
          Creating an account requires accepting these Terms of Service and
          acknowledging the Privacy Policy in effect at that time.
        </p>
      </Section>

      <Section title="Eligibility And Accounts">
        <p>
          You must be able to enter into these terms to use Dish Genie. You are
          responsible for the accuracy of information you provide, for activity
          under your account, and for keeping your account access secure. Notify
          us if you believe your account has been used without permission.
        </p>
      </Section>

      <Section title="Recipe And AI Output">
        <p>
          AI-generated recipes may be incomplete, inaccurate, or unsuitable for
          specific diets, allergies, equipment, or health needs. Check
          ingredients, cooking temperatures, allergens, and food safety details
          before preparing or eating a recipe.
        </p>
        <p>
          Dish Genie does not provide medical, nutrition, allergy, or food
          safety advice. You are responsible for deciding whether a recipe is
          appropriate for you and anyone you cook for.
        </p>
      </Section>

      <Section title="Acceptable Use">
        <BulletList
          items={[
            "Do not misuse, disrupt, overload, scrape, or attempt to damage the service.",
            "Do not attempt to access accounts, systems, data, or features you are not authorized to access.",
            "Do not upload unlawful, harmful, abusive, infringing, deceptive, or malicious content.",
            "Do not reverse engineer restricted parts of the service or bypass security controls.",
            "Do not use Dish Genie to create unsafe instructions or content that could harm people.",
          ]}
        />
      </Section>

      <Section title="Your Content">
        <p>
          You keep ownership of prompts, recipes, fridge items, shopping list
          items, preferences, and other content you add to Dish Genie. You grant
          us a limited permission to host, store, display, process, transmit,
          and use that content as needed to provide, secure, support, and
          improve the service.
        </p>
        <p>
          You are responsible for making sure your content is lawful and that
          you have the rights needed to add it to the app.
        </p>
      </Section>

      <Section title="Public Recipes">
        <p>
          If the app allows you to publish or share recipes publicly, other
          users may view and use that content. Do not publish private,
          sensitive, unlawful, or third-party content unless you have permission
          to share it.
        </p>
      </Section>

      <Section title="Payments And Paid Features">
        <p>
          If paid features are added later, pricing, billing, cancellation, and
          refund terms will be shown before purchase or in the relevant plan
          details. Until then, no paid-plan terms apply.
        </p>
      </Section>

      <Section title="Service Changes">
        <p>
          We may update, suspend, or remove features as the product evolves. We
          may also update these terms when the service changes. We may suspend
          or terminate access if an account violates these terms, creates risk,
          or is used in a way that could harm Dish Genie, users, or third
          parties.
        </p>
      </Section>

      <Section title="Disclaimers">
        <p>
          Dish Genie is provided as is and as available. We do not guarantee
          that the service will be uninterrupted, error-free, secure, or that
          any recipe output will be accurate, complete, safe, or suitable for
          your needs.
        </p>
      </Section>

      <Section title="Limitation Of Liability">
        <p>
          To the fullest extent allowed by law, Dish Genie and its operators
          will not be liable for indirect, incidental, special, consequential,
          exemplary, or punitive damages, or for lost profits, lost data, food
          preparation issues, allergic reactions, health outcomes, or reliance
          on recipe output.
        </p>
      </Section>

      <Section title="Changes To These Terms">
        <p>
          We may update these Terms of Service from time to time. The updated
          date at the top of this page shows when the terms were last revised.
          Continued use of the app after an update means the new terms apply.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For service questions, email <ContactEmailLink />.
        </p>
      </Section>
    </div>

    <Link
      to="/privacy"
      className="mt-10 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-text transition-colors hover:bg-accent/90"
    >
      View Privacy Policy
    </Link>
  </article>
);
