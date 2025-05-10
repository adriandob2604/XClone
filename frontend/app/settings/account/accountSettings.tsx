import Link from "next/link";

export default function AccountSettings() {
  return (
    <>
      <main>
        <div>
          <Link href={`/settings/account`}>Your account</Link>
          <Link href={`/settings/security_and_account_access`}>
            Security and account access
          </Link>
          <Link href={`/settings/privacy_and_safety`}>Privacy and safety</Link>
          <Link href={`/settings/notifications`}>Notifications</Link>
          <Link href={`/settings/accessibility_display_and_languages`}>
            Accessibility, display, and languages
          </Link>
        </div>
      </main>
    </>
  );
}
