import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { Attributes } from "@/lib/mock-data";
import { ATTR_LABELS, ATTR_ORDER } from "@/lib/mock-data";

export function AttributeRadar({ attributes }: { attributes: Attributes }) {
  const data = ATTR_ORDER.map((k) => ({
    attr: ATTR_LABELS[k],
    value: attributes[k],
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="oklch(0.42 0.02 260)" />
          <PolarAngleAxis
            dataKey="attr"
            tick={{ fill: "oklch(0.85 0.005 260)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 10 }}
            stroke="oklch(0.4 0.02 260)"
          />
          <Radar
            name="Atributos"
            dataKey="value"
            stroke="oklch(0.92 0.24 125)"
            fill="oklch(0.92 0.24 125)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
