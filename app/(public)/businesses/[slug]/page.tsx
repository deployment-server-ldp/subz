import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const business = await prisma.business.findUnique({ where: { slug: params.slug } });
  if (!business || business.status !== "APPROVED") return {};
  return { title: business.name, description: business.description };
}

export default async function BusinessDetailPage({ params }: { params: { slug: string } }) {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    include: { category: true, country: true, city: true, owner: true },
  });
  if (!business || business.status !== "APPROVED") notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm uppercase tracking-wide text-accent">{business.category.name}</p>
      <h1 className="font-display text-3xl font-semibold">{business.name}</h1>
      <p className="mt-1 text-muted-foreground">
        {[business.city?.name, business.country.name].filter(Boolean).join(", ")}
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <p className="text-sm text-muted-foreground">{business.description}</p>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <dl className="space-y-2 text-sm">
          {business.website ? (
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd>
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {business.website}
                </a>
              </dd>
            </div>
          ) : null}
          {business.contactMethod ? (
            <div>
              <dt className="text-muted-foreground">Contact</dt>
              <dd>{business.contactMethod}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted-foreground">Owner</dt>
            <dd>
              <Link href={`/members/${business.owner.slug}`} className="text-accent hover:underline">
                {business.owner.firstName} {business.owner.lastName}
              </Link>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
