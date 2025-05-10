export default function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2>Settings</h2>
      {children}
    </div>
  );
}
