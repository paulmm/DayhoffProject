export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Override parent padding for full-bleed layout
  return <div className="h-full">{children}</div>;
}
