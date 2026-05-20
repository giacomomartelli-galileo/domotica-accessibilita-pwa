import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-border bg-card text-card-foreground shadow-md transition-all duration-300 hover:shadow-lg",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...rest}
    />
  );
}

export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const { className, ...rest } = props;
  return (
    <h3
      className={cn("text-xl font-semibold leading-none", className)}
      {...rest}
    />
  );
}

export function CardDescription(
  props: React.HTMLAttributes<HTMLParagraphElement>
) {
  const { className, ...rest } = props;
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...rest} />
  );
}

export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("p-6 pt-0", className)} {...rest} />;
}
