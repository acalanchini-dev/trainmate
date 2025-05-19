import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AnthropometricData } from '@/types/anthropometric';
import { ChartPie, ChartLine, ChartColumn } from 'lucide-react';

interface ChartDataType {
  id: string;
  label: string;
  key: string;
  unit: string;
  icon: React.ReactNode;
  domain: [string, string];
  color: string;
}

const chartDataTypes: ChartDataType[] = [
  {
    id: "peso",
    label: "Peso",
    key: "peso",
    unit: "Kg",
    icon: <ChartLine className="h-4 w-4" />,
    domain: ['dataMin - 5', 'dataMax + 5'],
    color: "var(--weight-color, #10b981)"
  },
  {
    id: "altezza",
    label: "Altezza",
    key: "altezza",
    unit: "cm",
    icon: <ChartColumn className="h-4 w-4" />,
    domain: ['dataMin - 10', 'dataMax + 10'],
    color: "var(--height-color, #3b82f6)"
  },
  {
    id: "grasso",
    label: "Grasso Corporeo",
    key: "grassoPerc",
    unit: "%",
    icon: <ChartPie className="h-4 w-4" />,
    domain: ['dataMin - 2', 'dataMax + 2'],
    color: "var(--body-fat-color, #f59e0b)"
  },
  {
    id: "vita",
    label: "Circonferenza Vita",
    key: "vita",
    unit: "cm",
    icon: <ChartLine className="h-4 w-4" />,
    domain: ['dataMin - 5', 'dataMax + 5'],
    color: "var(--waist-color, #ec4899)"
  },
  {
    id: "fianchi",
    label: "Circonferenza Fianchi",
    key: "fianchi",
    unit: "cm",
    icon: <ChartLine className="h-4 w-4" />,
    domain: ['dataMin - 5', 'dataMax + 5'],
    color: "var(--hip-color, #8b5cf6)"
  },
  {
    id: "torace",
    label: "Circonferenza Torace",
    key: "torace",
    unit: "cm",
    icon: <ChartLine className="h-4 w-4" />,
    domain: ['dataMin - 5', 'dataMax + 5'],
    color: "var(--chest-color, #06b6d4)"
  },
  {
    id: "coscia",
    label: "Circonferenza Coscia",
    key: "coscia",
    unit: "cm",
    icon: <ChartLine className="h-4 w-4" />,
    domain: ['dataMin - 5', 'dataMax + 5'],
    color: "var(--thigh-color, #84cc16)"
  },
  {
    id: "braccio",
    label: "Circonferenza Braccio",
    key: "braccio",
    unit: "cm",
    icon: <ChartLine className="h-4 w-4" />,
    domain: ['dataMin - 5', 'dataMax + 5'],
    color: "var(--arm-color, #f97316)"
  }
];

interface AnthropometricChartProps {
  data: AnthropometricData[];
}

export function AnthropometricChartPlaceholder({ data = [] }: AnthropometricChartProps) {
  const [selectedDataType, setSelectedDataType] = React.useState<string>("peso");

  // Verifichiamo se ci sono dati disponibili
  if (!data || data.length === 0) {
    return (
      <div className="mt-6 p-4 border rounded-lg">
        <h3 className="text-lg font-medium mb-4">Cronologia misurazioni</h3>
        <p className="text-sm text-muted-foreground">
          Non ci sono ancora dati disponibili per visualizzare i grafici.
        </p>
      </div>
    );
  }

  // Prepariamo i dati per il grafico, ordinando per data
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      date: format(new Date(item.date), 'dd/MM/yyyy', { locale: it }),
      peso: item.weight,
      altezza: item.height,
      grassoPerc: item.body_fat_percentage,
      vita: item.waist_circumference,
      fianchi: item.hip_circumference,
      torace: item.chest_circumference,
      coscia: item.thigh_circumference,
      braccio: item.arm_circumference
    }));

  const selectedType = chartDataTypes.find(type => type.id === selectedDataType) || chartDataTypes[0];

  return (
    <div className="mt-6 border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">Cronologia misurazioni</h3>
        <p className="text-sm text-muted-foreground">
          Visualizza l'andamento delle tue misurazioni nel tempo
        </p>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <Select value={selectedDataType} onValueChange={setSelectedDataType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleziona il dato da visualizzare">
                <div className="flex items-center gap-2">
                  {selectedType.icon}
                  <span>{selectedType.label}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {chartDataTypes.map(type => (
                <SelectItem 
                  key={type.id} 
                  value={type.id}
                  className="flex items-center gap-2"
                >
                  {type.icon}
                  <span>{type.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

          <AspectRatio ratio={16/9}>
          <ChartContainer config={{ color: selectedType.color }}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  label={{ value: 'Data', position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis 
                label={{ value: selectedType.unit, angle: -90, position: 'insideLeft' }}
                domain={selectedType.domain}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                dataKey={selectedType.key}
                name={`${selectedType.label} (${selectedType.unit})`}
                stroke={selectedType.color}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ChartContainer>
          </AspectRatio>
      </div>
    </div>
  );
}
