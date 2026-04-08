import React from 'react';
import { motion } from 'motion/react';

export interface SubSeat {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SeatArea {
  id: string;
  label: string;
  type: 'circle' | 'rect';
  x: number;
  y: number;
  width?: number;
  height?: number;
  r?: number;
  chairs: SubSeat[];
  selectable: boolean;
}

const SEATS: SeatArea[] = [
  // Left column (Circles)
  { 
    id: '9', label: '9', type: 'circle', x: 60, y: 40, r: 20, selectable: true,
    chairs: [
      { id: '9-1', x: 45, y: 10, width: 12, height: 12 },
      { id: '9-2', x: 75, y: 25, width: 12, height: 12 },
      { id: '9-3', x: 60, y: 65, width: 12, height: 12 },
    ]
  },
  { 
    id: '8', label: '8', type: 'circle', x: 30, y: 100, r: 20, selectable: true,
    chairs: [
      { id: '8-1', x: 10, y: 75, width: 12, height: 12 },
      { id: '8-2', x: 45, y: 85, width: 12, height: 12 },
      { id: '8-3', x: 25, y: 125, width: 12, height: 12 },
    ]
  },
  { 
    id: '7', label: '7', type: 'circle', x: 30, y: 180, r: 20, selectable: true,
    chairs: [
      { id: '7-1', x: 10, y: 155, width: 12, height: 12 },
      { id: '7-2', x: 45, y: 165, width: 12, height: 12 },
      { id: '7-3', x: 25, y: 205, width: 12, height: 12 },
    ]
  },
  { 
    id: '6', label: '6', type: 'circle', x: 30, y: 260, r: 20, selectable: true,
    chairs: [
      { id: '6-1', x: 10, y: 235, width: 12, height: 12 },
      { id: '6-2', x: 45, y: 245, width: 12, height: 12 },
      { id: '6-3', x: 25, y: 285, width: 12, height: 12 },
    ]
  },
  { id: 'supervisor', label: '감독', type: 'circle', x: 30, y: 340, r: 20, selectable: false, chairs: [] },

  // Middle column (Large tables)
  { 
    id: '5', label: '5', type: 'rect', x: 100, y: 80, width: 60, height: 100, selectable: true,
    chairs: [
      { id: '5-1', x: 82, y: 90, width: 12, height: 20 },
      { id: '5-2', x: 82, y: 120, width: 12, height: 20 },
      { id: '5-3', x: 82, y: 150, width: 12, height: 20 },
      { id: '5-4', x: 166, y: 90, width: 12, height: 20 },
      { id: '5-5', x: 166, y: 120, width: 12, height: 20 },
      { id: '5-6', x: 166, y: 150, width: 12, height: 20 },
    ]
  },
  { 
    id: '4', label: '4', type: 'rect', x: 100, y: 240, width: 60, height: 100, selectable: true,
    chairs: [
      { id: '4-1', x: 82, y: 250, width: 12, height: 20 },
      { id: '4-2', x: 82, y: 280, width: 12, height: 20 },
      { id: '4-3', x: 82, y: 310, width: 12, height: 20 },
      { id: '4-4', x: 166, y: 250, width: 12, height: 20 },
      { id: '4-5', x: 166, y: 280, width: 12, height: 20 },
      { id: '4-6', x: 166, y: 310, width: 12, height: 20 },
    ]
  },

  // Right column (Rooms)
  { 
    id: '3', label: '3', type: 'rect', x: 220, y: 40, width: 60, height: 80, selectable: true,
    chairs: [
      { id: '3-1', x: 202, y: 45, width: 12, height: 18 },
      { id: '3-2', x: 202, y: 70, width: 12, height: 18 },
      { id: '3-3', x: 202, y: 95, width: 12, height: 18 },
      { id: '3-4', x: 286, y: 45, width: 12, height: 18 },
      { id: '3-5', x: 286, y: 70, width: 12, height: 18 },
      { id: '3-6', x: 286, y: 95, width: 12, height: 18 },
    ]
  },
  { 
    id: '2', label: '2', type: 'rect', x: 220, y: 160, width: 60, height: 80, selectable: true,
    chairs: [
      { id: '2-1', x: 202, y: 165, width: 12, height: 18 },
      { id: '2-2', x: 202, y: 190, width: 12, height: 18 },
      { id: '2-3', x: 202, y: 215, width: 12, height: 18 },
      { id: '2-4', x: 286, y: 165, width: 12, height: 18 },
      { id: '2-5', x: 286, y: 190, width: 12, height: 18 },
      { id: '2-6', x: 286, y: 215, width: 12, height: 18 },
    ]
  },
  { 
    id: '1', label: '1', type: 'rect', x: 220, y: 280, width: 60, height: 80, selectable: true,
    chairs: [
      { id: '1-1', x: 202, y: 285, width: 12, height: 18 },
      { id: '1-2', x: 202, y: 310, width: 12, height: 18 },
      { id: '1-3', x: 202, y: 335, width: 12, height: 18 },
      { id: '1-4', x: 286, y: 285, width: 12, height: 18 },
      { id: '1-5', x: 286, y: 310, width: 12, height: 18 },
      { id: '1-6', x: 286, y: 335, width: 12, height: 18 },
    ]
  },
];

interface SeatMapProps {
  selectedSeatId: string | null;
  onSelectSeat: (seatId: string) => void;
  reservations: any[];
}

export const TOTAL_TABLES = SEATS.filter(s => s.selectable).length;

export default function SeatMap({ selectedSeatId, onSelectSeat, reservations }: SeatMapProps) {
  const reservedSeatMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    reservations.forEach(r => {
      map[r.seatId] = r.userName || '예약됨';
    });
    return map;
  }, [reservations]);

  return (
    <div className="w-full max-w-md mx-auto bg-gray-50 rounded-xl p-4 shadow-inner border border-gray-200">
      <svg viewBox="0 0 300 400" className="w-full h-auto">
        {/* Background lines for rooms/walls */}
        <line x1="200" y1="20" x2="200" y2="380" stroke="#e5e7eb" strokeWidth="2" />
        <line x1="200" y1="140" x2="290" y2="140" stroke="#e5e7eb" strokeWidth="2" />
        <line x1="200" y1="260" x2="290" y2="260" stroke="#e5e7eb" strokeWidth="2" />

        {SEATS.map((area) => {
          const userName = reservedSeatMap[area.id];
          const isReserved = !!userName;
          const isSelected = selectedSeatId === area.id;
          const isSelectable = area.selectable;

          const areaFill = isReserved
            ? '#fee2e2'
            : isSelected
            ? '#dbeafe'
            : '#f3f4f6';

          const areaStroke = isReserved
            ? '#ef4444'
            : isSelected
            ? '#3b82f6'
            : '#d1d5db';

          return (
            <motion.g 
              key={area.id}
              whileHover={isSelectable && !isReserved ? { scale: 1.02 } : {}}
              whileTap={isSelectable && !isReserved ? { scale: 0.98 } : {}}
              onClick={() => isSelectable && !isReserved && onSelectSeat(area.id)}
              className={isSelectable && !isReserved ? 'cursor-pointer' : isSelectable ? 'cursor-not-allowed' : ''}
            >
              {/* Main Area (Table/Circle) */}
              {area.type === 'circle' ? (
                <circle
                  cx={area.x}
                  cy={area.y}
                  r={area.r}
                  fill={areaFill}
                  stroke={areaStroke}
                  strokeWidth={isSelected || isReserved ? "2" : "1"}
                  className="transition-colors duration-200"
                />
              ) : (
                <rect
                  x={area.x}
                  y={area.y}
                  width={area.width}
                  height={area.height}
                  rx="4"
                  fill={areaFill}
                  stroke={areaStroke}
                  strokeWidth={isSelected || isReserved ? "2" : "1"}
                  className="transition-colors duration-200"
                />
              )}
              <text
                x={area.type === 'circle' ? area.x : area.x + (area.width || 0) / 2}
                y={area.type === 'circle' ? area.y : area.y + (area.height || 0) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[10px] font-bold select-none ${
                  isReserved ? 'fill-red-600' : isSelected ? 'fill-blue-600' : 'fill-gray-400'
                }`}
              >
                {area.label}
              </text>

              {/* Individual Chairs (Decorative) */}
              {area.chairs.map((chair) => (
                <rect
                  key={chair.id}
                  x={chair.x}
                  y={chair.y}
                  width={chair.width}
                  height={chair.height}
                  rx="2"
                  fill={isReserved ? '#fecaca' : isSelected ? '#bfdbfe' : '#ffffff'}
                  stroke={isReserved ? '#f87171' : isSelected ? '#60a5fa' : '#9ca3af'}
                  strokeWidth="0.5"
                  className="transition-colors duration-200"
                />
              ))}

              {/* Reservation Name */}
              {isReserved && (
                <text
                  x={area.type === 'circle' ? area.x : area.x + (area.width || 0) / 2}
                  y={area.type === 'circle' ? area.y + area.r! + 8 : area.y + area.height! + 8}
                  textAnchor="middle"
                  className="text-[7px] fill-red-600 font-bold select-none"
                >
                  {userName}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
      <div className="mt-4 flex justify-center gap-4 text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-gray-400 rounded-sm"></div>
          <span>예약 가능</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded-sm"></div>
          <span>선택됨</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border border-red-500 rounded-sm"></div>
          <span>예약됨</span>
        </div>
      </div>
    </div>
  );
}
