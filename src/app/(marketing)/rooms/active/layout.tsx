// src/app/(marketing)/rooms/active/[roomId]/layout.tsx
export default function ActiveRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ This layout overrides the parent layout. 
  // It has NO container, NO navbar, NO footer, NO background.
  return (
    <div className="fixed inset-0 z-9999">
      {children}
    </div>
  );
}