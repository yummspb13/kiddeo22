import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Черновик создания платежа — без реального вызова YooKassa, чтобы типы проходили */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, ticketTypeId, qty } = body as {
      slug: string;
      ticketTypeId?: number | string;
      qty?: number;
    };

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { slug },
      include: { tickets: true }, // <-- ВАЖНО: так называется связь в схеме
    });
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    if (!listing.tickets.length) {
      return NextResponse.json({ error: "No ticket types for listing" }, { status: 400 });
    }

    const idToFind =
      typeof ticketTypeId === "string" ? Number(ticketTypeId) : ticketTypeId ?? null;

    const tt =
      idToFind != null
        ? listing.tickets.find((t) => t.id === idToFind.toString())
        : listing.tickets[0];

    if (!tt) {
      return NextResponse.json({ error: "Ticket type not found" }, { status: 400 });
    }

    const qtySafe = Math.max(1, Number(qty ?? 1));
    const unit = Number(tt.price); // Prisma Decimal -> number
    const amountKopecks = Math.round(unit * 100) * qtySafe;

    // Здесь должен быть реальный вызов YooKassa. Пока возвращаем мок-ответ:
    return NextResponse.json({
      ok: true,
      listingId: listing.id,
      ticketTypeId: tt.id,
      qty: qtySafe,
      amountKopecks,
    });
  } catch (e) {
    console.error("yookassa/create error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
