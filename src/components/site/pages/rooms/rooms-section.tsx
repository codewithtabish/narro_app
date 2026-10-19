// src/components/site/pages/rooms/rooms-section.tsx
import { getRooms } from "@/app/actions/rooms/get-rooms";
import { RoomCard } from "./room-card";

export async function RoomsSection() {
  const result = await getRooms();

  if (!result.success) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Could not load rooms right now. Please try again later.
      </div>
    );
  }

  if (result.rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="text-2xl">🎙️</span>
        </div>
        <h2 className="mt-4 font-serif text-2xl text-foreground">No live rooms right now</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Be the first to start a conversation! Create a room and invite others to practice with you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {result.rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
}