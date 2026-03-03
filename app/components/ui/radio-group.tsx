export function RadioGroup({ 
  children, 
  onValueChange, 
  className 
}: { 
  children: React.ReactNode; 
  onValueChange: (value: string) => void; 
  className?: string;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement<any>, {
          onValueChange,
        })
      )}
    </div>
  );
}

export function RadioGroupItem({ 
  value, 
  id, 
  checked, 
  onChange 
}: { 
  value: string; 
  id: string; 
  checked?: boolean; 
  onChange?: (value: string) => void;
}) {
  return (
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={() => onChange?.(value)}
      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
    />
  );
}