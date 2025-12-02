import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ActionCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: "primary" | "secondary";
  delay?: number;
}

const ActionCard = ({ to, icon: Icon, title, description, color, delay = 0 }: ActionCardProps) => {
  return (
    <Link
      to={to}
      className="group block animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative h-full overflow-hidden rounded-2xl bg-card p-6 card-shadow transition-all duration-300 hover:card-hover-shadow hover:-translate-y-1">
        {/* Accent bar */}
        <div
          className={`absolute left-0 top-0 h-1 w-full ${
            color === "primary" ? "bg-primary" : "bg-secondary"
          }`}
        />
        
        {/* Icon */}
        <div
          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${
            color === "primary"
              ? "bg-primary/10 text-primary"
              : "bg-secondary/10 text-secondary"
          }`}
        >
          <Icon className="h-7 w-7" />
        </div>

        {/* Content */}
        <h3 className="mb-2 text-lg font-semibold text-card-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {/* Arrow indicator */}
        <div
          className={`mt-4 flex items-center gap-1 text-sm font-medium transition-all duration-300 group-hover:gap-2 ${
            color === "primary" ? "text-primary" : "text-secondary"
          }`}
        >
          <span>Acessar</span>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default ActionCard;
