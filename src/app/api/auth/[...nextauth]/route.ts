export async function GET() {
  return new Response("Auth GET Route Active", { status: 200 });
}

export async function POST() {
  return new Response("Auth POST Route Active", { status: 200 });
}