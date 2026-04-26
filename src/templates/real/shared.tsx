import type { ResumeData } from '@/types';
import { ReactNode } from 'react';

export interface TemplateProps {
  data: ResumeData;
}

export const Photo = ({
  data,
  size = 'md',
  shape = 'square',
  className = '',
}: {
  data: ResumeData;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'square' | 'circle' | 'rounded';
  className?: string;
}) => {
  const sizeMap = {
    sm: 'w-16 h-20',
    md: 'w-20 h-24',
    lg: 'w-24 h-28',
    xl: 'w-28 h-32',
  };
  const shapeClass =
    shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-lg' : 'rounded-sm';
  if (!data.personal?.photo) {
    return (
      <div
        className={`${sizeMap[size]} ${shapeClass} flex items-center justify-center text-white text-lg font-bold ${className}`}
        style={{ background: '#9CA3AF' }}
      >
        {(data.personal?.name || '?').charAt(0)}
      </div>
    );
  }
  return (
    <img
      src={data.personal.photo}
      alt={data.personal.name}
      className={`${sizeMap[size]} ${shapeClass} object-cover ${className}`}
    />
  );
};

export const SectionHeader = ({
  title,
  color = '#111827',
  line = true,
  lineColor = '#E5E7EB',
  icon,
}: {
  title: string;
  color?: string;
  line?: boolean;
  lineColor?: string;
  icon?: ReactNode;
}) => (
  <div className="flex items-center gap-2 mb-2">
    {icon && <span className="flex-shrink-0">{icon}</span>}
    <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
      {title}
    </h3>
    {line && <div className="flex-1 h-px ml-1" style={{ background: lineColor }} />}
  </div>
);

export const SkillBar = ({
  name,
  level,
  color = '#2563EB',
  bg = '#E5E7EB',
}: {
  name: string;
  level: number;
  color?: string;
  bg?: string;
}) => (
  <div className="mb-1.5">
    <div className="flex justify-between text-[10px] mb-0.5" style={{ color: '#4B5563' }}>
      <span>{name}</span>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
      <div className="h-full rounded-full" style={{ width: `${(level / 5) * 100}%`, background: color }} />
    </div>
  </div>
);

export const ContactItem = ({ label, value }: { label?: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="text-[10px] leading-relaxed" style={{ color: 'inherit' }}>
      {label && <span className="opacity-60 mr-1">{label}</span>}
      {value}
    </div>
  );
};

export const TimelineNode = ({
  color = '#2563EB',
  filled = true,
}: {
  color?: string;
  filled?: boolean;
}) => (
  <div
    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
    style={{
      background: filled ? color : 'transparent',
      border: `2px solid ${color}`,
    }}
  />
);

export const CircleIcon = ({
  children,
  color = '#2563EB',
  bg = '#EFF6FF',
  size = 'sm',
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
}) => {
  const s = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  return (
    <div
      className={`${s} rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0`}
      style={{ background: bg, color }}
    >
      {children}
    </div>
  );
};
