// src/app/rooms/page.tsx
import { CreateRoomDialogWrapper } from "@/components/site/pages/rooms/create-room-dialog-wrapper";
import { RoomsSection } from "@/components/site/pages/rooms/rooms-section";

export default function RoomsPage() {
  return (
    <main className="py-10">
      {/* Header Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-[36px] font-normal tracking-[-0.02em] text-foreground sm:text-[48px]">
            Live Speaking Rooms
          </h1>
          <p className="mt-2 text-[16px] text-muted-foreground">
            Drop in, say hi, and start speaking with real people.
          </p>
        </div>

        <CreateRoomDialogWrapper />
      </div>

      {/* Room Grid */}
      <div className="mt-10">
        <RoomsSection />
      </div>
    </main>
  );
}