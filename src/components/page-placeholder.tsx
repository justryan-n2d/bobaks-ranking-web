import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PagePlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Home
      </Link>
      <Card>
        <CardHeader>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</div>
          <CardTitle className="text-3xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-7 text-muted-foreground">{description}</CardContent>
      </Card>
    </div>
  );
}
