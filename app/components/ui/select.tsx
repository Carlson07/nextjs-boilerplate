export function Select({ 
  children, 
  onValueChange, 
  defaultValue 
}: { 
  children: React.ReactNode; 
  onValueChange: (value: string) => void; 
  defaultValue?: string;
}) {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => onValueChange(e.target.value)}
      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children, className }: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 overflow-auto">
      {children}
    </div>
  );
}

export function SelectItem({ children, value }: { 
  children: React.ReactNode; 
  value: string;
}) {
  return (
    <option value={value}>{children}</option>
  );
}